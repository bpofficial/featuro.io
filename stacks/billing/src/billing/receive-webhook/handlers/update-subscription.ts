import { createConnection } from "@featuro.io/common";
import { OrganisationBillingModel, OrganisationLimitsModel, OrganisationModel } from "@featuro.io/models";
import { DataSource } from "typeorm";

let connection: DataSource;
export async function updateSubscription(data: Record<string, any>, subscriptionId: string) {
    try {
        connection = connection || await createConnection();
        const repos = { 
            organisations: connection.getRepository(OrganisationModel),
            billing: connection.getRepository(OrganisationBillingModel),
            limits: connection.getRepository(OrganisationLimitsModel)
        }

        const organisationId = data.metadata.organisationId;
        let org = await repos.organisations.findOne({ where: { id: organisationId }, relations: ['billing', 'limits'] });
        org = OrganisationModel.fromObject(org);

        let queue = [];

        if (!org.billing.stripePriceId || org.billing.stripePriceId !== data.plan.id) {
            org.billing.stripePriceId = data.plan.id;
            org.limits.parseStripePriceMetadata(data.plan.metadata);

            queue.push(repos.limits.save(org.limits));
        }

        org.billing.stripeCustomerId = data.customer;
        org.billing.stripeSubscriptionId = subscriptionId;

        const status = data.status;
        if (status === 'trialing') {
            // Nice
            
            org.billing.financial = false;
            org.billing.isTrialing = true;
            org.billing.isOnboarding = false;
        } else if (status === 'active') {
            // A subscription that is currently in a trial period is trialing and moves to active when the trial period is over.

            org.billing.financial = true;
            org.billing.isOnboarding = false;
            org.billing.isTrialing = false;
        } else if (status === 'incomplete') {
            // For collection_method=charge_automatically a subscription moves into incomplete if the initial payment attempt fails
            // A subscription in this state can only have metadata and default_source updated

            // Notify...
        } else if (status === 'incomplete_expired') {
            // If the first invoice is not paid within 23 hours, the subscription transitions to incomplete_expired. 
            // This is a terminal state, the open invoice will be voided and no further invoices will be generated.

            org.billing.financial = false;
            // Notify that this is past due...
        } else if (status === 'past_due') {
            // If subscription collection_method=charge_automatically it becomes past_due when payment to renew it fails.

            // Notify that this is past due...
        } else if (status === 'canceled' || status === 'unpaid') {
            // If subscription collection_method=charge_automatically it becomes past_due when payment to renew it fails and canceled
            // or unpaid (depending on your subscriptions settings) when Stripe has exhausted all payment retry attempts.

            org.billing.financial = false;
            // Notify that this is past due...
        }

        await Promise.all([...queue, repos.billing.save(org.billing)]);
    } catch (e) {
        console.log(e);
    }
}