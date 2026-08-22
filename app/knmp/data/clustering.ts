import { CoordinatePoint } from './coordinates';
import { UptKkpPoint } from './upt_kkp';

// ─── Constants ─────────────────────────────────────────────────────────────
/** Minimum peserta per UPT agar sesi pelatihan layak diselenggarakan */
export const MIN_PERSONS_PER_UPT = 100;
/** Asumsi jumlah peserta per titik KNMP */
export const PERSONS_PER_KNMP = 8;
/** Minimum titik KNMP per UPT = ceil(100 / 8) = 13 */
export const MIN_KNMP_PER_UPT = Math.ceil(MIN_PERSONS_PER_UPT / PERSONS_PER_KNMP);

// ─── Haversine Distance ─────────────────────────────────────────────────────
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ClusteredCoordinatePoint extends CoordinatePoint {
  nearestUpt: UptKkpPoint;
  distanceKm: number;
  /** true jika titik ini direlokasi dari UPT terdekat akibat constraint kapasitas */
  isRedistributed?: boolean;
  /** Nama UPT terdekat asli sebelum redistribusi */
  originalNearestUptName?: string;
}

export interface UptClusterSummary {
  upt: UptKkpPoint;
  assignedPointsCount: number;
  assignedPoints: ClusteredCoordinatePoint[];
  minDistanceKm: number;
  maxDistanceKm: number;
  avgDistanceKm: number;
  /** Jumlah peserta = assignedPointsCount × PERSONS_PER_KNMP */
  totalPersons: number;
  /** Apakah memenuhi minimum 100 peserta */
  meetsMinimum: boolean;
  /** Jumlah titik yang direlokasi ke UPT ini dari UPT lain */
  redistributedCount: number;
}

// ─── Simple Nearest-Neighbor ────────────────────────────────────────────────
export function getNearestUpt(
  point: CoordinatePoint,
  uptList: UptKkpPoint[]
): { nearestUpt: UptKkpPoint; distanceKm: number } {
  let minDistance = Infinity;
  let closestUpt = uptList[0];

  for (const upt of uptList) {
    const dist = calculateDistanceKm(point.lat, point.lng, upt.lat, upt.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestUpt = upt;
    }
  }

  return { nearestUpt: closestUpt, distanceKm: minDistance };
}

export function getClustered100Points(points: CoordinatePoint[], uptList: UptKkpPoint[]): ClusteredCoordinatePoint[] {
  return points.map((p) => {
    const { nearestUpt, distanceKm } = getNearestUpt(p, uptList);
    return { ...p, nearestUpt, distanceKm };
  });
}

// ─── Capacity-Constrained Clustering ───────────────────────────────────────
/**
 * Clustering dengan constraint kapasitas minimum:
 * - Setiap titik KNMP mewakili PERSONS_PER_KNMP (8) peserta
 * - Setiap UPT harus memiliki minimal MIN_PERSONS_PER_UPT (100) peserta = 13 titik
 * - UPT yang mendapat < 13 titik akan dikonsolidasi: titiknya dialihkan ke UPT terdekat
 *   yang sudah memenuhi kuota, sehingga penyelenggaraan pelatihan lebih viable
 * - Algoritma: iterative consolidation — eliminasi UPT terkecil sampai semua UPT
 *   yang aktif memenuhi minimum atau tidak ada lagi yang bisa dikonsolidasi
 */
export function getCapacityAwareClustering(
  points: CoordinatePoint[],
  uptList: UptKkpPoint[]
): ClusteredCoordinatePoint[] {
  if (!uptList.length) return [];
  if (!points.length) return [];

  // Build distance lookup: sorted UPTs by distance for each point
  const sortedUptsForPoint = new Map<number, Array<{ upt: UptKkpPoint; dist: number }>>();
  points.forEach((p) => {
    const sorted = uptList
      .map((upt) => ({ upt, dist: calculateDistanceKm(p.lat, p.lng, upt.lat, upt.lng) }))
      .sort((a, b) => a.dist - b.dist);
    sortedUptsForPoint.set(p.id, sorted);
  });

  // Initial nearest-neighbor assignment
  const assignment = new Map<number, number>(); // pointId -> uptId
  const originalNearest = new Map<number, { upt: UptKkpPoint; dist: number }>();

  points.forEach((p) => {
    const nearest = sortedUptsForPoint.get(p.id)![0];
    assignment.set(p.id, nearest.upt.id);
    originalNearest.set(p.id, nearest);
  });

  // Iterative consolidation: eliminate UPTs below minimum
  // Max iterations = number of UPTs (worst case: one eliminated per round)
  const MAX_ROUNDS = uptList.length;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    // Count assignments per UPT
    const uptPointIds = new Map<number, number[]>();
    uptList.forEach((u) => uptPointIds.set(u.id, []));
    assignment.forEach((uptId, pointId) => {
      uptPointIds.get(uptId)!.push(pointId);
    });

    // Find UPTs that have some but not enough points (under minimum)
    const belowMinUpts = uptList
      .filter((u) => {
        const count = uptPointIds.get(u.id)!.length;
        return count > 0 && count < MIN_KNMP_PER_UPT;
      })
      .sort((a, b) => uptPointIds.get(a.id)!.length - uptPointIds.get(b.id)!.length);

    if (belowMinUpts.length === 0) break; // Convergence: all active UPTs meet minimum

    // Consolidate the smallest under-minimum UPT:
    // reassign each of its points to their next-best available UPT
    const targetUpt = belowMinUpts[0];
    const targetPointIds = uptPointIds.get(targetUpt.id)!;

    targetPointIds.forEach((pointId) => {
      const sorted = sortedUptsForPoint.get(pointId)!;
      // Find the next best UPT that is not this under-minimum one
      const nextBest = sorted.find(({ upt }) => upt.id !== targetUpt.id);
      if (nextBest) {
        assignment.set(pointId, nextBest.upt.id);
      }
    });
  }

  // Build final result with redistribution metadata
  const uptById = new Map(uptList.map((u) => [u.id, u]));

  return points.map((p) => {
    const assignedUptId = assignment.get(p.id)!;
    const assignedUpt = uptById.get(assignedUptId)!;
    const orig = originalNearest.get(p.id)!;
    const assignedEntry = sortedUptsForPoint.get(p.id)!.find((x) => x.upt.id === assignedUptId);
    const assignedDist = assignedEntry?.dist ?? orig.dist;
    const wasRedistributed = assignedUptId !== orig.upt.id;

    return {
      ...p,
      nearestUpt: assignedUpt,
      distanceKm: Number(assignedDist.toFixed(1)),
      isRedistributed: wasRedistributed,
      originalNearestUptName: wasRedistributed ? orig.upt.name : undefined,
    } as ClusteredCoordinatePoint;
  });
}

// ─── Summary Calculation ────────────────────────────────────────────────────
export function getUptClusterSummaries(
  clusteredPoints: ClusteredCoordinatePoint[],
  uptList: UptKkpPoint[]
): UptClusterSummary[] {
  return uptList.map((upt) => {
    const assigned = clusteredPoints.filter((p) => p.nearestUpt.id === upt.id);
    const count = assigned.length;
    const redistributedCount = assigned.filter((p) => p.isRedistributed).length;

    let minDist = 0;
    let maxDist = 0;
    let avgDist = 0;

    if (count > 0) {
      const distances = assigned.map((p) => p.distanceKm);
      minDist = Math.min(...distances);
      maxDist = Math.max(...distances);
      avgDist = Number((distances.reduce((a, b) => a + b, 0) / count).toFixed(1));
    }

    const totalPersons = count * PERSONS_PER_KNMP;

    return {
      upt,
      assignedPointsCount: count,
      assignedPoints: assigned,
      minDistanceKm: minDist,
      maxDistanceKm: maxDist,
      avgDistanceKm: avgDist,
      totalPersons,
      meetsMinimum: totalPersons >= MIN_PERSONS_PER_UPT,
      redistributedCount,
    };
  });
}
