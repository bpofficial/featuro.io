import { Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrganisationModel } from "./organisation.model";

@Entity()
export class OrganisationLimitsModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => OrganisationModel, org => org.billing)
    organisation: OrganisationModel;

    toDto() {
        return OrganisationLimitsModel.toDto(this);
    }

    constructor(obj?: Partial<OrganisationLimitsModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
            if (obj.organisation) {
                this.organisation = OrganisationModel.fromObject(this.organisation);
            }
        }
    }

    static fromObject(result: any) {
        return new OrganisationLimitsModel(result);
    }

    static toDto(obj?: Partial<OrganisationLimitsModel>) {
        if (!obj) return null;
        return {}
    }
}
