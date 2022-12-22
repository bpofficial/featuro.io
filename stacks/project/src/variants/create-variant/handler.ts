import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectVariantModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const createVariant: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('update:project')) return Forbidden();

        const body = JSON.parse(event.body);
        const variant = ProjectVariantModel.fromObject(body)
        
        let vResult: true | any[];
        if ((vResult = variant.validate()) !== true) return BadRequest(vResult)

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            variants: connection.getRepository(ProjectVariantModel)
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId } 
            }, 
            relations: ['organisation'] 
        })

        if (!project) return Forbidden();

        let result = await repos.variants.save(variant);
        result = ProjectVariantModel.fromObject(result);

        return Ok(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
