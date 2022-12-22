import { isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeepPartial, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeatureEnvironmentModel } from "./feature-environment.model";
import { FeatureVariantModel } from "./feature-variant.model";
import { FeatureImpressionModel } from "./impression.model";
import { ProjectModel } from "./project.model";
import { object, string } from 'yup';
import { EnvironmentModel } from "./environment.model";
import { FeatureConditionSetModel } from "./feature-condition-set.model";

@Entity('features')
export class FeatureModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @OneToMany(
        () => FeatureEnvironmentModel, 
        settings => settings.feature, 
        { eager: true, cascade: true }
    )
    environmentSettings: FeatureEnvironmentModel[];

    /**
     * When the feature is active in an environment, and there is a non-zero number of 
     * condition-sets, evaluate them to find the expected variant.
     */
     @OneToMany(
        () => FeatureConditionSetModel, 
        cd => cd.feature, 
        { nullable: true, eager: true, cascade: ['soft-remove'] }
    )
    conditionSets: FeatureConditionSetModel[] | null; // These are if/else'd rules within the feature

    @OneToMany(
        () => FeatureImpressionModel, 
        imp => imp.feature, 
        { cascade: ['soft-remove'] },
    )
    impressions: FeatureImpressionModel[];

    /**
     * When the feature is active in this environment, but there are no condition sets to evaluate,
     * use this variant.
     */
    @ManyToOne(() => FeatureVariantModel, { eager: true })
    @JoinColumn()
    activeDefaultVariant: FeatureVariantModel;

    /**
     * When the feature is in-active in this environment, use this variant.
     */
    @ManyToOne(() => FeatureVariantModel, { eager: true })
    @JoinColumn()
    inactiveVariant: FeatureVariantModel;

    @ManyToOne(() => ProjectModel, proj => proj.features)
    project: ProjectModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return FeatureModel.toDto(this);
    }

    validate(softValidate = false): true | string[] {
        try {
            const schema = object({
                key: string(),
                name: softValidate ? string() : string().required()
            });
        
            schema.validateSync(this);
            return true;
        } catch (err) {
            return err.errors || ['Unknown error'];
        }
    }

    evaluate(environment: string, context: Record<string, any>) {
        const env = this.environmentSettings.find(env => env.environment.key === environment);

        if (!env.isActive) 
            return FeatureVariantModel.fromArrayToEvaluation([this.inactiveVariant]);

        if (this.conditionSets) {
            const sets = this.conditionSets.filter(cd => !!cd.evaluate(context));
            if (sets.length) {
                const result = FeatureConditionSetModel.flattenVariants(sets);
                return FeatureVariantModel.fromArrayToEvaluation(result);
            }
        }

        return FeatureVariantModel.fromArrayToEvaluation([this.activeDefaultVariant]);
    }

    merge(obj: DeepPartial<FeatureModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed update fields
        if (obj.id) delete obj.id;
        if (obj.key) delete obj.key;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (typeof obj.name === 'string') this.name = obj.name;

        // Deep-merging fields
        if (obj.environmentSettings) this.environmentSettings = 
            FeatureEnvironmentModel.mergeMany(this.environmentSettings, obj.environmentSettings);
        if (obj.impressions) this.impressions = FeatureImpressionModel.mergeMany(this.impressions, obj.impressions);

        return this;
    }

    /**
     * @param environment The environment to be setup with the feature
     * @param mergeParts A partial object containing values that are assignable to all environments
     */
    addEnvironment(environment: EnvironmentModel, mergeParts: Partial<FeatureEnvironmentModel> = {}) {
        if (!this.environmentSettings) this.environmentSettings = [];

        if (this.environmentSettings.findIndex(env => env.id === environment.id) === -1) {
            // Doesn't yet exist
            this.environmentSettings.push(
                new FeatureEnvironmentModel({
                    isActive: false, // Inactive by default
                    environment
                })
            )
        }
    }

    addEnvironments(environments: EnvironmentModel[], mergeParts: Partial<FeatureEnvironmentModel> = {}) {
        environments.forEach(env => this.addEnvironment(env, mergeParts))
    }

    constructor(obj: DeepPartial<FeatureModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (this.environmentSettings) {
                this.environmentSettings = this.environmentSettings.map(FeatureEnvironmentModel.fromObject);
            }

            if (this.impressions) {
                this.impressions = this.impressions.map(FeatureImpressionModel.fromObject);
            }
        }
    }

    static mergeMany(a: DeepPartial<FeatureModel[]> = [], b: DeepPartial<FeatureModel>[] = []): FeatureModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;
        return joinArraysByIdWithAssigner<FeatureModel>(FeatureModel.merge, a, b);
    }

    static merge(a: DeepPartial<FeatureModel>, b: DeepPartial<FeatureModel>) {
        return new FeatureModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new FeatureModel(result);
    }

    static fromObjectArray(results: any[]) {
        return results.map(r => FeatureModel.fromObject(r))
    }

    static toDto(obj?: Partial<FeatureModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name,
            key: obj?.key,
            environmentSettings: FeatureEnvironmentModel.fromArrayToObject(obj?.environmentSettings) ?? undefined,
            // impressions: obj.impressions.map(imp => FeatureImpressionModel.toDto(imp)) || null
        }
    }

}
