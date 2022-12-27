import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { Forbidden, InternalServerError, Ok, Unauthorized, getPaginationParams, paginate } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const listProject: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();
        
        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:project')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { 
            projects: connection.getRepository(ProjectModel) 
        }

        const pagination = getPaginationParams(event);
        const [projects, count] = await repos.projects.findAndCount({ 
            where: { 
                organisation: { id: userOrgId } 
            }, 
            relations: [
                'organisation',
                'environments'
            ],
            take: pagination.pageSize,
            skip: (pagination.page - 1) * pagination.pageSize
        })
        const result = ProjectModel.fromObjectArray(projects).map(p => p.toDto());
        
        return Ok(paginate(result, count, pagination.page, pagination.pageSize))
    } catch (err) {
        return InternalServerError(err.message);
    }
};
