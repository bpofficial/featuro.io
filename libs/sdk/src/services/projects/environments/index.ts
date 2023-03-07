import { Paginated } from "../../../types/paginated";
import { Api } from "../../../api";

type EnvironmentObj = {
    //
};

type UpdateEnvironmentObj = {
    //
};

interface EnvironmentsApi {
    list: (page?: number, pageSize?: number, signal?: AbortController['signal']) => Promise<Paginated<EnvironmentObj[]>>;
    create: (body: EnvironmentObj) => Promise<EnvironmentObj>
}

interface EnvironmentsApiWithId {
    retrieve: () => Promise<EnvironmentObj>;
    update: (body: UpdateEnvironmentObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function environments(api: Api, projectId: string) {
    function environments(): EnvironmentsApi;
    function environments(environmentId: string): EnvironmentsApiWithId;
    function environments(environmentId?: string): EnvironmentsApi | EnvironmentsApiWithId {
        const envApi = api.clone('environments');
        envApi.setPort('10000');

        if (environmentId) {
            return {
                async retrieve() {
                    return envApi.retrieve(`/projects/${projectId}/environments/${environmentId}`) as any;
                },
                async update(body) {
                    return envApi.update(`/projects/${projectId}/environments/${environmentId}`, body) as any;
                },
                async delete() {
                    return envApi.delete(`/projects/${projectId}/environments/${environmentId}`) as any;
                },
            }
        }

        return {
            async list(page, pageSize, signal) {
                return envApi.retrieve(`/projects/${projectId}/environments`, signal) as any;
            },
            async create(body) {
                return envApi.create(`/projects/${projectId}/environments`, body) as any;
            },
        }
    }

    return environments;
}