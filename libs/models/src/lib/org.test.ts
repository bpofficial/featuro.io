import { EnvironmentModel } from './environment.model';
import { FeatureConditionSetModel } from './feature-condition-set.model';
import { FeatureConditionModel } from './feature-condition.model';
import { FeatureEnvironmentModel } from './feature-environment.model';
import { ProjectTargetModel } from './project-target.model';
import { FeatureVariantModel } from './feature-variant.model';
import { FeatureModel } from './feature.model';
import { OrganisationBillingModel } from './organisation-billing.model';
import { OrganisationLimitsModel } from './organisation-limits.model';
import { OrganisationModel } from './organisation.model';
import { ProjectModel } from './project.model';
import { ProjectVariantModel } from './project-variant.model';

describe('OrganisationModel', () => {
    const env = new EnvironmentModel()
    const org = new OrganisationModel({
        name: 'Test Org',
        billing: new OrganisationBillingModel({
            stripeCustomerId: '',
            stripePriceId: '',
            stripeSubscriptionId: ''
        }),
        limits: new OrganisationLimitsModel(),
        projects: [
            new ProjectModel({
                id: 'project-1',
                name: 'Test Project',
                environments: [env],
                features: [
                    new FeatureModel({
                        id: 'feature-1',
                        activeDefaultVariant: new FeatureVariantModel(),
                        inactiveVariant: new FeatureVariantModel(),
                        conditionSets: [
                            new FeatureConditionSetModel({
                                id: 'cond-set-1',
                                variants: [
                                    new FeatureVariantModel({ 
                                        id: 'variant-1', 
                                        variant: new ProjectVariantModel({ 
                                            id: 'project-variant-1'
                                        }) 
                                    })
                                ],
                                conditions: [
                                    new FeatureConditionModel({
                                        target: new ProjectTargetModel()
                                    }),
                                    new FeatureConditionModel({
                                        target: new ProjectTargetModel()
                                    }),
                                    new FeatureConditionModel({
                                        target: new ProjectTargetModel()
                                    })
                                ]
                            })
                        ],
                        environmentSettings: [
                            new FeatureEnvironmentModel({
                                id: 'feature-env-1',
                                environment: env,
                                isActive: true,
                            })
                        ],
                    })
                ]
            })
        ]
    })

    it('should merge & update successfuly', () => {
        org.merge({
            billing: {
                stripeCustomerId: 'abc',
                stripeSubscriptionId: '131'
            },
            projects: [
                {
                    id: 'project-1',
                    features: [
                        {
                            id: 'feature-1',
                            conditionSets: [
                                {
                                    id: 'cond-set-1',
                                    name: 'updated cset name'
                                }
                            ],
                            environmentSettings: [
                                {
                                    id: 'feature-env-1',
                                }
                            ]
                        }
                    ]
                }
            ]
        }, true)

        console.log(org);
        expect(org.billing.stripeCustomerId).toBe('abc');
        expect(org.billing.stripeSubscriptionId).toBe('131');
        console.log(org.projects[0].features[0].conditionSets[0])
        expect(org.projects[0].features[0].conditionSets[0].name).toBe('updated cset name');
    })
})
