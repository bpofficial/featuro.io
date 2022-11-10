import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { FeatureTargetModel } from "./feature-target.model";
import get from 'get-value';
import { DateTime } from 'luxon';

@Entity()
export class FeatureConditionModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // i.e. Date, Hour of the Day, Subdomain, Email etc...
    @ManyToOne(() => FeatureTargetModel, target => target.id)
    target: FeatureTargetModel;

    @Column()
    operator: string;

    // This value is static and stored with the condition.
    @Column()
    staticOperand: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    eval(valueA: any, valueB: any, type: any, op: any) {
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
            case 'string':
                switch (op) {
                    case 'eq': // equals
                        return valueA == valueB;
                    case 'neq': // not equals
                        return valueA !== valueB;
                    case 'co': // contains
                        return valueA.includes(valueB);
                    case 'nco': // not contains
                        return !valueA.includes(valueB);
                    case 'sw': // starts with
                        return valueA.startsWith(valueB);
                    case 'ew': // ends with
                        return valueA.endsWith(valueB);
                    case 'regex':
                        //
                }

                /* istanbul ignore next */
                break;
        }
    }

    evalulate(context: Record<string, any>) {
        let value: any;
        let type: string;
        const zone = context.timeZone ?? null;
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
                    let na = Number(value);
                    let nb = Number(this.staticOperand);
                    return this.eval(na, nb, type, this.operator)
                case 'date':
                    const diff = date.diff(DateTime.fromISO(this.staticOperand, { zone })).milliseconds;
                    switch (this.operator) {
                        case 'before':
                            return diff < 0;
                        case 'after':
                            return diff >= 0;
                    }
                    /* istanbul ignore next */
                    break;
                case 'string':
                    let sa: string = value;
                    let sb: string = this.staticOperand;

                    if (!this.target.caseSensitive) {
                        sa = value.toLowerCase();
                        sb = this.staticOperand.toLowerCase();
                    }

                    return this.eval(sa, sb, type, this.operator)
            }
        }
        /* istanbul ignore next */
        return false;
    }

    toDto() {
        return FeatureConditionModel.toDto(this);
    }

    constructor(obj?: Partial<FeatureConditionModel>) {
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
            Object.assign(this, obj);

            this.target = FeatureTargetModel.fromObject(this.target);
        }
    }

    static fromObject(result: any) {
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
}
