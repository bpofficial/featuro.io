import { isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeepPartial, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeatureEnvironmentModel } from "./feature-environment.model";
import { FeatureVariantModel } from "./feature-variant.model";
import { FeatureImpressionModel } from "./impression.model";
import { ProjectModel } from "./project.model";
import { object, string, number, bool } from 'yup';
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

    @Column('bool', { default: false })
    active: boolean;

    @OneToMany(
        () => FeatureEnvironmentModel, 
        settings => settings.feature, 
        { eager: true, cascade: true }
    )
    environmentSettings: FeatureEnvironmentModel[];

    @OneToMany(() => FeatureImpressionModel, imp => imp.feature)
    impressions: FeatureImpressionModel[];

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
                name: softValidate ? string() : string().required(),
                active: bool()
            });
        
            schema.validateSync(this);
            return true;
        } catch (err) {
            return err.errors || ['Unknown error'];
        }
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
        if (typeof obj.active === 'boolean') this.active = obj.active;

        // Deep-merging fields
        if (obj.environmentSettings) this.environmentSettings = 
            FeatureEnvironmentModel.mergeMany(this.environmentSettings, obj.environmentSettings);
        if (obj.impressions) this.impressions = FeatureImpressionModel.mergeMany(this.impressions, obj.impressions);

        return this;
    }

    evaluate(environment: string, context?: Record<string, any>) {
        const env = this.environmentSettings.find(env => env.environment.key === environment);
        return env.evaluate(this.active, context || {});
    }

    /**
     * 
     * @param environment The environment to be setup with the feature
     * @param mergeParts A partial object containing values that are assignable to all environments (e.g. default variants)
     */
    addEnvironment(environment: EnvironmentModel, mergeParts: Partial<FeatureEnvironmentModel> = {}) {
        if (!this.environmentSettings) this.environmentSettings = [];

        if (this.environmentSettings.findIndex(env => env.id === environment.id) === -1) {
            // Doesn't yet exist
            this.environmentSettings.push(new FeatureEnvironmentModel({
                ...mergeParts,
                environment
            }))
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
            active: obj?.active,
            environmentSettings: FeatureEnvironmentModel.fromArrayToObject(obj?.environmentSettings) ?? undefined,
            // impressions: obj.impressions.map(imp => FeatureImpressionModel.toDto(imp)) || null
        }
    }

}
