import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { CreateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnvironmentModel } from "./environment.model";
import { FeatureConditionSetModel } from "./feature-condition-set.model";

export class FeatureEnvironmentModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => EnvironmentModel, env => env.id)
    environment: EnvironmentModel;

    // When targeting is enabled, these are evaluated
    @OneToMany(() => FeatureConditionSetModel, cd => cd.id, { nullable: true })
    conditionSets: FeatureConditionSetModel[] | null; // These are if/else'd rules within the feature

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

    evaluate(context: Record<string, any>) {
        if (this.conditionSets) {
            const sets = this.conditionSets.filter(cd => !!cd.evaluate(context));
            if (sets.length) {
                return sets[0].variant;
            }
        }
        return null;
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
