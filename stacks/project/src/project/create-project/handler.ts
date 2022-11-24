import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { OrganisationModel } from 'libs/models/src/lib/organisation.model';
import { ProjectModel } from 'libs/models/src/lib/project.model';

let connection: DataSource;
export const createProject: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try { 
        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
        }

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('create:project')) return Forbidden();

        const body = JSON.parse(event.body);
        const project = ProjectModel.fromObject(body)
        
        let vResult: true | any[];
        if ((vResult = project.validate()) !== true) return BadRequest(vResult)

        project.organisation = userOrgId;

        let result = await repos.projects.save(project);
        result = ProjectModel.fromObject(result);

        return Ok(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
