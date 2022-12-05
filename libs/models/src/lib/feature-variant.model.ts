import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectVariantModel } from "./project-variant.model";

@Entity('feature_variants')
export class FeatureVariantModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ManyToOne(() => ProjectVariantModel, { eager: true })
    @JoinColumn()
    variant: ProjectVariantModel;

    @Column({ nullable: true })
    split: number | null // split %

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
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (typeof obj.split === 'number' || obj.split === null) 
            this.split = obj.split;

        return this;
    }

    constructor(obj?: Partial<FeatureVariantModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
    }

    static mergeMany(a: DeepPartial<FeatureVariantModel[]> = [], b: DeepPartial<FeatureVariantModel>[] = []): FeatureVariantModel[] {
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
        if (!isObjectLike(obj)) return null;

        return {
            id: obj.id,
            variant: obj.variant,
            split: obj.split,
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt
        }
    }
}
