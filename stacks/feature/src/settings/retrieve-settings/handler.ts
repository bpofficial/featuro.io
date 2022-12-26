import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureEnvironmentModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const retrieveSettings: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        const envId = event.pathParameters?.settingsId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')
        if (!isUUID.v4(envId)) return BadRequest('Invalid environment id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('read:feature')) return Forbidden();

        const body = JSON.parse(event.body);
        const update = FeatureEnvironmentModel.fromObject(body);
        
        let vResult: true | string[];
        if ((vResult = update.validate(true)) !== true) return BadRequest(vResult)

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            settings: connection.getRepository(FeatureEnvironmentModel),
        }
        
        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                features: { 
                    id: featureId,
                    environmentSettings: {
                        environment: {
                            id: envId
                        }
                    }
                }
            }, 
            relations: [
                'organisation', 
                'features',
                'features.environmentSettings',
                'features.environmentSettings.environment'
            ]
        })
        if (!project) return Forbidden();
        
        const settings = FeatureEnvironmentModel.fromObject(project.features[0].environmentSettings[0]);

        return Ok(settings.toDto())
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
