import { environments } from './environments';
import { features } from './features';
import { targets } from './targets';
import { variants } from './variants';

type ProjectObj = {
    //
};
type UpdateProjectObj = {
    //
};

interface ProjectsApi {
    list: (page?: number, pageSize?: number) => Promise<ProjectObj[]>;
    create: (body: ProjectObj) => Promise<ProjectObj>;
}

interface ProjectsApiWithId {
    retrieve: () => Promise<ProjectObj>;
    update: (body: UpdateProjectObj) => Promise<void>;
    delete: () => Promise<void>;
    features: ReturnType<typeof features>;
    environments: ReturnType<typeof environments>;
    targets: ReturnType<typeof targets>;
    variants: ReturnType<typeof variants>;
}

export function projects(): ProjectsApi;
export function projects(projectId: string): ProjectsApiWithId
export function projects(projectId?: string): ProjectsApi | ProjectsApiWithId {
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
            features: features(projectId),
            environments: environments(projectId),
            targets: targets(projectId),
            variants: variants(projectId)
        }
    }

    return {
        async list() {
            return []
        },
        async create(body) {
            return {};
        }
    }
}