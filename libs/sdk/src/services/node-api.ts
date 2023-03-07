import { Api } from "../api";
import { projects } from "./projects";

interface ApiOptions {
    host?: string;
    version: string;
    __isDev?: boolean;
}

export function FeaturoAdminApi(opts: ApiOptions) {
    const url = '{scheme}://{host}:{port}/api/{version}';
    const api = new Api(url, 'root', !!opts.__isDev);

    api.setScheme(opts.__isDev ? 'http' : 'https');
    api.setHost(opts.__isDev ? 'localhost' : 'unknown');
    api.setVersion(opts.version);

    return { 
        projects: projects(api)
    };
}
