import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('feature_variants')
export class FeatureVariantModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column('bool', { default: false })
    isDefaultVariant: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return FeatureVariantModel.toDto(this);
    }

    merge(obj: DeepPartial<FeatureVariantModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.key) this.key = obj.key;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.name) this.name = obj.name;
        if (obj.description) this.description = obj.description;

        return this;
    }

    constructor(obj?: Partial<FeatureVariantModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
    }

    static mergeMany(a: Partial<FeatureVariantModel[]> = [], b: Partial<FeatureVariantModel>[] = []): FeatureVariantModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;;
        return joinArraysByIdWithAssigner<FeatureVariantModel>(FeatureVariantModel.merge, a, b);
    }

    static merge(a: Partial<FeatureVariantModel>, b: Partial<FeatureVariantModel>) {
        return new FeatureVariantModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new FeatureVariantModel(result);
    }

    static toDto(obj?: Partial<FeatureVariantModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name,
            key: obj?.key,
            description: obj?.description,
            isDefaultVariant: obj?.isDefaultVariant,
        }
    }
}
