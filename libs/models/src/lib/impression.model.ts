import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FeatureEnvironmentModel } from "./feature-environment.model";
import { FeatureModel } from "./feature.model";

@Entity()
export class FeatureImpressionModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FeatureModel, ft => ft.impressions)
    feature: FeatureModel;

    @CreateDateColumn()
    createdAt: Date;

    toDto() {
        return FeatureImpressionModel.toDto(this);
    }

    merge(obj: DeepPartial<FeatureImpressionModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.feature) delete obj.feature; // recurring
        if (obj.createdAt) delete obj.createdAt;

        return this;
    }

    constructor(obj: DeepPartial<FeatureImpressionModel>) {
        if (isObjectLike(obj)) Object.assign(this, obj);
    }

    static mergeMany(a: DeepPartial<FeatureImpressionModel[]> = [], b: DeepPartial<FeatureImpressionModel>[] = []): FeatureImpressionModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;;
        return joinArraysByIdWithAssigner<FeatureImpressionModel>(FeatureImpressionModel.merge, a, b);
    }

    static merge(a: DeepPartial<FeatureImpressionModel>, b: DeepPartial<FeatureImpressionModel>) {
        return new FeatureImpressionModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new FeatureImpressionModel(result);
    }

    static toDto(obj?: Partial<FeatureImpressionModel>) {
        if (!obj) return null;
        return {

        }
    }
}
