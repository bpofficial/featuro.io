import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, NoContent, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel, ProjectTargetModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const updateTarget: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const targetId = event.pathParameters?.targetId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(targetId)) return BadRequest('Invalid target id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('update:project')) 
            return Forbidden();

        const body = JSON.parse(event.body);
        const update = ProjectTargetModel.fromObject(body);
        
        let vResult: true | string[];
        if ((vResult = update.validate(true)) !== true) 
            return BadRequest(vResult)

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            targets: connection.getRepository(ProjectTargetModel)
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId},
                targets: { id: targetId }
            },
            relations: [
                'organisation',
                'targets'
            ]
        })
        
        if (!project) return Forbidden();

        const target = ProjectTargetModel.fromObject(project.targets[0]);
        target.merge(update);

        await repos.targets.save(target);

        return NoContent();
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
