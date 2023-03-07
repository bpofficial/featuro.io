import { DeepPartial, isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnvironmentModel } from "./environment.model";
import { FeatureModel } from "./feature.model";
import { OrganisationModel } from "./organisation.model";
import { object, string } from 'yup';
import { ProjectTargetModel } from "./project-target.model";
import { ProjectVariantModel } from "./project-variant.model";

@Entity('projects')
export class ProjectModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @OneToMany(() => EnvironmentModel, env => env.project, { cascade: ['soft-remove'] })
    environments: EnvironmentModel[];

    @OneToMany(() => FeatureModel, ft => ft.project, { cascade: ['soft-remove'] })
    features: FeatureModel[]

    @OneToMany(() => ProjectTargetModel, pt => pt.project, { cascade: ['soft-remove', 'insert'] })
    targets: ProjectTargetModel[];

    @OneToMany(() => ProjectVariantModel, pv => pv.project, { cascade: ['soft-remove', 'insert'] })
    variants: ProjectVariantModel[]

    @ManyToOne(() => OrganisationModel)
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
        if (obj.name) this.name = obj.name;

        // Deep-update fields
        if (obj.environments) this.environments = EnvironmentModel.mergeMany(this.environments, obj.environments);
        if (obj.features) this.features = FeatureModel.mergeMany(this.features, obj.features);
        if (obj.targets) this.targets = ProjectTargetModel.mergeMany(this.targets, obj.targets);
        if (obj.variants) this.variants = ProjectVariantModel.mergeMany(this.variants, obj.variants);

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
                this.environments = this.environments.map(EnvironmentModel.fromObject)
            }

            if (this.features) {
                this.features = this.features.map(FeatureModel.fromObject);
            }

            if (this.organisation) {
                this.organisation = OrganisationModel.fromObject(this.organisation)
            }
        }
    }

    static mergeMany(a: DeepPartial<ProjectModel[]> = [], b: DeepPartial<ProjectModel>[] = []): ProjectModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as ProjectModel[];
        return joinArraysByIdWithAssigner<ProjectModel>(ProjectModel.merge, a, b);
    }

    static merge(a: DeepPartial<ProjectModel>, b: DeepPartial<ProjectModel>) {
        return new ProjectModel(a).merge(b);
    }

    static fromObject(result: unknown) {
        return new ProjectModel(result);
    }

    static fromObjectArray(results: unknown[]) {
        return results.map(r => ProjectModel.fromObject(r))
    }

    static toDto(obj?: Partial<ProjectModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name,
            environments: obj?.environments ? obj.environments.map(env => EnvironmentModel.toDto(env)) : [],
            features: obj?.features ? obj.features.map(feat => FeatureModel.toDto(feat)) : [],
            createdAt: obj?.createdAt,
            updatedAt: obj?.updatedAt
        }
    }

    static EXPAND_WHITELIST = [
        'organisation'
    ]
}
