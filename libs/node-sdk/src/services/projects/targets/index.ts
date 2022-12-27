import { api } from "../../../api";

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

export function targets(projectId: string) {
    function targets(): TargetsApi;
    function targets(targetId: string): TargetsApiWithId;
    function targets(targetId?: string): TargetsApi | TargetsApiWithId {
        if (targetId) {
            return {
                async update(body) {
                    return api.update(`/projects/${projectId}/targets/${targetId}`, body)
                },
                async delete() {
                    return api.delete(`/projects/${projectId}/targets/${targetId}`)
                },
            }
        }

        return {
            async list() {
                return api.retrieve(`/projects/${projectId}/targets`) as any;
            },  
            async create(body) {
                return api.create(`/projects/${projectId}/targets`, body)
            },
        }
    }

    return targets;
}