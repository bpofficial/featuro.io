import Stripe from "stripe";

export async function updatePriceData(price: Stripe.Price) {
    // create a job
    //  - find all orgs with billing.stripePriceId = price.id
    //  - update each of their limits to include the new price limits from price.metadata
}