import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Created, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureModel, FeatureVariantModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const evaluateFeature: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try { 
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;

        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')

        const identity = event.multiValueHeaders['X-Api-Key'] || event.multiValueHeaders['x-api-key'];
        if (!identity) return Unauthorized();

        let context: Record<string, string | number | boolean>; 
        try {
            const raw = event.queryStringParameters['context']?.trim()
            context = JSON.parse(raw.length ? raw : JSON.stringify({}));
        } catch (err) {
            return BadRequest('Failed to parse context data');
        }

        connection = connection || await createConnection();

        const project = await connection.getRepository(ProjectModel).findOne({
            where: {
                features: {
                    id: featureId
                },
            },
            cache: {
                id: `${projectId}:${identity}:${featureId}`,
                milliseconds: 1000 * 60 * 60 * 4 // 4 hours
            },
            relations: [
                'features', 
                'features.environmentSettings'
            ]
        })

        const feature = project.features[0]
        const environment = project.features[0].environmentSettings
            .find(settings => settings.environment.apiKey === identity.toString());

        const result = environment.evaluate(feature.active, context);

        return Ok(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
