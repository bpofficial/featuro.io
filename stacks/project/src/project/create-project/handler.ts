import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel } from 'libs/models/src/lib/project.model';
import { ProjectVariantModel } from '@featuro.io/models';

let connection: DataSource;
export const createProject: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try {
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
        project.variants = [
            new ProjectVariantModel({
                key: 'on',
                name: 'On',
                description: 'Default active feature variant'
            }),
            new ProjectVariantModel({
                key: 'off',
                name: 'Off',
                description: 'Default inactive feature variant'
            })
        ]

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
        }

        let result = await repos.projects.save(project);
        result = ProjectModel.fromObject(result);

        return Ok(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
