import { isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeepPartial, DeleteDateColumn, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeatureConditionModel } from "./feature-condition.model";
import { FeatureVariantModel } from "./feature-variant.model";

@Entity('feature_condition-sets')
export class FeatureConditionSetModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true, default: null })
    name: string | null;

    @Column({ nullable: true, default: null })
    description: string | null;

    @Column('bool', { default: false })
    isDefaultSet: boolean;

    @ManyToMany(() => FeatureConditionModel, variant => variant.id)
    conditions: FeatureConditionModel[];

    @ManyToOne(() => FeatureVariantModel, vr => vr.id)
    variant: FeatureVariantModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return FeatureConditionSetModel.toDto(this);
    }

    merge(obj: DeepPartial<FeatureConditionSetModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.name) this.name = obj.name;
        if (obj.description) this.description = obj.description;
        if (obj.isDefaultSet) this.isDefaultSet = obj.isDefaultSet;

        // Deep-merging fields
        if (obj.conditions) this.conditions = FeatureConditionModel.mergeMany(this.conditions, obj.conditions);
        if (obj.variant) this.variant.merge(obj.variant);

        return this;
    }

    evaluate(context: Record<string, any>) {
        return this.conditions.every(cd => cd.evalulate(context));
    }

    constructor(obj?: DeepPartial<FeatureConditionSetModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (this.conditions) {
                this.conditions = this.conditions.map(vr => FeatureConditionModel.fromObject(vr))
            } else {
                this.conditions = [];
            }

            this.variant = FeatureVariantModel.fromObject(this.variant);
        }
    }

    static mergeMany(a: DeepPartial<FeatureConditionSetModel[]> = [], b: DeepPartial<FeatureConditionSetModel>[] = []): FeatureConditionSetModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;
        return joinArraysByIdWithAssigner<FeatureConditionSetModel>(FeatureConditionSetModel.merge, a, b);
    }

    static merge(a: DeepPartial<FeatureConditionSetModel>, b: DeepPartial<FeatureConditionSetModel>) {
        return new FeatureConditionSetModel(a).merge(b);
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
