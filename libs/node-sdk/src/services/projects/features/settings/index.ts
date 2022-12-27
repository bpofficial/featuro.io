import { api } from "../../../../api";

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

export function settings(projectId: string, featureId: string) {
    return function (envId: string): SettingsApi {
        return {
            async retrieve() {
                return api.retrieve(`/projects/${projectId}/features/${featureId}/settings/${envId}`)
            },
            async update(body) {
                return api.update(`/projects/${projectId}/features/${featureId}/settings/${envId}`, body)
            }
        }
    }
}