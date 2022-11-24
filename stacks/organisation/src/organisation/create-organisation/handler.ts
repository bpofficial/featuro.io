import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { BadRequest, createConnection, Created, InternalServerError, Unauthorized } from '@featuro.io/common';
import { DataSource } from 'typeorm';
import { OrganisationBillingModel, OrganisationLimitsModel, OrganisationModel } from '@featuro.io/models';
import { stripe } from '@featuro.io/stripe';

let connection: DataSource;
export const createOrganisation: APIGatewayProxyHandler = async (event, _context): Promise<APIGatewayProxyResult> => {
    try {
        connection = connection || await createConnection();
        const repos = {
            organisations: connection.getRepository(OrganisationModel),
            billing: connection.getRepository(OrganisationBillingModel),
            limits: connection.getRepository(OrganisationLimitsModel),
        }

        const identity = event.requestContext.authorizer?.context;
        if (!identity) return Unauthorized();

        const userId = identity.sub;
        const body = JSON.parse(event.body);
        const org = new OrganisationModel({
            ...body,
            ownerId: userId
        });

        let vResult: true | any[];
        if ((vResult = org.validate()) !== true) return BadRequest(vResult)

        const price = await stripe.prices.retrieve(body.priceId, { expand: ['product'] });
        if (!price) return BadRequest('Plan does not exist.');

        let newOrganisation = await repos.organisations.save(org);
        newOrganisation = OrganisationModel.fromObject(newOrganisation);

        const customer = await stripe.customers.create({
            name: org.name,
            email: identity.email,
            metadata: { orgId: newOrganisation.id }
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: body.priceId }],
            expand: ['latest_invoice.payment_intent'],
            trial_end: Math.floor((Date.now() + 12096e5) / 1000),
            metadata: { organisationId: newOrganisation.id }
        });

        const billing = new OrganisationBillingModel({
            financial: false,
            isTrialing: true,
            // Means the organisation isn't yet active (subscription isn't setup properly), stripe webhooks dictate completion
            isOnboarding: true,
            organisation: newOrganisation,
            stripePriceId: body.priceId,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id
        });
        
        const limits = new OrganisationLimitsModel({ organisation: newOrganisation });
        limits.parseStripePriceMetadata((price.product as any).metadata);

        await Promise.all([
            repos.billing.save(billing),
            repos.limits.save(limits)
        ])

        return Created(newOrganisation.toDto())
    } catch (err) {
        console.debug(err)
        return InternalServerError(err.message);
    }
};
