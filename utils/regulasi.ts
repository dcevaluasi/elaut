import axios from "axios";
import Cookies from "js-cookie";

const elautBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export interface RegulasiData {
    id?: string | number;
    kategori_regulasi: string;
    tanggal_pengundangan: string;
    tahun: number | string;
    no_peraturan: string;
    judul: string;
    ruang_lingkup: string;
    sumber: string;
    status: string;
    perubahan_turunan_terkait: string;
    file: string;
    created_at?: string;
    updated_at?: string;
}

export const getRegulasi = async (): Promise<RegulasiData[]> => {
    try {
        const response = await axios.get(`${elautBaseUrl}/regulasi_pelatihan/get_regulasi_pelatihan?_t=${Date.now()}`);
        if (response.data && Array.isArray(response.data.Data)) {
            return response.data.Data;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching regulasi:", error);
        return []; // return empty array on error to prevent map is not a function
    }
};

export const getRegulasiById = async (id: number | string): Promise<RegulasiData> => {
    try {
        const response = await axios.get(`${elautBaseUrl}/regulasi_pelatihan/get_regulasi_pelatihan_by_id?id=${id}`);
        return response.data.data || response.data;
    } catch (error) {
        console.error("Error fetching regulasi by id:", error);
        throw error;
    }
};

export const createRegulasi = async (data: RegulasiData | FormData): Promise<RegulasiData> => {
    try {
        const token = Cookies.get('XSRF091');
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        
        const response = await axios.post(
            `${elautBaseUrl}/regulasi_pelatihan/create_regulasi_pelatihan`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    ...(isFormData ? { "Content-Type": "multipart/form-data" } : {})
                }
            }
        );
        return response.data.data || response.data;
    } catch (error: any) {
        console.error("Error creating regulasi:", error?.response?.data || error);
        throw new Error(error?.response?.data?.message || error?.response?.data?.Pesan || "Gagal membuat regulasi");
    }
};

export const updateRegulasi = async (data: RegulasiData | FormData): Promise<RegulasiData> => {
    try {
        const token = Cookies.get('XSRF091');
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

        let id: string = '';
        if (isFormData) {
            id = (data as FormData).get('id') as string;
        } else {
            id = String((data as RegulasiData).id ?? '');
        }

        // Use native fetch for more reliable multipart/form-data with PUT
        const response = await fetch(
            `${elautBaseUrl}/regulasi_pelatihan/update_regulasi_pelatihan?id=${id}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Do NOT set Content-Type manually — browser sets it with correct boundary for FormData
                },
                body: isFormData ? data as FormData : JSON.stringify(data),
            }
        );

        const json = await response.json();
        if (!response.ok) {
            throw new Error(json?.Pesan || json?.message || `HTTP error ${response.status}`);
        }
        return json.data || json.Data || json;
    } catch (error: any) {
        console.error("Error updating regulasi:", error?.response?.data || error);
        throw new Error(error?.message || "Gagal mengubah regulasi");
    }
};


export const deleteRegulasi = async (id: number | string): Promise<boolean> => {
    try {
        const token = Cookies.get('XSRF091');
        await axios.delete(
            `${elautBaseUrl}/regulasi_pelatihan/delete_regulasi_pelatihan?id=${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return true;
    } catch (error: any) {
        console.error("Error deleting regulasi:", error?.response?.data || error);
        throw new Error(error?.response?.data?.message || error?.response?.data?.Pesan || "Gagal menghapus regulasi");
    }
};
