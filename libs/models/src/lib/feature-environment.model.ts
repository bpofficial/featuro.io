import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnvironmentModel } from "./environment.model";
import { FeatureConditionSetModel } from "./feature-condition-set.model";
import { FeatureVariantModel } from "./feature-variant.model";
import { FeatureModel } from "./feature.model";

@Entity('feature_environments')
export class FeatureEnvironmentModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    isActive: boolean;

    @ManyToOne(() => EnvironmentModel, { eager: true })
    @JoinColumn()
    environment: EnvironmentModel;

    @ManyToOne(() => FeatureModel, feat => feat.environmentSettings)
    @JoinColumn()
    feature: FeatureModel;

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

        if (typeof obj.isActive === 'boolean') this.isActive = obj.isActive;

        return this;
    }

    constructor(obj?: DeepPartial<FeatureEnvironmentModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);
            this.feature = FeatureModel.fromObject(this.feature);
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
            isActive: obj.isActive,
            environment: EnvironmentModel.toDto(obj?.environment)
        }
    }

    static fromArrayToObject(objs: Partial<FeatureEnvironmentModel>[]) {
        if (!isArrayLike(objs)) return [];
        return objs.reduce((a, v) => {
            if (!v || !v.environment || !v.environment.key) return a;
            a[v.environment.key] = FeatureEnvironmentModel.fromObject(v);
            return a;
        }, {} as Record<string, Partial<FeatureEnvironmentModel>>);
    }
}
