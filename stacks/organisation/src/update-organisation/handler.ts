import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { OrganisationModel } from '@featuro.io/models';
import isUUID from 'is-uuid';

let connection: DataSource;
export const updateOrganisation: APIGatewayProxyHandler = async (event, _context): Promise<APIGatewayProxyResult> => {
    try {
        connection = connection || await createConnection();
        const repos = {
            organisations: connection.getRepository(OrganisationModel),
        }

        const orgId = event.pathParameters?.id;
        if (!isUUID.v4(orgId)) return BadRequest('Invalid organisation id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userId = identity.sub;
        let org = await repos.organisations.findOne({ where: { id: orgId, members: { id: userId } }, relations: ['members'] })
        if (!org) return Forbidden();

        const body = JSON.parse(event.body);

        org = OrganisationModel.fromObject(body);
        let vResult: true | any[];
        if ((vResult = org.validate()) !== true) {
            return BadRequest(vResult)
        }

        return Ok(org.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
