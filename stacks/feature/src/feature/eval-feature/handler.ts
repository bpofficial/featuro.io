import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { ProjectModel } from '@featuro.io/models';
import { createConnection } from '@feature.io/db';
import isUUID from 'is-uuid';

let connection: DataSource;
export const evaluateFeature: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')

        const identity = event.multiValueHeaders['X-Api-Key'] || event.multiValueHeaders['x-api-key'];
        if (!identity) return Unauthorized();

        let context: Record<string, string | number | boolean>; 
        try {
            const raw = event.queryStringParameters?.['context']?.trim?.()
            if (raw) {
                context = JSON.parse(raw.length ? raw : JSON.stringify({}));
            }
        } catch (err) {
            return BadRequest('Failed to parse context data');
        }

        connection = connection || await createConnection();
        let project = await connection.getRepository(ProjectModel).findOne({
            where: {
                id: projectId,
                features: {
                    id: featureId,
                    environmentSettings: {
                        environment: {
                            apiKey: identity.toString()
                        }
                    }
                },
            },
            // cache: {
            //     id: `${projectId}:${identity}:${featureId}`,
            //     milliseconds: 1000 * 60 * 60 * 4 // 4 hours
            // },
            relations: [
                'features', 
                'features.environmentSettings',
                'features.environmentSettings.environment',
                'features.activeDefaultVariant',
                'features.inactiveVariant',
                'features.conditionSets',
                'features.conditionSets.variants',
                'features.conditionSets.variants.variant',
                'features.conditionSets.conditions',
                'features.conditionSets.conditions.target'
            ]
        })
        project = ProjectModel.fromObject(project);

        const feature = project.features[0]
        const environment = project.features[0].environmentSettings[0]
        const result = feature.evaluate(environment, { context, headers: event.headers });

        return Ok(result);
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
