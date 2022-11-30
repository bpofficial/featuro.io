
import { DateTime } from 'luxon';
import { EnvironmentModel } from './environment.model';
import { FeatureConditionSetModel } from './feature-condition-set.model';
import { FeatureConditionModel } from './feature-condition.model';
import { FeatureEnvironmentModel } from './feature-environment.model';
import { FeatureTargetModel } from './feature-target.model';
import { FeatureVariantModel } from './feature-variant.model';
import { FeatureModel } from './feature.model';

describe('FeatureModel', () => {

    const env = new EnvironmentModel({
        key: 'test-env'
    })

    const targets = {
        string: new FeatureTargetModel({
            valueKey: 'strValue',
            type: 'string'
        }),
        number: new FeatureTargetModel({
            valueKey: 'numValue',
            type: 'number'
        }),
        date: new FeatureTargetModel({
            key: 'date',
            type: 'date',
            isSystem: true
        }),
        hour: new FeatureTargetModel({
            key: 'hod',
            type: 'number',
            isSystem: true
        }),
    }

    const variants = {
        On: new FeatureVariantModel({ name: 'On' }),
        Off: new FeatureVariantModel({ name: 'Off' })
    }

    const getFeature = (cds: FeatureConditionModel[]) => new FeatureModel({
        active: true,
        environmentSettings: [
            new FeatureEnvironmentModel({
                environment: env,
                activeDefaultVariant: variants.Off,
                inactiveVariant: variants.Off,
                conditionSets: [
                    new FeatureConditionSetModel({
                        name: 'cd1',
                        variant: variants.On,
                        conditions: cds
                    })
                ]
            })
        ]
    });

    describe('when the evaluation is using numbers', () => {
        it('should evaluate the numeric equality to true', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'eq',
                    staticOperand: '1',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate the numeric equality to true', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'eq',
                    staticOperand: '2',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })

        it('should evaluate the numeric inequality to true', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'neq',
                    staticOperand: '2',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate the numeric inequality to true', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'neq',
                    staticOperand: '1',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })

        it('should evaluate that the provided number is greater than the set number', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'gt',
                    staticOperand: '0',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate that the provided number is greater than the set number', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'gt',
                    staticOperand: '2',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })

        it('should evaluate that the provided number is greater than or equal to the set number (1)', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'gte',
                    staticOperand: '0',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should evaluate that the provided number is greater than or equal to the set number (2)', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'gte',
                    staticOperand: '1',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate that the provided number is greater than or equal to the set number', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'gte',
                    staticOperand: '3',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })

        it('should evaluate that the provided number is less than the set number', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'lt',
                    staticOperand: '5',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate that the provided number is less than the set number', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'lt',
                    staticOperand: '0',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })

        it('should evaluate that the provided number is less than or equal to the set number (1)', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'lte',
                    staticOperand: '2',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should evaluate that the provided number is less than or equal to the set number (2)', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'lte',
                    staticOperand: '1',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate that the provided number is greater than or equal to the set number', () => {
            const context = {
                numValue: '1'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.number,
                    operator: 'lte',
                    staticOperand: '0',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })
    })

    describe('when the evaluation is using strings', () => {
        it('should evaluate the string equalty to true', () => {
            const context = {
                strValue: 'abc'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.string,
                    operator: 'eq',
                    staticOperand: 'abc',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should evaluate the string equalty to false', () => {
            const context = {
                strValue: 'abcd'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.string,
                    operator: 'eq',
                    staticOperand: 'abc',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('Off');
        })

        it('should evaluate the string to contain certain characters', () => {
            const context = {
                strValue: 'abcd'
            }

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.string,
                    operator: 'co',
                    staticOperand: 'abc',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })
    })

    describe('when the evaluation is using dates', () => {
        it('should evaluate that the current date is before the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'before',
                    staticOperand: DateTime.now().plus({ days: 6 }).toISO(),
                })
            ])

            const result = feature.evaluate('test-env');
            expect(result.name).toBe('On');
        })

        it('should evaluate that the current date is not before the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'before',
                    staticOperand: DateTime.now().plus({ days: -1 }).toISO(),
                })
            ])

            const result = feature.evaluate('test-env');
            expect(result.name).toBe('Off');
        })

        it('should evaluate that the current date is after the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'after',
                    staticOperand: DateTime.now().plus({ days: -1 }).toISO(),
                })
            ])

            const result = feature.evaluate('test-env');
            expect(result.name).toBe('On');
        })

        it('should evaluate that the current date is not after the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'after',
                    staticOperand: DateTime.now().plus({ days: 6 }).toISO(),
                })
            ])

            const result = feature.evaluate('test-env');
            expect(result.name).toBe('Off');
        })

        it('should evaluate that the current hour is equal to the set value', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'eq',
                    staticOperand: DateTime.now().get('hour').toString(),
                })
            ])

            const result = feature.evaluate('test-env');
            expect(result.name).toBe('On');
        })
    })

    describe('when using multiple conditions', () => {
        it('should evaluate that all conditions are met', () => {
            const context = {
                strValue: 'some-form-of-id'
            };

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'after',
                    staticOperand: DateTime.now().plus({ days: -1 }).toISO(),
                }),
                new FeatureConditionModel({
                    target: targets.string,
                    operator: 'eq',
                    staticOperand: 'some-form-of-id',
                })
            ])

            const result = feature.evaluate('test-env', context);
            expect(result.name).toBe('On');
        })

        it('should not evaluate that all conditions are met', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'after',
                    staticOperand: DateTime.now().plus({ days: -1 }).toISO(),
                }),
                new FeatureConditionModel({
                    target: targets.string,
                    operator: 'eq',
                    staticOperand: 'some-form-of-id',
                })
            ])

            // Missing context here, so it will evaluate to Off as the second condition isn't met.
            const result = feature.evaluate('test-env');
            expect(result.name).toBe('Off');
        })
    })

})
