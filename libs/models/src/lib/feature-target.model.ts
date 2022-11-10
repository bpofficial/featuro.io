import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
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
    project: string | null;

    // This is the dot path used to find a value in the given api/sdk context.
    @Column({ nullable: true })
    valueKey: string | null;

    @Column({ enum: ['number', 'date', 'string'] })
    type: 'number' | 'date' | 'string';

    @Column({ default: false })
    caseSensitive: boolean;

    @Column({ default: false })
    isSystem: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    toDto() {
        return FeatureTargetModel.toDto(this);
    }

    constructor(obj?: Partial<FeatureTargetModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
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
