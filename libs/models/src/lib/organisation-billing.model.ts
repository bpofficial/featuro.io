import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrganisationModel } from "./organisation.model";
import { DeepPartial, isObjectLike } from '@featuro.io/common';

@Entity('org_billing')
export class OrganisationBillingModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('bool', { default: false })
    financial: boolean;

    @Column({ nullable: true, default: null })
    stripePriceId: string;

    @Column({ nullable: true, default: null })
    stripeCustomerId: string;

    @Column({ nullable: true, default: null })
    stripeSubscriptionId: string;

    @Column('bool', { default: true })
    isOnboarding: boolean;

    @Column('bool', { default: true })
    isTrialing: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    organisation: OrganisationModel;

    toDto() {
        return OrganisationBillingModel.toDto(this);
    }

    merge(obj: DeepPartial<OrganisationBillingModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.financial) this.financial = obj.financial;
        if (obj.stripePriceId) this.stripePriceId = obj.stripePriceId;
        if (obj.stripeCustomerId) this.stripeCustomerId = obj.stripeCustomerId;
        if (obj.stripeSubscriptionId) this.stripeSubscriptionId = obj.stripeSubscriptionId;
        if (obj.isOnboarding) this.isOnboarding = obj.isOnboarding;

        return this;
    }

    constructor(obj?: Partial<OrganisationBillingModel>) {
        if (isObjectLike(obj)) Object.assign(this, obj);
    }

    static fromObject(result: any) {
        return new OrganisationBillingModel(result);
    }

    static toDto(obj?: Partial<OrganisationBillingModel>, includeSensitive = false) {
        if (!obj) return null;
        
        if (!includeSensitive) {
            return { 
                financial: obj?.financial,
                isTrialing: obj?.isTrialing,
                isOnboarding: obj?.isOnboarding
            };
        }

        return {
            financial: obj?.financial,
            isTrialing: obj?.isTrialing,
            isOnboarding: obj?.isOnboarding,
            stripePriceId: obj?.stripePriceId,
            stripeCustomerId: obj?.stripeCustomerId,
            stripeSubscriptionId: obj?.stripeSubscriptionId
        }
    }

}
