'use client'

import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { User } from '@/types/user'
import { elautBaseUrl } from '@/constants/urls'

/* =====================================================================
 * Store bersama (memori saja — data pribadi TIDAK disimpan ke storage)
 * - 1 request dipakai bersama semua komponen (dedupe in-flight)
 * - Cache per token, fresh 5 menit (endpoint ini sangat berat)
 * - Stale-while-revalidate: data lama langsung tampil, refresh di belakang
 * - Tanpa timeout: endpoint mengirim SEMUA peserta dan bisa > 2 menit
 * ===================================================================== */

const ENDPOINT = `${elautBaseUrl}/lemdik/getAllUsers`
const STALE_MS = 5 * 120_000

export type LoadProgress = { startedAt: number; loadedBytes: number; totalBytes: number | null } | null

type Cache = { token: string; data: User[]; at: number }

let cache: Cache | null = null
let inflight: { token: string; promise: Promise<User[]> } | null = null
let progress: LoadProgress = null

const dataListeners = new Set<(data: User[]) => void>()
const progressListeners = new Set<(p: LoadProgress) => void>()

const setProgress = (p: LoadProgress) => {
  progress = p
  progressListeners.forEach((l) => l(p))
}

const getToken = () => Cookies.get('XSRF091') || Cookies.get('XSRF081') || ''
const isFresh = (token: string) => !!cache && cache.token === token && Date.now() - cache.at < STALE_MS
const cachedFor = (token: string) => (cache && cache.token === token ? cache.data : null)

/** Normalisasi berbagai bentuk respons API → array */
const normalize = (body: any): User[] => {
  if (Array.isArray(body)) return body
  for (const key of ['data', 'users', 'Users']) if (Array.isArray(body?.[key])) return body[key]
  return []
}

function load(force: boolean): Promise<User[]> {
  const token = getToken()
  if (!token) return Promise.reject(new Error('Sesi login tidak ditemukan. Silakan login ulang.'))
  if (!force && isFresh(token)) return Promise.resolve(cache!.data)
  if (inflight && inflight.token === token) return inflight.promise

  setProgress({ startedAt: Date.now(), loadedBytes: 0, totalBytes: null })

  const promise = axios
    .get(ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 0, // tanpa batas — override timeout global axios
      onDownloadProgress: (e) =>
        setProgress({
          startedAt: progress?.startedAt ?? Date.now(),
          loadedBytes: e.loaded,
          totalBytes: e.total ?? null,
        }),
    })
    .then((res) => {
      const data = normalize(res.data)
      cache = { token, data, at: Date.now() }
      dataListeners.forEach((l) => l(data))
      return data
    })
    .finally(() => {
      if (inflight?.promise === promise) inflight = null
      setProgress(null)
    })

  inflight = { token, promise }
  return promise
}

/** Paksa refresh untuk semua komponen yang memakai hook ini */
export const invalidateUsers = () => load(true)

/**
 * API sama seperti sebelumnya: { users, loading, error, fetchUsers } + progress.
 * - Data otomatis dimuat saat mount (pakai cache bila masih fresh).
 * - fetchUsers() = paksa ambil terbaru; fetchUsers(false) = pakai cache bila ada.
 */
export function useFetchAllUsers() {
  const [users, setUsers] = useState<User[]>(() => cachedFor(getToken()) ?? [])
  const [loading, setLoading] = useState<boolean>(() => !isFresh(getToken()))
  const [error, setError] = useState<unknown>(null)
  const [prog, setProg] = useState<LoadProgress>(progress)

  useEffect(() => {
    dataListeners.add(setUsers)
    progressListeners.add(setProg)
    return () => {
      dataListeners.delete(setUsers)
      progressListeners.delete(setProg)
    }
  }, [])

  const run = useCallback(async (force: boolean) => {
    const token = getToken()
    if (!force && isFresh(token)) {
      setUsers(cache!.data)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setUsers(await load(force))
    } catch (err) {
      console.error('Error fetching all users:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    run(false)
  }, [run])

  const fetchUsers = useCallback((force: boolean = true) => run(force), [run])

  return { users, loading, error, fetchUsers, progress: prog }
}
