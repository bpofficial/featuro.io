import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, NoContent, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel, ProjectVariantModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const deleteVariant: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const variantId = event.pathParameters?.variantId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(variantId)) return BadRequest('Invalid variant id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();
        
        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('update:project')) return Forbidden();
        
        connection = connection || await createConnection();
        const repos = { 
            projects: connection.getRepository(ProjectModel),
            variants: connection.getRepository(ProjectVariantModel)
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                variants: { id: variantId }
            }, 
            relations: [
                'organisation', 
                'variants'
            ] 
        })

        if (!project) return Forbidden();

        await repos.variants.softRemove(project.variants[0]);

        return NoContent()
    } catch (err) {
        return InternalServerError(err.message);
    }
};
