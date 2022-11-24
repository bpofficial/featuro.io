import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Created, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const createFeature: APIGatewayProxyHandler = async (
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

        if (!permissions || !permissions.includes('create:feature')) return Forbidden();

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            features: connection.getRepository(FeatureModel),
        }

        const project = await repos.projects.findOne({ where: { id: projectId, organisation: { id: userOrgId } }, relations: ['organisation', 'features'] })
        if (!project) return Forbidden();

        const body = JSON.parse(event.body);
        const feature = FeatureModel.fromObject(body)
        
        let vResult: true | any[];
        if ((vResult = feature.validate()) !== true) return BadRequest(vResult);

        feature.project = project;
        let result = await repos.features.save(feature);

        result = FeatureModel.fromObject(result);

        return Created(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
