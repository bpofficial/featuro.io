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
            new OrganisationMemberModel({ role: 'admin' }),
            new OrganisationMemberModel({ role: 'user' })
        ],
        projects: [
            new ProjectModel({
                name: 'Test Project',
                environments: [env],
                features: [
                    new FeatureModel({
                        active: true,
                        activeDefaultVariant: new FeatureVariantModel(),
                        inactiveVariant: new FeatureVariantModel(),
                        environmentSettings: [
                            new FeatureEnvironmentModel({
                                environment: env,
                                conditionSets: [
                                    new FeatureConditionSetModel({
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
})
