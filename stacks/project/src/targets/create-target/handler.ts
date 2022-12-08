import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectTargetModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const createTarget: APIGatewayProxyHandler = async (
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

        if (!permissions || !permissions.includes('update:project')) return Forbidden();

        const body = JSON.parse(event.body);
        const target = ProjectTargetModel.fromObject(body)
        
        let vResult: true | any[];
        if ((vResult = target.validate()) !== true) return BadRequest(vResult)

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            targets: connection.getRepository(ProjectTargetModel)
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId } 
            }, 
            relations: ['organisation'] 
        })

        if (!project) return Forbidden();

        let result = await repos.targets.save(target);
        result = ProjectTargetModel.fromObject(result);

        return Ok(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
