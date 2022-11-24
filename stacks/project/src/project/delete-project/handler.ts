import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, NoContent, NotFound, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const deleteProject: APIGatewayProxyHandler = async (event, _context): Promise<APIGatewayProxyResult> => {
    try {
        connection = connection || await createConnection();
        const repos = { projects: connection.getRepository(ProjectModel) }

        const id = event.pathParameters?.projectId;
        if (!isUUID.v4(id)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();
        
        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('delete:project')) return Forbidden();

        let project = await repos.projects.findOne({ where: { id, organisation: { id: userOrgId} }, relations: ['organisation', 'environments', 'features'] })
        if (!project) return Forbidden();
        project = ProjectModel.fromObject(project);

        await repos.projects.softRemove(project)

        return NoContent()
    } catch (err) {
        return InternalServerError(err.message);
    }
};
