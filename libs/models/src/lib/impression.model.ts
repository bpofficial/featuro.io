import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FeatureModel } from "./feature.model";

@Entity()
export class FeatureImpressionModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FeatureModel, ft => ft.impressions)
    feature: FeatureModel;

    toDto() {
        return FeatureImpressionModel.toDto(this);
    }

    constructor(obj: Partial<FeatureImpressionModel>) {
        if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
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
