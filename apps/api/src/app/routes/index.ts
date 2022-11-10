import express, { Request, Response } from 'express';
import { getEnvironmentRoutes } from './environments';
import { getFeatureConditionSetRoutes } from './feature-condition-sets';
import { getFeatureConditionRoutes } from './feature-conditions';
import { getFeatureVariantRoutes } from './feature-variants';
import { getFeatureRoutes } from './features';
import { getMemberRoutes } from './members';
import { getOrganisationRoutes } from './organisations';
import { getProjectRoutes } from './projects';

export const getRoutes = () => {
    // create a router for all the routes of our app
    const router = express.Router()

    router.use('/api/v1/organisations', getOrganisationRoutes())
    router.use('/api/v1/members', getMemberRoutes())

    router.use('/api/v1/projects', getProjectRoutes())
    router.use('/api/v1/environments', getEnvironmentRoutes())

    router.use('/api/v1/environments/:environmentId/features', getFeatureRoutes())
    router.use('/api/v1/features', getFeatureRoutes())

    router.use('/api/v1/features/:featureId/conditions', getFeatureConditionRoutes())
    router.use('/api/v1/features/:featureId/condition-sets', getFeatureConditionSetRoutes())
    router.use('/api/v1/features/:featureId/variants', getFeatureVariantRoutes())

    return router
}
