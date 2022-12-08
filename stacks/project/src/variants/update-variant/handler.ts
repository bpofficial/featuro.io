import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, NoContent, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel, ProjectVariantModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const updateVariant: APIGatewayProxyHandler = async (
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

        if (!permissions || !permissions.includes('update:project')) return Forbidden();

        const body = JSON.parse(event.body);
        const update = ProjectVariantModel.fromObject(body);
        
        let vResult: true | any[];
        if ((vResult = update.validate(true)) !== true) return BadRequest(vResult)

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            variants: connection.getRepository(ProjectVariantModel)
        }

        let project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId},
                variants: { id: variantId }
            },
            relations: [
                'organisation',
                'variants'
            ]
        })
        
        if (!project) return Forbidden();

        let variant = ProjectVariantModel.fromObject(project.variants[0]);
        variant.merge(update);

        await repos.variants.save(variant);

        return NoContent();
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
