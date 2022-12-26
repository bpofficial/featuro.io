import { Column, CreateDateColumn, DeepPartial, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProjectTargetModel } from "./project-target.model";
import get from 'get-value';
import { DateTime, DateTimeOptions } from 'luxon';
import { isArrayLike, isObjectLike, joinArraysByIdWithAssigner } from "@featuro.io/common";
import { object, string } from "yup";
import { FeatureConditionSetModel } from "./feature-condition-set.model";

@Entity('feature_conditions')
export class FeatureConditionModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // i.e. Date, Hour of the Day, Subdomain, Email etc...
    @ManyToOne(() => ProjectTargetModel, { eager: true })
    @JoinColumn()
    target: ProjectTargetModel;

    @Column()
    operator: string;

    // This value is static and stored with the condition.
    @Column()
    staticOperand: string;

    @ManyToOne(() => FeatureConditionSetModel)
    @JoinColumn()
    cset: FeatureConditionSetModel;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    toDto() {
        return FeatureConditionModel.toDto(this);
    }

    validate(softValidate = false) {
        try {
            const schema = FeatureConditionModel.getValidationSchema(!softValidate);
            schema.validateSync(this);
            return true;
        } catch (err) {
            return err.errors || ['Unknown error'];
        }
    }

    merge(obj: DeepPartial<FeatureConditionModel>) {
        if (!isObjectLike(obj)) return this;

        // Disallowed fields
        if (obj.id) delete obj.id;
        if (obj.createdAt) delete obj.createdAt;
        if (obj.updatedAt) delete obj.updatedAt;
        if (obj.deletedAt) delete obj.deletedAt;

        // Direct-update fields
        if (obj.operator) this.operator = obj.operator;
        if (obj.staticOperand) this.staticOperand = obj.staticOperand;

        // Deep-merging fields
        if (obj.target) this.target.merge(obj.target);

        return this;
    }

    eval(valueA: unknown, valueB: unknown, type: 'number' | 'string' | 'date', op: string) {
        switch (type) {
            case 'number':
                switch (op) {
                    case 'eq': // equals
                        return valueA == valueB;
                    case 'neq': // not equals
                        return valueA !== valueB;
                    case 'gt':
                        return valueA > valueB;
                    case 'gte':
                        return valueA >= valueB;
                    case 'lt':
                        return valueA < valueB;
                    case 'lte':
                        return valueA <= valueB;
                }

                /* istanbul ignore next */
                break;
            case 'string' :
                switch (op) {
                    case 'eq': // equals
                        return valueA == valueB;
                    case 'neq': // not equals
                        return valueA !== valueB;
                    case 'co': // contains
                        if (typeof valueA === 'string') {
                            return valueA.includes(valueB as string);
                        }
                        break;
                    case 'nco': // not contains
                        if (typeof valueA === 'string') {
                            return !valueA.includes(valueB as string);
                        }
                        break;
                    case 'sw': // starts with
                        if (typeof valueA === 'string') {
                            return !valueA.startsWith(valueB as string);
                        }
                        break;
                    case 'ew': // ends with
                        if (typeof valueA === 'string') {
                            return !valueA.endsWith(valueB as string);
                        }
                        break;
                    case 'regex':
                        //
                }

                /* istanbul ignore next */
                break;
        }
    }

    evalulate(context: Record<string, unknown>) {
        let value: string | number | DateTime;
        let type: string;
        const zone = context?.timeZone as DateTimeOptions['zone'] ?? null;
        const date = DateTime.fromObject({}, zone ? { zone } : {});

        if (!this.target.isSystem && this.target.valueKey) {
            value = get(context, this.target.valueKey) ?? null;
            type = Number.isNaN(Number(value)) ? 'string' : 'number';
        } else {
            // system values
            switch (this.target.key) {
                case 'hod': // Hour of Day
                    value = date.get('hour');
                    type = 'number';
                    break;
                case 'date': // Current date
                    value = date;
                    type = 'date';
                    break;
            }
        }

        if (type === this.target.type) {
            switch (this.target.type) {
                case 'number':
                    {
                        const numA = Number(value);
                        const numB = Number(this.staticOperand);
                        return this.eval(numA, numB, type, this.operator)
                    }
                case 'date':
                    {
                        const diff = date.diff(DateTime.fromISO(this.staticOperand, { zone })).milliseconds;
                        switch (this.operator) {
                            case 'before':
                                return diff < 0;
                            case 'after':
                                return diff >= 0;
                        }
                        /* istanbul ignore next */
                        break;
                    }
                case 'string':
                    {
                        if (typeof value === 'string') {
                            let strA = value;
                            let strB = this.staticOperand;

                            if (!this.target.caseSensitive) {
                                strA = value.toLowerCase();
                                strB = this.staticOperand.toLowerCase();
                            }

                            return this.eval(strA, strB, type, this.operator)
                        }
                    }
            }
        }
        /* istanbul ignore next */
        return false;
    }

    constructor(obj?: DeepPartial<FeatureConditionModel>) {
        if (isObjectLike(obj)) {
            Object.assign(this, obj);

            this.target = ProjectTargetModel.fromObject(this.target);
        }
    }

    static mergeMany(a: DeepPartial<FeatureConditionModel[]> = [], b: DeepPartial<FeatureConditionModel>[] = []): FeatureConditionModel[] {
        if (!isArrayLike(a) || !isArrayLike(b)) return (a || b) as FeatureConditionModel[];
        return joinArraysByIdWithAssigner<FeatureConditionModel>(FeatureConditionModel.merge, a, b);
    }

    static merge(a: DeepPartial<FeatureConditionModel>, b: DeepPartial<FeatureConditionModel>) {
        return new FeatureConditionModel(a).merge(b);
    }

    static fromObject(result: unknown) {
        return new FeatureConditionModel(result);
    }

    static toDto(obj?: Partial<FeatureConditionModel>) {
        if (!obj) return null;
        return {
            id: obj?.id,
            target: obj?.target,
            operator: obj?.operator,
            staticOperand: obj?.staticOperand,
            createdAt: obj?.createdAt?.toISOString?.() ?? null,
            updatedAt: obj?.updatedAt?.toISOString?.() ?? null
        }
    }

    static getValidationSchema(strict = false) { 
        return object({
            target: ProjectTargetModel.getValidationSchema(strict),
            operator: string()[strict ? 'required' : 'optional'](),
            staticOperand: string()[strict ? 'required' : 'optional']()
        });
    }
}
