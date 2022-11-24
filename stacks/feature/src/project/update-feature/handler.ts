import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, NoContent, NotFound, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const updateFeature: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('update:feature')) return Forbidden();

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            features: connection.getRepository(FeatureModel),
        }

        const body = JSON.parse(event.body);
        const update = FeatureModel.fromObject(body);
        
        let vResult: true | any[];
        if ((vResult = update.validate(true)) !== true) return BadRequest(vResult)

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                features: { id: featureId }
            }, relations: ['organisation', 'features'] })

        if (!project) return Forbidden();
        if (!project.features.length) return NotFound();

        let feature = FeatureModel.fromObject(project.features[0])

        feature = FeatureModel.fromObject(feature);
        feature.merge(update);

        await repos.features.save(feature);

        return NoContent();
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
