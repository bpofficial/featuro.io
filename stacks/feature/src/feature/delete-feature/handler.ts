import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, NoContent, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const deleteFeature: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('delete:feature')) return Forbidden();

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            features: connection.getRepository(FeatureModel),
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                features: { id: featureId }
            }, relations: ['organisation', 'features'] })

        if (!project) return Forbidden();

        await repos.features.softRemove(project.features[0]);

        return NoContent()
    } catch (err) {
        return InternalServerError(err.message);
    }
};
