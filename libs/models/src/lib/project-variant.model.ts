import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectModel } from "./project.model";

@Entity('project_variants')
export class ProjectVariantModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToOne(() => ProjectModel)
    @JoinColumn()
    project: ProjectModel

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return ProjectVariantModel.toDto(this);
    }

    merge(obj: DeepPartial<ProjectVariantModel>) {
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

    constructor(obj?: Partial<ProjectVariantModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
    }

    static mergeMany(a: DeepPartial<ProjectVariantModel[]> = [], b: DeepPartial<ProjectVariantModel>[] = []): ProjectVariantModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;;
        return joinArraysByIdWithAssigner<ProjectVariantModel>(ProjectVariantModel.merge, a, b);
    }

    static merge(a: Partial<ProjectVariantModel>, b: Partial<ProjectVariantModel>) {
        return new ProjectVariantModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new ProjectVariantModel(result);
    }

    static toDto(obj?: Partial<ProjectVariantModel>) {
        if (!isObjectLike(obj)) return null;
        return {
            id: obj?.id,
            name: obj?.name,
            key: obj?.key,
            description: obj?.description,
            createdAt: obj?.createdAt,
            updatedAt: obj?.updatedAt
        }
    }
}
