import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized, getPaginationParams, paginate } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';
import isUUID from 'is-uuid';

let connection: DataSource;
export const listFeature: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:feature')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { 
            features: connection.getRepository(FeatureModel) 
        }

        const pagination = getPaginationParams(event);
        const [features, count] = await repos.features.findAndCount({ 
            where: { 
                project: {
                    id: projectId,
                    organisation: { id: userOrgId }
                }
            },
            relations: [
                'project',
                'project.organisation'
            ],
            take: pagination.pageSize,
            skip: (pagination.page - 1) * pagination.pageSize
        })

        const result = FeatureModel.fromObjectArray(features).map(p => p.toDto());

        return Ok(paginate(result, count, pagination.page, pagination.pageSize))
    } catch (err) {
        return InternalServerError(err.message);
    }
};
