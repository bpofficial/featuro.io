import { DeepPartial, isObjectLike } from "@featuro.io/common";
import { Stripe } from "stripe";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrganisationModel } from "./organisation.model";

@Entity('org_limits')
export class OrganisationLimitsModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('int')
    members: number;

    @Column('int')
    projects: number;

    @Column('int')
    environments: number;

    @Column('int')
    features: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToOne(() => OrganisationModel, org => org.billing)
    organisation: OrganisationModel;

    toDto() {
        return OrganisationLimitsModel.toDto(this);
    }

    merge(obj: DeepPartial<OrganisationLimitsModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.members) this.members = obj.members;
        if (obj.projects) this.projects = obj.projects;
        if (obj.environments) this.environments = obj.environments;
        if (obj.features) this.features = obj.features;

        return this;
    }

    parseStripePriceMetadata(meta: Record<string, any>) {
        this.members =      this.getValueFromMetadata('members-limit',      meta, 10);
        this.projects =     this.getValueFromMetadata('projects-limit',     meta, 10);
        this.environments = this.getValueFromMetadata('environments-limit', meta, 10);
        this.features =     this.getValueFromMetadata('features-limit',     meta, 10);
    }

    private getValueFromMetadata(key: string, meta: Stripe.Metadata, fallback: any): any {
        try {
            const value = Number(meta[key]);
            if (isNaN(value)) throw new Error();
            return value;
        } catch {
            if (meta[key] === 'true' || meta[key] === 'false') return meta[key];
            return fallback;
        }
    }

    constructor(obj?: Partial<OrganisationLimitsModel>) {
        if (isObjectLike(obj)) Object.assign(this, obj);
    }

    static fromObject(result: any) {
        return new OrganisationLimitsModel(result);
    }

    static toDto(obj?: Partial<OrganisationLimitsModel>) {
        if (!obj) return null;
        return {}
    }
}
