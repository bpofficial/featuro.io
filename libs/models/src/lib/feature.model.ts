import { isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeepPartial, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeatureEnvironmentModel } from "./feature-environment.model";
import { FeatureVariantModel } from "./feature-variant.model";
import { FeatureImpressionModel } from "./impression.model";
import { ProjectModel } from "./project.model";
import { object, string, number, bool } from 'yup';

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
        settings => settings.id, 
        { eager: true, cascade: ['soft-remove', 'insert'] }
    )
    environmentSettings: FeatureEnvironmentModel[];

    @JoinColumn()
    @OneToOne(
        () => FeatureVariantModel, 
        variant => variant.id, 
        { eager: true, cascade: ['soft-remove', 'insert']}
    )
    activeDefaultVariant: FeatureVariantModel;

    @JoinColumn()
    @OneToOne(
        () => FeatureVariantModel, 
        variant => variant.id, 
        { eager: true, cascade: ['soft-remove', 'insert'] }
    )
    inactiveVariant: FeatureVariantModel;

    @OneToMany(() => FeatureImpressionModel, imp => imp.feature)
    impressions: FeatureImpressionModel[];

    @ManyToOne(() => ProjectModel, project => project.features)
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
        if (obj.name) this.name = obj.name;
        if (obj.active) this.active = obj.active;

        // Deep-merging fields
        if (obj.environmentSettings) this.environmentSettings = 
            FeatureEnvironmentModel.mergeMany(this.environmentSettings, obj.environmentSettings);
        if (obj.activeDefaultVariant) this.activeDefaultVariant.merge(obj.activeDefaultVariant);
        if (obj.inactiveVariant) this.inactiveVariant.merge(obj.inactiveVariant);
        if (obj.impressions) this.impressions = FeatureImpressionModel.mergeMany(this.impressions, obj.impressions);

        return this;
    }

    evaluate(environment: string, context?: Record<string, any>) {
        const env = this.environmentSettings.find(env => env.environment.key === environment);
        const result = env.evaluate(context || {});

        if (this.active) {
            return result || this.activeDefaultVariant;
        } else {
            return this.inactiveVariant;
        }
    }

    constructor(obj: DeepPartial<FeatureModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (this.environmentSettings) {
                this.environmentSettings = this.environmentSettings.map(env => {
                    return FeatureEnvironmentModel.fromObject(env);
                });
            } else {
                this.environmentSettings = [];
            }

            if (this.impressions) {
                this.impressions = this.impressions.map(imp => FeatureImpressionModel.fromObject(imp))
            } else {
                this.impressions = [];
            }

            this.activeDefaultVariant = FeatureVariantModel.fromObject(this.activeDefaultVariant);
            this.inactiveVariant = FeatureVariantModel.fromObject(this.inactiveVariant);
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
            environmentSettings: obj?.environmentSettings ? FeatureEnvironmentModel.fromArrayToObject(obj?.environmentSettings) : {},
            activeDefaultVariant: FeatureVariantModel.toDto(obj.activeDefaultVariant),
            inactiveVariant: FeatureVariantModel.toDto(obj.inactiveVariant),
            impressions: obj?.impressions ? obj.impressions.map(imp => FeatureImpressionModel.toDto(imp)) : []
        }
    }

}
