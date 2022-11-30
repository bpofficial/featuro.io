import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, Ok } from '@featuro.io/common';
import { stripe } from '@featuro.io/stripe';
import { updateSubscription } from './handlers/update-subscription';
import { deleteSubscription } from './handlers/delete-subscription';
import { updatePriceData } from './handlers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const receiveWebhook: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try {
        const sig = event?.headers['Stripe-Signature'];

        const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
        const eventType = stripeEvent.type ? stripeEvent.type : '';
    
        const hookData = stripeEvent.data.object as any;
        const subscriptionId = hookData?.id;

        console.log(eventType, hookData);
    
        switch (eventType) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await updateSubscription(hookData, subscriptionId);
                break;
            case 'customer.subscription.deleted':
                await deleteSubscription(hookData);
                break;
            case 'price.updated':
            case 'product.updated':
                await updatePriceData(hookData);
                break;
            default:
                // console.log('Unhandled event type', eventType);
                // console.log(hookData);
                break;
        }
    
        return Ok({ received: true });
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
}
