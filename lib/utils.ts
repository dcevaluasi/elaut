import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLastValuePath(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

export function generateInstrukturName(names: string) {
  const instruktur = names.split('/')
  return instruktur
}

export function getMonthName(monthValue: string) {
  const months: any = {
    "01": "Januari",
    "02": "Februari",
    "03": "Maret",
    "04": "April",
    "05": "Mei",
    "06": "Juni",
    "07": "Juli",
    "08": "Agustus",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Desember"
  };

  return months[monthValue] || "Invalid month";
}

export const generateRandomId = (): string => {
  return `${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

export function replaceUrl(input: string): string {
  const oldUrl = 'https://192.168.12.97:81/';
  const newUrl = 'https://elaut-bppsdm.kkp.go.id/api-elaut/';

  return input.replace(oldUrl, newUrl);
}

export function formatToRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
}