import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { FeatureConditionModel } from "./feature-condition.model";
import { FeatureVariantModel } from "./feature-variant.model";

@Entity()
export class FeatureConditionSetModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true, default: null })
    name: string | null;

    @Column({ nullable: true, default: null })
    description: string | null;

    @ManyToMany(() => FeatureConditionModel, variant => variant.id)
    conditions: FeatureConditionModel[];

    @ManyToOne(() => FeatureVariantModel, vr => vr.id)
    variant: FeatureVariantModel;

    @Column({ default: false })
    isDefaultSet: boolean;

    evaluate(context: Record<string, any>) {
        return this.conditions.every(cd => cd.evalulate(context));
    }

    toDto() {
        return FeatureConditionSetModel.toDto(this);
    }

    constructor(obj?: Partial<FeatureConditionSetModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
            if (this.conditions) {
                this.conditions = this.conditions.map(vr => FeatureConditionModel.fromObject(vr))
            } else {
                this.conditions = [];
            }

            this.variant = FeatureVariantModel.fromObject(this.variant);
        }
    }

    static fromObject(result: any) {
        return new FeatureConditionSetModel(result);
    }

    static toDto(obj?: Partial<FeatureConditionSetModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name,
            description: obj?.description,
            conditions: obj?.conditions ? obj.conditions.map(vr => FeatureConditionModel.toDto(vr)) : [],
            variant: FeatureVariantModel.toDto(obj?.variant),
            isDefaultSet: obj?.isDefaultSet ?? false
        }
    }
}
