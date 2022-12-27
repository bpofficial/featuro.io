import { api } from "../../../api";

type EnvironmentObj = {
    //
};

type UpdateEnvironmentObj = {
    //
};

interface EnvironmentsApi {
    list: (page?: number, pageSize?: number) => Promise<EnvironmentObj[]>;
    create: (body: EnvironmentObj) => Promise<EnvironmentObj>
}

interface EnvironmentsApiWithId {
    retrieve: () => Promise<EnvironmentObj>;
    update: (body: UpdateEnvironmentObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function environments(projectId: string) {
    function environments(): EnvironmentsApi;
    function environments(environmentId: string): EnvironmentsApiWithId;
    function environments(environmentId?: string): EnvironmentsApi | EnvironmentsApiWithId {
        if (environmentId) {
            return {
                async retrieve() {
                    return api.retrieve(`/projects/${projectId}/environments/${environmentId}`);
                },
                async update(body) {
                    return api.update(`/projects/${projectId}/environments/${environmentId}`, body);
                },
                async delete() {
                    return api.delete(`/projects/${projectId}/environments/${environmentId}`);
                },
            }
        }

        return {
            async list() {
                return api.retrieve(`/projects/${projectId}/environments`) as any;
            },
            async create(body) {
                return api.create(`/projects/${projectId}/environments`, body);
            },
        }
    }

    return environments;
}