import { createConnection } from "@featuro.io/common";
import { OrganisationLimitsModel, OrganisationModel } from "@featuro.io/models";
import Stripe from "stripe";
import { DataSource } from "typeorm";

let connection: DataSource;
export async function updatePriceData(price: Stripe.Price) {
    console.log({ price });
    connection = connection || await createConnection();
    const repos = { 
        organisations: connection.getRepository(OrganisationModel),
        limits: connection.getRepository(OrganisationLimitsModel)
    }

    const orgs = await repos.organisations.find({ where: { billing: { stripePriceId: price.id } }, relations: ['billing', 'limits'] });
    const limits = orgs.map(o => {
        o.limits.parseStripePriceMetadata(price.metadata);
        return o.limits;
    });

    await repos.limits.save(limits);
}