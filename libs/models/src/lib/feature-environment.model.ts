import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnvironmentModel } from "./environment.model";
import { FeatureConditionSetModel } from "./feature-condition-set.model";
import { FeatureVariantModel } from "./feature-variant.model";

@Entity('feature_environments')
export class FeatureEnvironmentModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => EnvironmentModel, env => env.id)
    environment: EnvironmentModel;

    /**
     * When the feature is active in this environment, and there is a non-zero number of 
     * condition-sets, evaluate them to find the expected variant.
     */
    @OneToMany(() => FeatureConditionSetModel, cd => cd.id, { nullable: true, cascade: ['insert'] })
    conditionSets: FeatureConditionSetModel[] | null; // These are if/else'd rules within the feature

    /**
     * When the feature is active in this environment, but there are no condition sets to evaluate,
     * use this variant.
     */
    @ManyToOne(() => FeatureVariantModel, vr => vr.id, { cascade: ['insert'] })
    activeDefaultVariant: FeatureVariantModel;

    /**
     * When the feature is in-active in this environment, use this variant.
     */
    @ManyToOne(() => FeatureVariantModel, vr => vr.id, { cascade: ['insert'] })
    inactiveVariant: FeatureVariantModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    merge(obj: DeepPartial<FeatureEnvironmentModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Deep-merging fields
        if (obj.environment) this.environment.merge(obj.environment);
        if (obj.conditionSets) this.conditionSets = 
            FeatureConditionSetModel.mergeMany(this.conditionSets, obj.conditionSets);

        return this;
    }

    evaluate(active: boolean, context: Record<string, any>) {
        if (!active) return this.inactiveVariant;

        if (this.conditionSets) {
            const sets = this.conditionSets.filter(cd => !!cd.evaluate(context));
            if (sets.length) {
                return sets[0].variant;
            }
        }
        return this.activeDefaultVariant;
    }

    constructor(obj?: DeepPartial<FeatureEnvironmentModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (this.conditionSets) {
                this.conditionSets = this.conditionSets.map(cd => FeatureConditionSetModel.fromObject(cd));
            } else {
                this.conditionSets = [];
            }

            this.environment = EnvironmentModel.fromObject(this.environment);
        }
    }

    static mergeMany(a: DeepPartial<FeatureEnvironmentModel[]> = [], b: DeepPartial<FeatureEnvironmentModel>[] = []): FeatureEnvironmentModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;;
        return joinArraysByIdWithAssigner<FeatureEnvironmentModel>(FeatureEnvironmentModel.merge, a, b);
    }

    static merge(a: DeepPartial<FeatureEnvironmentModel>, b: DeepPartial<FeatureEnvironmentModel>) {
        return new FeatureEnvironmentModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new FeatureEnvironmentModel(result);
    }

    static toDto(obj?: Partial<FeatureEnvironmentModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            environment: EnvironmentModel.toDto(obj?.environment),
            conditionSets: obj?.conditionSets ? obj.conditionSets.map(rule => FeatureConditionSetModel.toDto(rule)) : []
        }
    }

    static fromArrayToObject(objs: Partial<FeatureEnvironmentModel>[]) {
        return objs.reduce((a, v) => {
            a[v.environment.key] = v;
            return a;
        }, {} as Record<string, Partial<FeatureEnvironmentModel>>);
    }
}
