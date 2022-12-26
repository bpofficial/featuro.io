import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureConditionSetModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const listConditionSets: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:feature')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { projects: connection.getRepository(ProjectModel) }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                features: { id: featureId }
            }, 
            relations: [
                'organisation', 
                'features', 
                'features.conditionSets',
                'features.conditionSets.conditions',
                'features.conditionSets.conditions.target',
                'features.conditionSets.variants'
            ] 
        })
        if (!project) return Forbidden();

        console.log(project.features[0].conditionSets)

        const result = FeatureConditionSetModel
            .fromObjectArray(project.features[0].conditionSets)
            .map(p => p.toDto());

        return Ok(result)
    } catch (err) {
        return InternalServerError(err.message);
    }
};
