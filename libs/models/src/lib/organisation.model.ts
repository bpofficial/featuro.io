import { DeepPartial, isObjectLike } from '@featuro.io/common';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { OrganisationBillingModel } from './organisation-billing.model';
import { OrganisationLimitsModel } from './organisation-limits.model';
import { ProjectModel } from './project.model';

@Entity('orgs')
export class OrganisationModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    ownerId: string; // auth0 user id

    @Column()
    subdomain: string;

    @Column({ nullable: true })
    auth0OrganisationId: string | null;

    @OneToOne(() => OrganisationBillingModel, bill => bill.organisation)
    billing: OrganisationBillingModel;

    @OneToOne(() => OrganisationLimitsModel, limits => limits.organisation)
    limits: OrganisationLimitsModel;

    @OneToMany(() => ProjectModel, proj => proj.id)
    projects: ProjectModel[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return OrganisationModel.toDto(this);
    }

    /**
     * Useful for merging in an update
     */
    merge(obj: DeepPartial<OrganisationModel>, deep = false) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.auth0OrganisationId) delete obj.auth0OrganisationId;
        if (obj.subdomain) delete obj.subdomain;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.name) this.name = obj.name;
        if (obj.ownerId) this.ownerId = obj.ownerId;

        if (deep) {
            // deep-merging fields
            if (obj.billing) this.billing.merge(obj.billing);
            if (obj.limits) this.limits.merge(obj.limits);
            if (obj.projects) this.projects = ProjectModel.mergeMany(this.projects, obj.projects);
        }

        return this;
    }

    validate(): true | any[] {
        // name, subdomain
        return true;
    }

    constructor(obj?: Partial<OrganisationModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (this.projects) {
                this.projects = this.projects.map(proj => ProjectModel.fromObject(proj))
            } else {
                this.projects = [];
            }

            this.billing = OrganisationBillingModel.fromObject(this.billing);
            this.limits = OrganisationLimitsModel.fromObject(this.limits);
        }
    }

    static fromObject(result: any) {
        return new OrganisationModel(result);
    }

    static toDto(obj?: Partial<OrganisationModel>, includeSensitive = false) {
        if (!obj) return null;
        const res = {
            id: obj?.id,
            name: obj?.name,
            ownerId: obj?.ownerId,
            subdomain: obj?.subdomain,
            projects: obj?.projects ? obj.projects.map(proj => ProjectModel.toDto(proj)) : [],
            limits: OrganisationLimitsModel.toDto(obj?.limits)
        }

        if (includeSensitive) {
            Object.assign(res, {
                auth0OrganisationId: obj?.auth0OrganisationId ?? null,
                billing: OrganisationBillingModel.toDto(obj?.billing, includeSensitive)
            })
        }

        return res;
    }
}
