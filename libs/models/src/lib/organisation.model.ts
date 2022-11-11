import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { OrganisationBillingModel } from './organisation-billing.model';
import { OrganisationLimitsModel } from './organisation-limits.model';
import { OrganisationMemberModel } from './organisation-member.model';
import { ProjectModel } from './project.model';

@Entity()
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

    @OneToMany(() => OrganisationMemberModel, mem => mem.organisation)
    members: OrganisationMemberModel[];

    @OneToMany(() => ProjectModel, proj => proj.id)
    projects: ProjectModel[];

    toDto() {
        return OrganisationModel.toDto(this);
    }

    validate(): true | any[] {
        // name, subdomain
        return true;
    }

    constructor(obj?: Partial<OrganisationModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);

            if (this.projects) {
                this.projects = this.projects.map(proj => ProjectModel.fromObject(proj))
            } else {
                this.projects = [];
            }

            if (this.members) {
                this.members = this.members.map(mem => OrganisationMemberModel.fromObject(mem))
            } else {
                this.members = [];
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
