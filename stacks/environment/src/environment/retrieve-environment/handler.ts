import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, NotFound, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { EnvironmentModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const retrieveEnvironment: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const environmentId = event.pathParameters?.environmentId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(environmentId)) return BadRequest('Invalid environment id')

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
                organisation: { id: userOrgId },
                environments: { id: environmentId }
            }, relations: ['organisation', 'environments'] })

        if (!project) return Forbidden();
        if (!project.environments.length) return NotFound();

        const result = EnvironmentModel.fromObject(project.environments[0])

        return Ok(result.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
