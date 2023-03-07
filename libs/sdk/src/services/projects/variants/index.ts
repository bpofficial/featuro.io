import { Api } from "../../../../src/api";

type VariantObj = {
    //
};

type UpdateVariantObj = {
    //
};

interface VariantsApi {
    list: (page?: number, pageSize?: number) => Promise<VariantObj[]>;
    create: (body: VariantObj) => Promise<VariantObj>
}

interface VariantsApiWithId {
    update: (body: UpdateVariantObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function variants(api: Api, projectId: string) {
    function variants(): VariantsApi;
    function variants(variantId: string): VariantsApiWithId;
    function variants(variantId?: string): VariantsApi | VariantsApiWithId {
        const variantsApi = api.clone('projects/variants');

        if (variantId) {
            return {
                async update(body) {
                    return variantsApi.update(`/projects/${projectId}/variants/${variantId}`, body) as any;
                },
                async delete() {
                    return variantsApi.delete(`/projects/${projectId}/variants/${variantId}`) as any;
                },
            }
        }

        return {
            async list() {
                return variantsApi.retrieve(`/projects/${projectId}/variants`) as any;
            },
            async create(body) {
                return variantsApi.create(`/projects/${projectId}/variants`, body) as any;
            },
        }
    }

    return variants;
}