
import { DateTime } from 'luxon';
import { EnvironmentModel } from './environment.model';
import { FeatureConditionSetModel } from './feature-condition-set.model';
import { FeatureConditionModel } from './feature-condition.model';
import { FeatureEnvironmentModel } from './feature-environment.model';
import { ProjectTargetModel } from './project-target.model';
import { FeatureVariantModel } from './feature-variant.model';
import { FeatureModel } from './feature.model';
import { ProjectVariantModel } from './project-variant.model';

describe('FeatureModel', () => {

    const env = new EnvironmentModel({ key: 'test-env' })

    const targets = {
        string: new ProjectTargetModel({
            valueKey: 'strValue',
            type: 'string'
        }),
        number: new ProjectTargetModel({
            valueKey: 'numValue',
            type: 'number'
        }),
        date: new ProjectTargetModel({
            key: 'date',
            type: 'date',
            isSystem: true
        }),
        hour: new ProjectTargetModel({
            key: 'hod',
            type: 'number',
            isSystem: true
        }),
    }

    const projectVariants = {
        On: new ProjectVariantModel({ key: 'On' }),
        Off: new ProjectVariantModel({ key: 'Off' })
    }

    const featureVariants = {
        On: new FeatureVariantModel({ variant: projectVariants.On }),
        Off: new FeatureVariantModel({ variant: projectVariants.Off })
    }

    const getFeature = (cds: FeatureConditionModel[]) => new FeatureModel({
        activeDefaultVariant: featureVariants.Off,
        inactiveVariant: featureVariants.Off,
        conditionSets: [
            new FeatureConditionSetModel({
                name: 'cd1',
                conditions: cds,
                variants: [featureVariants.On],
            })
        ],
        environmentSettings: [
            new FeatureEnvironmentModel({
                isActive: true,
                environment: env,
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('Off');
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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

            const variants = feature.evaluate('test-env');
            expect(variants[0].variant).toBe('On');
        })

        it('should evaluate that the current date is not before the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'before',
                    staticOperand: DateTime.now().plus({ days: -1 }).toISO(),
                })
            ])

            const variants = feature.evaluate('test-env');
            expect(variants[0].variant).toBe('Off');
        })

        it('should evaluate that the current date is after the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'after',
                    staticOperand: DateTime.now().plus({ days: -1 }).toISO(),
                })
            ])

            const variants = feature.evaluate('test-env');
            expect(variants[0].variant).toBe('On');
        })

        it('should evaluate that the current date is not after the set date', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.date,
                    operator: 'after',
                    staticOperand: DateTime.now().plus({ days: 6 }).toISO(),
                })
            ])

            const variants = feature.evaluate('test-env');
            expect(variants[0].variant).toBe('Off');
        })

        it('should evaluate that the current hour is equal to the current hour', () => {
            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'eq',
                    staticOperand: DateTime.now().get('hour').toString(),
                })
            ])

            const variants = feature.evaluate('test-env');
            expect(variants[0].variant).toBe('On');
        })

        it('should evaluate that the current hour is or isn\'t equal to a set hour', () => {
            const hour = '10';
            const now = DateTime.now().get('hour').toString();

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'eq',
                    staticOperand: hour,
                })
            ])

            const variants = feature.evaluate('test-env');

            if (now !== hour) {
                expect(variants[0].variant).toBe('Off');
            } else {
                expect(variants[0].variant).toBe('On');
            }
        })

        it('should evaluate that the current hour isn\'t or is equal to a set hour', () => {
            const hour = 10;
            const now = DateTime.now().get('hour');

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'neq',
                    staticOperand: hour.toString(),
                })
            ])

            const variants = feature.evaluate('test-env');

            if (now === hour) {
                expect(variants[0].variant).toBe('Off');
            } else {
                expect(variants[0].variant).toBe('On');
            }
        })

        it('should evaluate that the current hour is or isn\'t less than a set hour', () => {
            const hour = 10;
            const now = DateTime.now().get('hour');

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'lt',
                    staticOperand: hour.toString(),
                })
            ])

            const variants = feature.evaluate('test-env');

            if (now >= hour) {
                expect(variants[0].variant).toBe('Off');
            } else {
                expect(variants[0].variant).toBe('On');
            }
        })

        it('should evaluate that the current hour is or isn\'t less than or equal to a set hour', () => {
            const hour = 10;
            const now = DateTime.now().get('hour');

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'lte',
                    staticOperand: hour.toString(),
                })
            ])

            const variants = feature.evaluate('test-env');

            if (now > hour) {
                expect(variants[0].variant).toBe('Off');
            } else {
                expect(variants[0].variant).toBe('On');
            }
        })

        it('should evaluate that the current hour is or isn\'t greater than a set hour', () => {
            const hour = 10;
            const now = DateTime.now().get('hour');

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'gt',
                    staticOperand: hour.toString(),
                })
            ])

            const variants = feature.evaluate('test-env');

            if (now <= hour) {
                expect(variants[0].variant).toBe('Off');
            } else {
                expect(variants[0].variant).toBe('On');
            }
        })

        it('should evaluate that the current hour is or isn\'t greater than or equal to a set hour', () => {
            const hour = 10;
            const now = DateTime.now().get('hour');

            const feature = getFeature([
                new FeatureConditionModel({
                    target: targets.hour,
                    operator: 'gte',
                    staticOperand: hour.toString(),
                })
            ])

            const variants = feature.evaluate('test-env');

            if (now < hour) {
                expect(variants[0].variant).toBe('Off');
            } else {
                expect(variants[0].variant).toBe('On');
            }
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

            const variants = feature.evaluate('test-env', context);
            expect(variants[0].variant).toBe('On');
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
            const variants = feature.evaluate('test-env');
            expect(variants[0].variant).toBe('Off');
        })
    })

})
