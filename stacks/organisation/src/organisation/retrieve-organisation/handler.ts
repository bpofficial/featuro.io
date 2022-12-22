import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { createConnection } from '@feature.io/db';
import { DataSource } from 'typeorm';
import { OrganisationModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const retrieveOrganisation: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    try {
        connection = connection || await createConnection();
        const repos = {
            organisations: connection.getRepository(OrganisationModel),
        }

        const orgId = event.pathParameters?.organisationId;
        if (!isUUID.v4(orgId) && orgId !== '@me') return BadRequest('Invalid organisation id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;

        if (userOrgId !== orgId && orgId !== '@me') return Unauthorized();

        let org = await repos.organisations.findOne({ where: { id: orgId === '@me' ? userOrgId : orgId } })
        if (!org) return Forbidden();

        org = OrganisationModel.fromObject(org);

        return Ok(org.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
