import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { OrganisationModel } from "./organisation.model";

@Entity()
export class OrganisationMemberModel {
    @PrimaryColumn()
    id: string;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column({ default: 'user', enum: ['owner', 'admin', 'user'], type: 'enum' })
    role: 'owner' | 'admin' | 'user';

    @ManyToOne(() => OrganisationModel, org => org.members)
    organisation: OrganisationModel;

    toDto() {
        return OrganisationMemberModel.toDto(this);
    }

    constructor(obj?: Partial<OrganisationMemberModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
            if (obj.organisation) {
                this.organisation = OrganisationModel.fromObject(this.organisation);
            }
        }
    }

    static fromObject(result: any) {
        return new OrganisationMemberModel(result);
    }

    static toDto(obj?: Partial<OrganisationMemberModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            email: obj?.email,
            name: obj?.name,
        }
    }

}
