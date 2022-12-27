import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureConditionSetModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const updateConditionSet: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        const csetId = event.pathParameters?.csetId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')
        if (!isUUID.v4(csetId)) return BadRequest('Invalid condition set id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('update:feature')) return Forbidden();

        const body = JSON.parse(event.body);
        const update = FeatureConditionSetModel.fromObject(body);
        
        let vResult: true | string[];
        if ((vResult = update.validate(true)) !== true) return BadRequest(vResult)

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            csets: connection.getRepository(FeatureConditionSetModel),
        }
        
        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId, 
                organisation: { id: userOrgId },
                features: { 
                    id: featureId,
                    conditionSets: { id: csetId }
                }
            }, 
            relations: [
                'organisation', 
                'features',
                'features.conditionSets',
                'features.conditionSets.conditions',
                'features.conditionSets.conditions.target'
            ]
        })
        if (!project) return Forbidden();

        const cset = FeatureConditionSetModel.fromObject(project.features[0].conditionSets[0])

        // Merge the update
        cset.merge(update);

        let result = await repos.csets.save(cset);
        result = FeatureConditionSetModel.fromObject(result);

        return Ok(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
