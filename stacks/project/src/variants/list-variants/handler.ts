import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized, getPaginationParams, paginate } from '@featuro.io/common';
import { ProjectVariantModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';
import { DataSource } from 'typeorm';
import isUUID from 'is-uuid';

let connection: DataSource;
export const listVariants: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
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
            variants: connection.getRepository(ProjectVariantModel) 
        }

        const pagination = getPaginationParams(event);
        const [variants, count] = await repos.variants.findAndCount({ 
            where: { 
                project: {
                    id: projectId, 
                    organisation: { id: userOrgId }
                }
            }, 
            relations: [
                'project',
                'project.organisation', 
            ],
            take: pagination.pageSize,
            skip: (pagination.page - 1) * pagination.pageSize
        })

        const result = ProjectVariantModel.fromObjectArray(variants).map(v => v.toDto());

        return Ok(paginate(result, count, pagination.page, pagination.pageSize))
    } catch (err) {
        return InternalServerError(err.message);
    }
};
