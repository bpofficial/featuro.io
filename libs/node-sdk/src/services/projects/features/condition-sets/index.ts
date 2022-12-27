import { api } from "../../../../api";

type UpdateConditionSetObj = {
    //
};
type ConditionSetObj = {
    //
};

export interface ConditionSetsApi {
    list: (page?: number, pageSize?: number) => Promise<ConditionSetObj[]>
    create: (body: ConditionSetObj) => Promise<ConditionSetObj>
}

interface ConditionSetsApiWithId {
    update: (body: UpdateConditionSetObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function conditionSets(projectId: string, featureId: string) {
    function conditionSets(): ConditionSetsApi;
    function conditionSets(csetId: string): ConditionSetsApiWithId;
    function conditionSets(csetId?: string): ConditionSetsApi | ConditionSetsApiWithId {
        if (csetId) {
            return {
                async delete() {
                    return api.delete(`/projects/${projectId}/features/${featureId}/conditionsets/${csetId}`)
                },
                async update(body) {
                    return api.update(`/projects/${projectId}/features/${featureId}/conditionsets/${csetId}`, body)
                }
            }
        }

        return {
            async list(page = 1, pageSize = 50) {
                return api.retrieve(`/projects/${projectId}/features/${featureId}/conditionsets`) as any;
            },
            async create(body) {
                return api.create(`/projects/${projectId}/features/${featureId}/conditionsets`, body);
            }
        }
    }

    return conditionSets;
}