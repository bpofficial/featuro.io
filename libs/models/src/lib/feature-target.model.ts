import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('feature_targets')
export class FeatureTargetModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    owner: string | null;

    @Column({ nullable: true })
    project: string | null; // ??

    // This is the dot path used to find a value in the given api/sdk context.
    @Column({ nullable: true })
    valueKey: string | null;

    @Column({ enum: ['number', 'date', ], type: 'enum' })
    type: 'number' | 'date' | 'string' ;

    @Column({ default: false })
    caseSensitive: boolean;

    @Column({ default: false })
    isSystem: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return FeatureTargetModel.toDto(this);
    }

    merge(obj: DeepPartial<FeatureTargetModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.key) this.key = obj.key;
        if (obj.name) this.name = obj.name;
        if (obj.owner) this.owner = obj.owner;
        if (obj.project) this.project = obj.project;
        if (obj.valueKey) this.valueKey = obj.valueKey;
        if (obj.type) this.type = obj.type;
        if (obj.caseSensitive) this.caseSensitive = obj.caseSensitive;
        if (obj.isSystem) this.isSystem = obj.isSystem;
        
        return this;
    }

    constructor(obj?: Partial<FeatureTargetModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
    }

    static mergeMany(a: Partial<FeatureTargetModel[]> = [], b: Partial<FeatureTargetModel>[] = []) {
        if (!isArrayLike(a) || !isArrayLike(b)) return;
        return joinArraysByIdWithAssigner(FeatureTargetModel.merge, a, b);
    }

    static merge(a: Partial<FeatureTargetModel>, b: Partial<FeatureTargetModel>) {
        return new FeatureTargetModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new FeatureTargetModel(result);
    }

    static toDto(obj?: Partial<FeatureTargetModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            key: obj?.key,
            name: obj?.name,
            owner: obj?.owner,
            project: obj?.project,
            type: obj?.type,
            createdAt: obj?.createdAt?.toISOString?.() ?? null,
            updatedAt: obj?.updatedAt?.toISOString?.() ?? null,
        }
    }
}
