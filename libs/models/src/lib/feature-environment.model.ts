import { ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
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

    evaluate(context: Record<string, any>) {
        if (this.conditionSets) {
            const sets = this.conditionSets.filter(cd => !!cd.evaluate(context));
            if (sets.length) {
                return sets[0].variant;
            }
        }
        return null;
    }

    constructor(obj?: Partial<FeatureEnvironmentModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);

            if (this.conditionSets) {
                this.conditionSets = this.conditionSets.map(cd => FeatureConditionSetModel.fromObject(cd));
            } else {
                this.conditionSets = [];
            }

            this.environment = EnvironmentModel.fromObject(this.environment);
        }
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
