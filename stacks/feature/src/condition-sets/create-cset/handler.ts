import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Created, Forbidden, InternalServerError, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { FeatureConditionSetModel, ProjectModel } from '@featuro.io/models';
import isUUID from 'is-uuid';
import { createConnection } from '@feature.io/db';

let connection: DataSource;
export const createConditionSet: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try { 
        const projectId = event.pathParameters?.projectId;
        const featureId = event.pathParameters?.featureId;
        if (!isUUID.v4(projectId)) return BadRequest('Invalid project id')
        if (!isUUID.v4(featureId)) return BadRequest('Invalid feature id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (!permissions || !permissions.includes('create:feature')) return Forbidden();

        const body = JSON.parse(event.body);
        /**
         * Example body:
         * {
         *     name: 'Test',
         *     description: '.....',
         *     conditions: [
         *         {
         *             target: {
         *                 id: 'xyz-xyz-xyz'
         *             },
         *             operator: 'eq',
         *             staticOperand: '12'
         *         }
         *     ],
         *     variants: [
         *          {
         *              split: 100,
         *              variant: {
         *                  id: 'abc-def-ghi'
         *              }
         *          }
         *     ]
         * }
         */
        const cset = FeatureConditionSetModel.fromObject(body)
        
        let vResult: true | string[];
        if ((vResult = cset.validate()) !== true) return BadRequest(vResult);

        connection = connection || await createConnection();
        const repos = {
            projects: connection.getRepository(ProjectModel),
            csets: connection.getRepository(FeatureConditionSetModel),
        }

        const project = await repos.projects.findOne({ 
            where: { 
                id: projectId,
                organisation: { id: userOrgId },
                features: { id: featureId }
            }, 
            relations: [
                'organisation', 
                'features'
            ] 
        })
        if (!project) return Forbidden();

        cset.feature = project.features[0];

        let result = await repos.csets.save(cset);
        result = FeatureConditionSetModel.fromObject(result);

        return Created(result.toDto());
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
