import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, Ok } from '@featuro.io/common';
import { stripe } from '@featuro.io/stripe';
import { updateSubscription } from './handlers/update-subscription';
import { deleteSubscription } from './handlers/delete-subscription';
import { updatePriceData } from './handlers';
import Stripe from 'stripe';

export const receiveWebhook: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
        const requestId = event?.requestContext?.requestId;
        const sig = event?.headers['Stripe-Signature'];
    
        const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
        const eventType = stripeEvent.type ? stripeEvent.type : '';
        // https://stripe.com/docs/api#event_object
        const jsonData = JSON.parse(event.body);
    
        console.log(`Event Type: ${eventType}`);
        console.log(jsonData);
    
        const hookData = stripeEvent.data.object as any;
        const subscriptionId = hookData?.id;
        const customerId = hookData?.customer;
        const priceId = hookData?.plan?.id;
    
        let organisationId: string;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && customer.deleted) {
            throw new Error('Customer deleted');
        } else {
            organisationId = (customer?.object as unknown as Stripe.Customer)?.metadata?.organisationId;
        }
    
        switch (eventType) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await updateSubscription(organisationId, subscriptionId, priceId);
                break;
            case 'customer.subscription.deleted':
                await deleteSubscription(organisationId);
                break;
            case 'price.updated':
                await updatePriceData(hookData);
                break
            default:
                console.log('Unhandled event type');
                console.log(hookData);
                break;
        }
    
        return Ok({ received: true });
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
}
