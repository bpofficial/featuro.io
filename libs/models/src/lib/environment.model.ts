import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class EnvironmentModel {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    name: string;

    toDto() {
        return EnvironmentModel.toDto(this)
    }

    constructor(obj?: Partial<EnvironmentModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);
        }
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
