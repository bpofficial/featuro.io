import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel, ProjectTargetModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const retrieveTarget: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const targetId = event.pathParameters?.targetId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(targetId)) return BadRequest('Invalid target id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:project')) return Forbidden();

        connection = connection || await createConnection();
        const repos = { projects: connection.getRepository(ProjectModel) }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                targets: { id: targetId }
            }, 
            relations: [
                'organisation', 
                'targets', 
            ]
        })

        if (!project) return Forbidden();

        const result = ProjectTargetModel.fromObject(project.targets[0])

        return Ok(result.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
