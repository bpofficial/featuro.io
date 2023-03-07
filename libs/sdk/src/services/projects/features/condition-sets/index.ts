import { Api } from "../../../../../src/api";

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

export function conditionSets(api: Api,projectId: string, featureId: string) {
    function conditionSets(): ConditionSetsApi;
    function conditionSets(csetId: string): ConditionSetsApiWithId;
    function conditionSets(csetId?: string): ConditionSetsApi | ConditionSetsApiWithId {
        if (csetId) {
            return {
                async delete() {
                    return api.delete(`/projects/${projectId}/features/${featureId}/conditionsets/${csetId}`) as any;
                },
                async update(body) {
                    return api.update(`/projects/${projectId}/features/${featureId}/conditionsets/${csetId}`, body) as any;
                }
            }
        }

        return {
            async list(page = 1, pageSize = 50) {
                return api.retrieve(`/projects/${projectId}/features/${featureId}/conditionsets`) as any;
            },
            async create(body) {
                return api.create(`/projects/${projectId}/features/${featureId}/conditionsets`, body) as any;
            }
        }
    }

    return conditionSets;
}