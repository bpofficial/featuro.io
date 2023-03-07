import { Paginated } from './types/paginated';

export class Api {

    private readonly isDev: boolean;
    private headers: Record<string, string> = {};

    constructor(private baseUrl: string, private readonly serviceName: string, dev = false) {
        this.isDev = dev;

        if (this.isDev) {
            this.headers = {
                'sls-offline-authorizer-override': JSON.stringify({
                    "context": {
                        "sub": "offline-tester", 
                        "org": "11111111-1111-1111-1111-111111111111",
                        "permissions": [
                            // Environments
                            "create:environment",
                            "read:environment",
                            "update:environment",
                            "delete:environment",
                            // Projects
                            "create:project",
                            "read:project",
                            "update:project",
                            "delete:project",
                            // Features
                            "create:feature",
                            "read:feature",
                            "update:feature",
                            "delete:feature",
                        ]
                    }
                })
            }
        }
    }

    async create<T>(url: string, body: T, signal?: AbortController['signal']) {
        return this.request('POST', url, body, { signal });
    }
    async update<T>(url: string, body: T, signal?: AbortController['signal']) {
        await this.request('PUT', url, body, { signal });
    }
    async delete(url: string, signal?: AbortController['signal']) {
        await this.request('DELETE', url, null, { signal })
    }
    async retrieve<T>(url: string, signal?: AbortController['signal']): Promise<T extends Array<any> ? Paginated<T> : T> {
        return this.request('GET', url, null, { signal }) as any;
    }

    private async request<T>(method: string, url: string, data?: T, options: RequestInit = {}): Promise<unknown> {
        try {
            const response = await fetch(this.baseUrl + url, { 
                method, 
                body: data ? JSON.stringify(data) : undefined,
                headers: {
                    ...this.headers,
                    ...(options.headers)
                },
                signal: options.signal,
                credentials: !this.isDev ? "include" : "omit"
            });

            const result = await response.text();
            const json = !result ? {} : JSON.parse(result);
            return json;
        } catch (err) {
            console.warn(err);
            throw err;
        }
    }

    clone(serviceName: string) {
        return new Api(this.baseUrl, serviceName, this.isDev);
    }

    setPort(port: string) {
        if (this.isDev) {
            this.baseUrl = this.baseUrl.replace('{port}', port)
        }
    }

    setHost(host: string) {
        this.baseUrl = this.baseUrl.replace('{host}', host)
    }

    setScheme(scheme: string) {
        this.baseUrl = this.baseUrl.replace('{scheme}', scheme)
    }

    setVersion(version: string) {
        this.baseUrl = this.baseUrl.replace('{version}', version)
    }
}