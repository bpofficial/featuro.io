
import { isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeepPartial, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EvaluationData, FeatureConditionModel } from "./feature-condition.model";
import { FeatureVariantModel } from "./feature-variant.model";
import { FeatureModel } from "./feature.model";
import { array, number, object, string } from "yup";

@Entity('feature_condition-sets')
export class FeatureConditionSetModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true, default: null })
    name: string | null;

    @Column({ nullable: true, default: null })
    description: string | null;

    @OneToMany(
        () => FeatureConditionModel, 
        cd => cd.cset, 
        { 
            cascade: true, 
            eager: true 
        }
    )
    conditions: FeatureConditionModel[];

    /**
     * If the conditions are met and are truthy, this variant is returned. If there's
     * more than one 
     * 
     * So if the conditions were checking if the date is past X, and the date is X + 1,
     * then the evaluation would return this variant.
     */
    @ManyToMany(() => FeatureVariantModel, { cascade: true })
    @JoinTable()
    variants: FeatureVariantModel[];

    @ManyToOne(() => FeatureModel, feat => feat.conditionSets)
    @JoinColumn()
    feature: FeatureModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    evaluate(data: EvaluationData) {
        return this.conditions.every(cd => cd.evalulate(data));
    }

    toDto() {
        return FeatureConditionSetModel.toDto(this);
    }

    validate(softValidate = false): true | string[] {
        try {
            const schema = FeatureConditionSetModel.getValidationSchema(!softValidate);
            schema.validateSync(this);
            return true;
        } catch (err) {
            return err.errors || ['Unknown error'];
        }
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

        // Deep-merging fields
        if (obj.conditions) this.conditions = FeatureConditionModel.mergeMany(this.conditions, obj.conditions);
        if (obj.variants) this.variants = FeatureVariantModel.mergeMany(this.variants, obj.variants);

        return this;
    }

    constructor(obj?: DeepPartial<FeatureConditionSetModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (obj.conditions) {
                this.conditions = this.conditions.map(FeatureConditionModel.fromObject)
            }

            if (obj.variants) {
                this.variants = obj.variants.map(FeatureVariantModel.fromObject);
            }
        }
    }

    static mergeMany(a: DeepPartial<FeatureConditionSetModel[]> = [], b: DeepPartial<FeatureConditionSetModel>[] = []): FeatureConditionSetModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as FeatureConditionSetModel[];
        return joinArraysByIdWithAssigner<FeatureConditionSetModel>(FeatureConditionSetModel.merge, a, b);
    }

    static merge(a: DeepPartial<FeatureConditionSetModel>, b: DeepPartial<FeatureConditionSetModel>) {
        return new FeatureConditionSetModel(a).merge(b);
    }

    static fromObject(result: unknown) {
        return new FeatureConditionSetModel(result);
    }

    static fromObjectArray(results: unknown[]) {
        return results.map(r => FeatureConditionSetModel.fromObject(r))
    }

    static toDto(obj?: Partial<FeatureConditionSetModel>) {
        if (!isObjectLike(obj)) return null;

        return {
            id: obj?.id,
            name: obj?.name,
            description: obj?.description,
            conditions: obj?.conditions?.length ? obj.conditions.map(FeatureConditionModel.toDto) : undefined,
            variants: obj?.variants?.length ? obj.variants.map(FeatureVariantModel.toDto) : undefined,
        }
    }

    static flattenVariants(sets: FeatureConditionSetModel[]) {
        return sets.reduce((arr, res) => {
            arr = arr.concat(res.variants)
            return arr;
        }, [] as FeatureVariantModel[]);
    }

    static getValidationSchema(strict = false) {
        return object({
            name: string()[strict ? 'required' : 'optional'](),
            description: string()[strict ? 'required' : 'optional'](),
            conditions: array(
                object({
                    target: object({
                        id: string().required(),
                    }),
                    operator: string()[strict ? 'required' : 'optional'](),
                    staticOperand: string()[strict ? 'required' : 'optional'](),
                })
            )[strict ? 'required' : 'optional'](),
            variants: array(
                object({
                    split: number().optional(),
                    variant: object({
                        id: string().required()
                    })
                })
            )[strict ? 'required' : 'optional']()
        });
    }
}
