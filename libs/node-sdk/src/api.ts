import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = '';

async function request<T, K>(method: string, url: string, data: T, options: AxiosRequestConfig<any>): Promise<unknown> {
    try {
        const response = await axios.request({
            method,
            url,
            data,
            ...options
        })
        return response.data as unknown;
    } catch (err) {
        console.warn(err);
        throw err;
    }
}

export const api = {
    async create<T>(url: string, body: T) {
        return request('POST', BASE_URL + url, body, { withCredentials: true });
    },
    async update<T>(url: string, body: T) {
        await request('PUT', BASE_URL + url, body, { withCredentials: true });
    },
    async delete(url: string) {
        await request('DELETE', BASE_URL + url, null, { withCredentials: true })
    },
    async retrieve(url: string) {
        return request('GET', url, null, { withCredentials: true })
    }
}