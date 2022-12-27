// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
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

        // Update
        if (obj.variant.id) this.variant = new ProjectVariantModel({ id: obj.variant.id });

        return this;
    }

    constructor(obj?: Partial<FeatureVariantModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (obj.variant) {
                this.variant = ProjectVariantModel.fromObject(obj.variant);
            }
        }
    }

    static mergeMany(a: DeepPartial<FeatureVariantModel[]> = [], b: DeepPartial<FeatureVariantModel>[] = []): FeatureVariantModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as FeatureVariantModel[];
        return joinArraysByIdWithAssigner<FeatureVariantModel>(FeatureVariantModel.merge, a, b);
    }

    static merge(a: Partial<FeatureVariantModel>, b: Partial<FeatureVariantModel>) {
        return new FeatureVariantModel(a).merge(b);
    }

    static fromObject(result: unknown) {
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

    static toResult(obj: FeatureVariantModel) {
        return {
            variant: obj.variant.key,
            split: obj.split
        }
    }

    static fromArrayToEvaluation(variants: FeatureVariantModel[]) {
        const length = variants.length;
        let countHasSplit = 0;
        let totalSplitVal = 0;
        
        return variants
            .map(variant => {
                if (typeof variant.split === 'number') {
                    countHasSplit++;
                    totalSplitVal += variant.split; // += 0.5 or 0.25 or 0.1 etc etc etc
                }
                return variant
            }).map(variant => {
                // calculate the split of variants that don't have split percentages
                // by the remaining total % after variants that do have split percentages.
                if (countHasSplit !== totalSplitVal) {
                    variant.split = (1 - totalSplitVal) / (length - countHasSplit);
                }
                return FeatureVariantModel.toResult(variant);
            });
    }
}
