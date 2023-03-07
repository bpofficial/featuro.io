import { Api } from '../../api';
import { Paginated } from '../../types/paginated';
import { environments } from './environments';
import { features } from './features';
import { targets } from './targets';
import { variants } from './variants';

export interface ProjectsApi {
    list: (page?: number, pageSize?: number, signal?: AbortController['signal']) => Promise<Paginated<any>>;
    create: (body: any) => Promise<any>;
}

export interface ProjectsApiWithId {
    retrieve: () => Promise<any>;
    update: (body: any) => Promise<void>;
    delete: () => Promise<void>;
    features: ReturnType<typeof features>;
    environments: ReturnType<typeof environments>;
    targets: ReturnType<typeof targets>;
    variants: ReturnType<typeof variants>;
}

export function projects(api: Api) {
    function projects(): ProjectsApi;
    function projects(projectId: string): ProjectsApiWithId;
    function projects(projectId?: string): ProjectsApi | ProjectsApiWithId {
        const projectsApi = api.clone('projects');
        projectsApi.setPort('6000');

        if (projectId) {
            return {
                async retrieve() {
                    return {};
                },
                async update(body) {
                    return;
                },
                async delete() {
                    return;
                },
                features: features(api, projectId),
                environments: environments(api, projectId),
                targets: targets(projectsApi, projectId),
                variants: variants(projectsApi, projectId)
            }
        }
    
        return {
            async list(page = 1, pageSize = 50, signal) {
                return projectsApi.retrieve<any[]>('/projects', signal);
            },
            async create(body) {
                return {};
            }
        }
    }

    return projects;
}