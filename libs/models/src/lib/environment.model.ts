import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectModel } from "./project.model";

@Entity('environments')
export class EnvironmentModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @Column()
    apiKey: string;

    @ManyToOne(() => ProjectModel, proj => proj.environments)
    project: ProjectModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return EnvironmentModel.toDto(this)
    }

    validate(softValidate = false): true | string[] {
        return true;
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
        if (isObjectLike(obj)) Object.assign(this, obj);
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

    static fromObjectArray(results: any[]) {
        return results.map(r => EnvironmentModel.fromObject(r))
    }

    static toDto(obj?: Partial<EnvironmentModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name
        }
    }
}
