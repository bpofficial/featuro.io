import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Created, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { EnvironmentModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { customAlphabet } from 'nanoid';

const createApiKey = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890', 24);

let connection: DataSource;
export const createEnvironment: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try { 
        const projectId = event.pathParameters?.projectId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('create:environment')) return Forbidden();

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            environments: connection.getRepository(EnvironmentModel),
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId } 
            }, 
            relations: ['organisation', 'environments'] 
        })

        if (!project) return Forbidden();

        const body = JSON.parse(event.body);
        const environment = EnvironmentModel.fromObject(body)
        
        let vResult: true | any[];
        if ((vResult = environment.validate()) !== true) return BadRequest(vResult);

        environment.project = project;
        environment.apiKey = createApiKey();

        let result = await repos.environments.save(environment);

        result = EnvironmentModel.fromObject(result);

        return Created(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
