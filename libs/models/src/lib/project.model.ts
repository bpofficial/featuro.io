import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EnvironmentModel } from "./environment.model";
import { FeatureModel } from "./feature.model";
import { OrganisationModel } from "./organisation.model";

@Entity()
export class ProjectModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    @OneToMany(() => EnvironmentModel, env => env.id)
    environments: EnvironmentModel[];

    @OneToMany(() => FeatureModel, ft => ft.id)
    features: FeatureModel[]

    @ManyToOne(() => OrganisationModel, org => org.projects)
    organisation: OrganisationModel;

    toDto() {
        return ProjectModel.toDto(this)
    }

    constructor(obj?: Partial<ProjectModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
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

    static fromObject(result: any) {
        return new ProjectModel(result);
    }

    static toDto(obj?: Partial<ProjectModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            name: obj?.name
        }
    }
}
