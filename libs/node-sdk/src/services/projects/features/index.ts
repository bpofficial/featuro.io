import { settings } from "./settings";
import { conditionSets } from './condition-sets'
import { api } from "../../../api";

type UpdateFeatureObj = {
    //
};

interface FeaturesApi {
    list: (page?: number, pageSize?: number) => Promise<unknown[]>;
}

interface FeaturesApiWithId {
    settings: ReturnType<typeof settings>;
    conditionSets: ReturnType<typeof conditionSets>
    update: (body: UpdateFeatureObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function features(projectId: string) {
    function features(): FeaturesApi;
    function features(featureId: string): FeaturesApiWithId;
    function features(featureId?: string): FeaturesApi | FeaturesApiWithId {
        if (featureId) {
            return {
                async update(body) {
                    return api.update(`/projects/${projectId}/features/${featureId}`, body);
                },
                async delete() {
                    return api.delete(`/projects/${projectId}/features/${featureId}`);
                },
                settings: featureId ? settings(projectId, featureId) : undefined,
                conditionSets: featureId ? conditionSets(projectId, featureId) : undefined,
            }
        }

        return {
            async list() {
                return api.retrieve(`/projects/${projectId}/features`) as any;
            },
        }
    }

    return features;
}