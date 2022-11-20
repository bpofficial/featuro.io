import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class EnvironmentModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return EnvironmentModel.toDto(this)
    }

    merge(obj: DeepPartial<EnvironmentModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.key) this.key = obj.key;
        if (obj.name) this.name = obj.name;

        return this;
    }

    constructor(obj?: DeepPartial<EnvironmentModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
    }

    static mergeMany(a: DeepPartial<EnvironmentModel[]> = [], b: DeepPartial<EnvironmentModel>[] = []): EnvironmentModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;
        return joinArraysByIdWithAssigner<EnvironmentModel>(EnvironmentModel.merge, a, b);
    }

    static merge(a: DeepPartial<EnvironmentModel>, b: DeepPartial<EnvironmentModel>) {
        return new EnvironmentModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new EnvironmentModel(result);
    }

    static toDto(obj?: Partial<EnvironmentModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name
        }
    }
}
