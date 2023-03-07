import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, expandFromEvent, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const retrieveFeature: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureIdOrKey = event.pathParameters?.featureId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:feature')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { 
            projects: connection.getRepository(ProjectModel)
        }

        const featureSearch = {} as Record<string, string>;
        if (isUUID.v4(featureIdOrKey)) {
            featureSearch['id'] = featureIdOrKey;
        } else {
            featureSearch['key'] = featureIdOrKey;
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                features: featureSearch
            }, 
            relations: [
                'organisation', 
                'features', 
                ...expandFromEvent(event, FeatureModel.EXPAND_WHITELIST, 'features')
            ]
        })
        if (!project) return Forbidden();

        const result = FeatureModel.fromObject(project.features[0])

        return Ok(result.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
