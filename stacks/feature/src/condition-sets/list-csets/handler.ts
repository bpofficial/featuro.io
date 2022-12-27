import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized, getPaginationParams, paginate } from '@featuro.io/common';
import { FeatureConditionSetModel, ProjectModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';
import { DataSource } from 'typeorm';
import isUUID from 'is-uuid';

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
        const repos = { 
            csets: connection.getRepository(FeatureConditionSetModel) 
        }

        const pagination = getPaginationParams(event);
        const [csets, count] = await repos.csets.findAndCount({ 
            where: {
                feature: {
                    id: featureId,
                    project: {
                        id: projectId, 
                        organisation: { id: userOrgId },
                    }
                }
            }, 
            relations: [
                'conditions',
                'conditions.target',
                'variants',
                'feature',
                'feature.project',
                'feature.project.organisation'
            ],
            take: pagination.pageSize,
            skip: (pagination.page - 1) * pagination.pageSize
        })

        const result = FeatureConditionSetModel.fromObjectArray(csets).map(p => p.toDto());

        return Ok(paginate(result, count, pagination.page, pagination.pageSize))
    } catch (err) {
        return InternalServerError(err.message);
    }
};
