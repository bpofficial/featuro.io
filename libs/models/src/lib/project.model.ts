import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnvironmentModel } from "./environment.model";
import { FeatureModel } from "./feature.model";
import { OrganisationModel } from "./organisation.model";
import { object, string, number } from 'yup';

@Entity('projects')
export class ProjectModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @OneToMany(() => EnvironmentModel, env => env.id, { cascade: ['soft-remove'] })
    environments: EnvironmentModel[];

    @OneToMany(() => FeatureModel, ft => ft.project, { cascade: ['soft-remove'] })
    features: FeatureModel[]

    @ManyToOne(() => OrganisationModel, org => org.projects)
    organisation: OrganisationModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return ProjectModel.toDto(this)
    }

    merge(obj: DeepPartial<ProjectModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.organisation) delete obj.organisation;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.key) this.key = obj.key;
        if (obj.name) this.name = obj.name;
        if (obj.environments) this.environments = EnvironmentModel.mergeMany(this.environments, obj.environments);
        if (obj.features) this.features = FeatureModel.mergeMany(this.features, obj.features);

        return this;
    }

    validate(softValidate = false): true | string[] {
        try {
            const schema = object({
                name: softValidate ? string() : string().required(),
                key: softValidate ? string() : string().required(),
            });
        
            schema.validateSync(this);
            return true;
        } catch (err) {
            return err.errors || ['Unknown error'];
        }
    }

    constructor(obj?: DeepPartial<ProjectModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            if (this.environments) {
                this.environments = this.environments.map(env => EnvironmentModel.fromObject(env))
            } else {
                this.environments = [];
            }

            if (this.features) {
                this.features = this.features.map(ft => FeatureModel.fromObject(ft));
            } else {
                this.features = [];
            }

            if (this.organisation) {
                this.organisation = OrganisationModel.fromObject(this.organisation)
            }
        }
    }

    static mergeMany(a: DeepPartial<ProjectModel[]> = [], b: DeepPartial<ProjectModel>[] = []): ProjectModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as any;;
        return joinArraysByIdWithAssigner<ProjectModel>(ProjectModel.merge, a, b);
    }

    static merge(a: DeepPartial<ProjectModel>, b: DeepPartial<ProjectModel>) {
        return new ProjectModel(a).merge(b);
    }

    static fromObject(result: any) {
        return new ProjectModel(result);
    }

    static fromObjectArray(results: any[]) {
        return results.map(r => ProjectModel.fromObject(r))
    }

    static toDto(obj?: Partial<ProjectModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name
        }
    }
}
