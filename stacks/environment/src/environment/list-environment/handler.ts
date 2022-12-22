import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { EnvironmentModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const listEnvironment: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:environment')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { projects: connection.getRepository(ProjectModel) }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId }
            }, relations: ['organisation', 'environments'] })

        if (!project) return Forbidden();

        const result = EnvironmentModel.fromObjectArray(project.environments).map(p => p.toDto());

        return Ok(result)
    } catch (err) {
        return InternalServerError(err.message);
    }
};
