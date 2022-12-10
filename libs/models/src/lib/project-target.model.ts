import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { bool, object, string } from "yup";
import { ProjectModel } from "./project.model";
import { DateTime } from 'luxon';

/**
 * Dropdown options available when creating a condition (within a condition set).
 * These are set at the project level and are reusable across features/environments etc.
 */
@Entity('project_targets')
export class ProjectTargetModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    // This is the dot path used to find a value in the given api/sdk context.
    // If it's null & isSystem is true, then the calculation will use the key of this target (hod, date etc)
    @Column({ nullable: true })
    valueKey: string | null;

    @Column({ enum: ['number', 'date', ], type: 'enum' })
    type: 'number' | 'date' | 'string' ;

    @Column({ default: false })
    caseSensitive: boolean;

    @Column({ default: false })
    isSystem: boolean;

    @ManyToOne(() => ProjectModel)
    @JoinColumn()
    project: ProjectModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return ProjectTargetModel.toDto(this);
    }

    validate(softValidate = false): true | string[] {
        try {
            const schema = object({
                key: string(),
                name: softValidate ? string() : string().required(),
                type: softValidate ? string() : string().required(),
                valueKey: string(),
                caseSensitive: bool(),
            });
        
            schema.validateSync(this);
            return true;
        } catch (err) {
            return err.errors || ['Unknown error'];
        }
    }
    merge(obj: DeepPartial<ProjectTargetModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.key) delete obj.key;
        if (obj.project) delete obj.project;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.name) this.name = obj.name;
        if (obj.valueKey) this.valueKey = obj.valueKey;
        if (obj.type) this.type = obj.type;
        if (obj.caseSensitive) this.caseSensitive = obj.caseSensitive;
        if (typeof obj.isSystem === 'boolean') this.isSystem = obj.isSystem;
        
        return this;
    }

    constructor(obj?: DeepPartial<ProjectTargetModel>) {
        if (isObjectLike(obj)) Object.assign(this, obj);
    }

    static mergeMany(a: DeepPartial<ProjectTargetModel[]> = [], b: DeepPartial<ProjectTargetModel>[] = []): ProjectTargetModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return;
        return joinArraysByIdWithAssigner<ProjectTargetModel>(ProjectTargetModel.merge, a, b);
    }

    static merge(a: Partial<ProjectTargetModel>, b: Partial<ProjectTargetModel>) {
        return new ProjectTargetModel(a).merge(b);
    }

    static fromObject(result: unknown) {
        return new ProjectTargetModel(result);
    }

    static fromObjectArray(results: unknown[]) {
        return results.map(r => ProjectTargetModel.fromObject(r))
    }

    static toDto(obj?: Partial<ProjectTargetModel>) {
        if (!isObjectLike(obj)) return null;
        return {
            id: obj?.id,
            key: obj?.key,
            name: obj?.name,
            project: obj?.project,
            type: obj?.type,
            createdAt: obj?.createdAt?.toISOString?.() ?? null,
            updatedAt: obj?.updatedAt?.toISOString?.() ?? null,
        }
    }
}
