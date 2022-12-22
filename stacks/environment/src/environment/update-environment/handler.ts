import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, NoContent, NotFound, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { EnvironmentModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const updateEnvironment: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const environmentId = event.pathParameters?.environmentId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(environmentId)) return BadRequest('Invalid environment id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('update:environment')) return Forbidden();

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            environments: connection.getRepository(EnvironmentModel),
        }

        const body = JSON.parse(event.body);
        const update = EnvironmentModel.fromObject(body);
        
        let vResult: true | any[];
        if ((vResult = update.validate(true)) !== true) return BadRequest(vResult)

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                environments: { id: environmentId }
            }, relations: ['organisation', 'environments'] })

        if (!project) return Forbidden();
        if (!project.environments.length) return NotFound();

        let environment = EnvironmentModel.fromObject(project.environments[0])

        environment = EnvironmentModel.fromObject(environment);
        environment.merge(update);

        await repos.environments.save(environment);

        return NoContent();
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
