import { createConnection } from '@feature.io/db';
import { OrganisationModel } from "@featuro.io/models";
import { DataSource } from "typeorm";

let connection: DataSource;
export async function deleteSubscription(data: Record<string, any>) {
    // delete a subscription

    connection = connection || await createConnection();
    const repos = { organisations: connection.getRepository(OrganisationModel) }

    const organisationId = data.metadata.organisationId;
    let org = await repos.organisations.findOne({ where: { id: organisationId }, relations: ['billing', 'limits'] });
    org = OrganisationModel.fromObject(org);

    org.billing.stripeCustomerId = data.customer;
    org.billing.stripePriceId = null;
    org.billing.stripeSubscriptionId = null;

    org.billing.financial = false;
    org.billing.isTrialing = false;
    org.billing.isOnboarding = false;

    console.log('Subscription deleted', org)

    await repos.organisations.save(org);
}