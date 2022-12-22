import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';
import isUUID from 'is-uuid';

let connection: DataSource;
export const deleteProject: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        connection = connection || await createConnection();
        const repos = { projects: connection.getRepository(ProjectModel) }

        const id = event.pathParameters?.projectId;
        if (!isUUID.v4(id)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();
        
        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:project')) return Forbidden();

        const projects = await repos.projects.find({ where: { organisation: { id: userOrgId} }, relations: ['organisation'] })
        const result = ProjectModel.fromObjectArray(projects).map(p => p.toDto());
        
        return Ok(result)
    } catch (err) {
        return InternalServerError(err.message);
    }
};
