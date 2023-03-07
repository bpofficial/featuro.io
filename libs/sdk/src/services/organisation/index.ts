type OrganisationObj = {
    //
};

type UpdateOrganisationObj = {
    //
};

interface OrganisationsApi {
    list: (page?: number, pageSize?: number) => Promise<OrganisationObj[]>;
    create: (body: OrganisationObj) => Promise<OrganisationObj>
}

interface OrganisationsApiWithId {
    retrieve: () => Promise<OrganisationObj>;
    update: (body: UpdateOrganisationObj) => Promise<void>;
    delete: () => Promise<void>;
}

export function organisations(): OrganisationsApi;
export function organisations(organisationId: string): OrganisationsApiWithId;
export function organisations(organisationId?: string): OrganisationsApi | OrganisationsApiWithId {
    if (organisationId) {
        return {
            async retrieve() {
                return {};
            },
            async update(body) {
                //
            },
            async delete() {
                //
            },
        }
    }

    return {
        async list() {
            return []
        },
        async create(body) {
            return {};
        },
    }
}