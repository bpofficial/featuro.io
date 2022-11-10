import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeatureEnvironmentModel } from "./feature-environment.model";
import { FeatureVariantModel } from "./feature-variant.model";
import { FeatureImpressionModel } from "./impression.model";

@Entity()
export class FeatureModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    key: string;

    @Column({ default: false })
    active: boolean;

    @OneToMany(() => FeatureEnvironmentModel, settings => settings.id)
    environmentSettings: FeatureEnvironmentModel[];

    @OneToOne(() => FeatureVariantModel, variant => variant.id)
    activeDefaultVariant: FeatureVariantModel;

    @OneToOne(() => FeatureVariantModel, variant => variant.id)
    inactiveVariant: FeatureVariantModel;

    @OneToMany(() => FeatureImpressionModel, imp => imp.feature)
    impressions: FeatureImpressionModel[];

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    toDto() {
        return FeatureModel.toDto(this);
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

    constructor(obj: Partial<FeatureModel>) {
        if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
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
            impressions: obj?.impressions ? obj.impressions.map(imp => FeatureImpressionModel.toDto(imp)) : [],
            createdAt: obj?.createdAt?.toISOString?.() ?? null,
            updatedAt: obj?.updatedAt?.toISOString?.() ?? null
        }
    }

}
