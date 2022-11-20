import { EnvironmentModel } from './environment.model';
import { FeatureConditionSetModel } from './feature-condition-set.model';
import { FeatureConditionModel } from './feature-condition.model';
import { FeatureEnvironmentModel } from './feature-environment.model';
import { FeatureTargetModel } from './feature-target.model';
import { FeatureVariantModel } from './feature-variant.model';
import { FeatureModel } from './feature.model';
import { OrganisationBillingModel } from './organisation-billing.model';
import { OrganisationLimitsModel } from './organisation-limits.model';
import { OrganisationMemberModel } from './organisation-member.model';
import { OrganisationModel } from './organisation.model';
import { ProjectModel } from './project.model';

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
        members: [
            new OrganisationMemberModel({ role: 'admin', id: '1' }),
            new OrganisationMemberModel({ role: 'user', id: '2' })
        ],
        projects: [
            new ProjectModel({
                id: 'project-1',
                name: 'Test Project',
                environments: [env],
                features: [
                    new FeatureModel({
                        id: 'feature-1',
                        active: true,
                        activeDefaultVariant: new FeatureVariantModel(),
                        inactiveVariant: new FeatureVariantModel(),
                        environmentSettings: [
                            new FeatureEnvironmentModel({
                                id: 'feature-env-1',
                                environment: env,
                                conditionSets: [
                                    new FeatureConditionSetModel({
                                        id: 'cond-set-1',
                                        variant: new FeatureVariantModel(),
                                        conditions: [
                                            new FeatureConditionModel({
                                                target: new FeatureTargetModel()
                                            }),
                                            new FeatureConditionModel({
                                                target: new FeatureTargetModel()
                                            }),
                                            new FeatureConditionModel({
                                                target: new FeatureTargetModel()
                                            })
                                        ]
                                    })
                                ]
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
            members: [
                { id: '1', name: 'Admin User' },
                { id: '2', name: 'Generic User' }
            ],
            projects: [
                {
                    id: 'project-1',
                    features: [
                        {
                            id: 'feature-1',
                            environmentSettings: [
                                {
                                    id: 'feature-env-1',
                                    conditionSets: [
                                        {
                                            id: 'cond-set-2',
                                            variant: {
                                                name: 'variant updated!'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })

        console.log(org);
        expect(org.billing.stripeCustomerId).toBe('abc');
        expect(org.billing.stripeSubscriptionId).toBe('131');
        expect(org.members[0].name).toBe('Admin User');
        expect(org.members[1].name).toBe('Generic User');
        expect(org.projects[0].features[0].environmentSettings[0].conditionSets[1].variant.name).toBe('variant updated!');
    })
})
