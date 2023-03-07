import { Api } from "../../../../src/api";

type TargetObj = {
    //
};

type UpdateTargetObj = {
    //
};

interface TargetsApi {
    list: (page?: number, pageSize?: number) => Promise<TargetObj[]>;
    create: (body: TargetObj) => Promise<TargetObj>
}

interface TargetsApiWithId {
    update: (body: UpdateTargetObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function targets(api: Api, projectId: string) {
    function targets(): TargetsApi;
    function targets(targetId: string): TargetsApiWithId;
    function targets(targetId?: string): TargetsApi | TargetsApiWithId {
        const targetsApi = api.clone('projects/targets');

        if (targetId) {
            return {
                async update(body) {
                    return targetsApi.update(`/projects/${projectId}/targets/${targetId}`, body) as any;
                },
                async delete() {
                    return targetsApi.delete(`/projects/${projectId}/targets/${targetId}`) as any;
                },
            }
        }

        return {
            async list() {
                return targetsApi.retrieve(`/projects/${projectId}/targets`) as any;
            },  
            async create(body) {
                return targetsApi.create(`/projects/${projectId}/targets`, body) as any;
            },
        }
    }

    return targets;
}