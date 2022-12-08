import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel, ProjectVariantModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const retrieveVariant: APIGatewayProxyHandler = async (
    event, 
    _context
): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const variantId = event.pathParameters?.variantId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(variantId)) return BadRequest('Invalid variant id')

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
                variants: { id: variantId }
            }, 
            relations: [
                'organisation', 
                'variants', 
            ]
        })

        if (!project) return Forbidden();

        const result = ProjectVariantModel.fromObject(project.variants[0])

        return Ok(result.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
