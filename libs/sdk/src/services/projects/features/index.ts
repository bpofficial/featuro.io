import { settings } from "./settings";
import { conditionSets } from './condition-sets'
import { Api } from "../../../api";
import { Paginated } from "../../../types/paginated";

type UpdateFeatureObj = {
    //
};

interface FeaturesApi {
    list: (page?: number, pageSize?: number, expand?: string[], signal?: AbortController['signal']) => Promise<Paginated<any[]>>;
}

interface FeaturesApiWithId {
    retrieve: (expand?: string[], signal?: AbortController['signal']) => Promise<any>;
    settings: ReturnType<typeof settings>;
    conditionSets: ReturnType<typeof conditionSets>
    update: (body: UpdateFeatureObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function features(api: Api, projectId: string) {
    function features(): FeaturesApi;
    function features(featureId: string): FeaturesApiWithId;
    function features(featureId?: string): FeaturesApi | FeaturesApiWithId {
        const featuresApi = api.clone('features');
        featuresApi.setPort('9000');

        if (featureId) {
            return {
                async retrieve(expand = [], signal) {
                    const params = new URLSearchParams();
                    if (expand.length) params.set('expand', expand.join(','))
                    return featuresApi.retrieve<any>(`/projects/${projectId}/features/${featureId}?${params.toString()}`, signal) as any;
                },
                async update(body) {
                    return featuresApi.update(`/projects/${projectId}/features/${featureId}`, body) as any;
                },
                async delete() {
                    return featuresApi.delete(`/projects/${projectId}/features/${featureId}`) as any;
                },
                settings: settings(featuresApi, projectId, featureId),
                conditionSets: conditionSets(featuresApi, projectId, featureId),
            }
        }

        return {
            async list(page = 1, pageSize = 50, expand = [], signal) {
                const params = new URLSearchParams();
                if (expand.length) params.set('expand', expand.join(','))
                params.set('page', page.toString());
                params.set('pageSize', pageSize.toString());
                
                return featuresApi.retrieve<any[]>(`/projects/${projectId}/features?${params.toString()}`, signal);
            },
        }
    }

    return features;
}