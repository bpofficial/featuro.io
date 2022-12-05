import { EnvironmentModel } from './lib/environment.model'
import { FeatureConditionSetModel } from './lib/feature-condition-set.model'
import { FeatureConditionModel } from './lib/feature-condition.model'
import { FeatureEnvironmentModel } from './lib/feature-environment.model'
import { ProjectTargetModel } from './lib/project-target.model'
import { FeatureVariantModel } from './lib/feature-variant.model'
import { FeatureModel } from './lib/feature.model'
import { FeatureImpressionModel } from './lib/impression.model'
import { OrganisationBillingModel } from './lib/organisation-billing.model'
import { OrganisationLimitsModel } from './lib/organisation-limits.model'
import { OrganisationModel } from './lib/organisation.model'
import { ProjectModel } from './lib/project.model';
import { ProjectVariantModel } from './lib/project-variant.model'

export const Entities = [
    EnvironmentModel,
    FeatureConditionSetModel,
    FeatureConditionModel,
    FeatureEnvironmentModel,
    FeatureVariantModel,
    FeatureModel,
    FeatureImpressionModel,
    OrganisationBillingModel,
    OrganisationLimitsModel,
    OrganisationModel,
    ProjectModel,
    ProjectVariantModel,
    ProjectTargetModel
]
