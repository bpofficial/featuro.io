import { api } from "../../../api";

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

export function variants(projectId: string) {
    function variants(): VariantsApi;
    function variants(variantId: string): VariantsApiWithId;
    function variants(variantId?: string): VariantsApi | VariantsApiWithId {
        if (variantId) {
            return {
                async update(body) {
                    return api.update(`/projects/${projectId}/variants/${variantId}`, body)
                },
                async delete() {
                    return api.delete(`/projects/${projectId}/variants/${variantId}`)
                },
            }
        }

        return {
            async list() {
                return api.retrieve(`/projects/${projectId}/variants`) as any;
            },
            async create(body) {
                return api.create(`/projects/${projectId}/variants`, body);
            },
        }
    }

    return variants;
}