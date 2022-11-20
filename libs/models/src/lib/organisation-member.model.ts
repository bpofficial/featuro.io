import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return OrganisationMemberModel.toDto(this);
    }

    merge(obj: Partial<OrganisationMemberModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.organisation) delete obj.organisation;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.email) this.email = obj.email;
        if (obj.name) this.name = obj.name;
        if (obj.role) this.role = obj.role;
        
        return this;
    }

    constructor(obj?: Partial<OrganisationMemberModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);
            
            if (obj.organisation) {
                this.organisation = OrganisationModel.fromObject(this.organisation);
            }
        }
    }

    static mergeMany(a: DeepPartial<OrganisationMemberModel>[] = [], b: DeepPartial<OrganisationMemberModel>[] = []): OrganisationMemberModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;
        return joinArraysByIdWithAssigner<OrganisationMemberModel>(OrganisationMemberModel.merge, a, b);
    }

    static merge(a: Partial<OrganisationMemberModel>, b: Partial<OrganisationMemberModel>) {
        return new OrganisationMemberModel(a).merge(b)
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
