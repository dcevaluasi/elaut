import CryptoJS from 'crypto-js';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { MateriPelatihan } from '@/types/product';

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

export function formatIndonesianDateFromString(input: string): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Split the input by "-"
  const [month, day, year] = input.split("-").map(Number);

  // Format the year (assuming 20XX for two-digit years)
  const fullYear = year < 50 ? 2000 + year : 1900 + year;

  const monthName = months[month - 1];

  return `${day} ${monthName} ${fullYear}`;
}

export function generateRandomString(source: string, length: number): string {
  if (length <= 0) {
    throw new Error("Length must be greater than 0");
  }

  let result = "";
  const sourceLength = source.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * sourceLength);
    result += source[randomIndex];
  }

  return result;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array]; // Create a copy to avoid mutating the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
}



const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || ''

// Encrypt function
export const encryptValue = (value: string | number): string => {
  const ciphertext = CryptoJS.AES.encrypt(value.toString(), SECRET_KEY).toString();
  return encodeURIComponent(ciphertext); // URL safe
};

// Decrypt function
export const decryptValue = (encryptedValue: string): string => {
  const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedValue), SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};


export const calculateTotalHoursCertificateBPPP = (data: MateriPelatihan[]) => {
  let totalTheory = 0
  let totalPractice = 0

  data.forEach((materi) => {
    totalTheory += Number(materi.JamTeory) || 0
    totalPractice += Number(materi.JamPraktek) || 0
  })

  return { totalTheory, totalPractice }
}