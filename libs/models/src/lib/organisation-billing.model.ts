import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrganisationModel } from "./organisation.model";

@Entity()
export class OrganisationBillingModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: false })
    financial: boolean;

    @Column({ nullable: true, default: null })
    stripePriceId: string;

    @Column({ nullable: true, default: null })
    stripeCustomerId: string;

    @Column({ nullable: true, default: null })
    stripeSubscriptionId: string;

    @OneToOne(() => OrganisationModel, org => org.billing)
    organisation: OrganisationModel;

    toDto() {
        return OrganisationBillingModel.toDto(this);
    }

    constructor(obj?: Partial<OrganisationBillingModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
            if (obj.organisation) {
                this.organisation = OrganisationModel.fromObject(this.organisation);
            }
        }
    }

    static fromObject(result: any) {
        return new OrganisationBillingModel(result);
    }

    static toDto(obj?: Partial<OrganisationBillingModel>, includeSensitive = false) {
        if (!obj) return null;
        if (!includeSensitive) return {};
        return {
            financial: obj?.financial,
            stripePriceId: obj?.stripePriceId,
            stripeCustomerId: obj?.stripeCustomerId,
            stripeSubscriptionId: obj?.stripeSubscriptionId,
        }
    }

}
