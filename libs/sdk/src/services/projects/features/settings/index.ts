import { Api } from "../../../../../src/api";

type UpdateSettingsObj = {
    //
};
type SettingsObj = {
    //
};

export interface SettingsApi {
    retrieve: () => Promise<SettingsObj>;
    update: (body: UpdateSettingsObj) => Promise<void>;
}

export function settings(api: Api, projectId: string, featureId: string) {
    return function (envId: string): SettingsApi {
        const settingsApi = api.clone('features/settings');
        return {
            async retrieve() {
                return settingsApi.retrieve(`/projects/${projectId}/features/${featureId}/settings/${envId}`) as any
            },
            async update(body) {
                return settingsApi.update(`/projects/${projectId}/features/${featureId}/settings/${envId}`, body) as any
            }
        }
    }
}