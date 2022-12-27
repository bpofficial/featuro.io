import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized, getPaginationParams, paginate } from '@featuro.io/common';
import { ProjectTargetModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';
import { DataSource } from 'typeorm';
import isUUID from 'is-uuid';

let connection: DataSource;
export const listTargets: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:project')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { 
            targets: connection.getRepository(ProjectTargetModel) 
        }

        const pagination = getPaginationParams(event);
        const [targets, count] = await repos.targets.findAndCount({ 
            where: { 
                project: {
                    id: projectId,
                    organisation: { id: userOrgId }
                }
            },
            take: pagination.pageSize,
            skip: (pagination.page - 1) * pagination.pageSize
        })

        const result = ProjectTargetModel.fromObjectArray(targets).map(t => t.toDto());

        return Ok(paginate(result, count, pagination.page, pagination.pageSize))
    } catch (err) {
        return InternalServerError(err.message);
    }
};
