import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Forbidden, InternalServerError, NoContent, Ok, Unauthorized } from '@featuro.io/common';
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

        const orgId = event.pathParameters?.organisationId;
        if (!isUUID.v4(orgId)) return BadRequest('Invalid organisation id')

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userOrgId = identity.org;
        const permissions = identity.permissions;

        if (orgId !== userOrgId) return Unauthorized();
        if (!permissions || !permissions.includes('update:organisation')) return Forbidden();

        let org = await repos.organisations.findOne({ where: { id: orgId } })
        if (!org) return Forbidden();

        const body = JSON.parse(event.body);

        const update = OrganisationModel.fromObject(body);
        let vResult: true | any[];
        if ((vResult = org.validate()) !== true) {
            return BadRequest(vResult)
        }

        await repos.organisations.save(org.merge(update));

        return NoContent()
    } catch (err) {
        return InternalServerError(err.message);
    }
};
