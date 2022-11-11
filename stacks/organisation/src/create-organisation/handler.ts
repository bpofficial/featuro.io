import { APIGatewayProxyHandler } from 'aws-lambda';
import { BadRequest, createConnection, InternalServerError, Ok, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { OrganisationBillingModel, OrganisationLimitsModel, OrganisationMemberModel, OrganisationModel } from '@featuro.io/models';

let connection: DataSource;
export const createOrganisation: APIGatewayProxyHandler = async (event, _context) => {
    try {
        connection = connection || await createConnection();
        const repos = {
            organisations: connection.getRepository(OrganisationModel),
            billing: connection.getRepository(OrganisationBillingModel),
            limits: connection.getRepository(OrganisationMemberModel),
            members: connection.getRepository(OrganisationMemberModel)
        }

        const identity = event.requestContext.authorizer?.context;

        if (!identity) {
            return Unauthorized();
        }

        const userId = identity.sub;
        const body = JSON.parse(event.body);
        const org = new OrganisationModel({
            ...body,
            ownerId: userId
        });

        let vResult: true | any[];
        if ((vResult = org.validate()) !== true) {
            return BadRequest(vResult)
        }

        let newOrganisation = await repos.organisations.save(org);
        newOrganisation = OrganisationModel.fromObject(newOrganisation);

        const billing = new OrganisationBillingModel({
            financial: true,
            organisation: newOrganisation,
            stripePriceId: body.priceId,
            stripeCustomerId: body.customerId,
            stripeSubscriptionId: null // will be set via webhook
        });
        
        const limits = new OrganisationLimitsModel({
            organisation: newOrganisation
        });

        const owner = new OrganisationMemberModel({
            id: userId,
            role: 'admin',
            organisation: newOrganisation
        });

        await Promise.all([
            repos.billing.save(billing),
            repos.limits.save(limits),
            repos.members.save(owner)
        ])

        return Ok(newOrganisation.toDto())
    } catch (err) {
        return InternalServerError(err.message);
    }
};
