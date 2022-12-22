import { createConnection } from '@feature.io/db';
import { OrganisationLimitsModel, OrganisationModel } from "@featuro.io/models";
import Stripe from "stripe";
import { DataSource } from "typeorm";

let connection: DataSource;
export async function updatePriceData(price: Stripe.Price | Stripe.Product) {
    try {
        connection = connection || await createConnection();
        const repos = { 
            organisations: connection.getRepository(OrganisationModel),
            limits: connection.getRepository(OrganisationLimitsModel)
        }

        let stripePriceId = price.id;
        if (price.object === 'product') {
            if (typeof price.default_price === 'object') {
                price = price.default_price;
                stripePriceId = price.id;
            } else {
                stripePriceId = price.default_price;
            }
        }

        const orgs = await repos.organisations.find({ where: { billing: { stripePriceId } }, relations: ['billing', 'limits'] });

        const limits = orgs.map(o => {
            o.limits.parseStripePriceMetadata(price.metadata);
            return o.limits;
        });

        await repos.limits.save(limits);
    } catch (err) {
        console.debug('Failed to process price/product update event.', err);
    }
}