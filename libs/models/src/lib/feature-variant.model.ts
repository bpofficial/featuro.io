import { Column, PrimaryGeneratedColumn } from "typeorm";

export class FeatureVariantModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    key: string;

    @Column()
    description: string;

    @Column({ default: false })
    isDefaultVariant: boolean;

    toDto() {
        return FeatureVariantModel.toDto(this);
    }

    constructor(obj?: Partial<FeatureVariantModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
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
