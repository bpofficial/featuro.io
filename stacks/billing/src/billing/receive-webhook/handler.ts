import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, Ok } from '@featuro.io/common';
import { stripe } from '@featuro.io/stripe';
import { updateSubscription } from './update-subscription';
import { deleteSubscription } from './delete-subscription';

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
    
        let customerEmail: string;
        customerEmail = hookData?.['customer_details']?.email;
        if (!customerEmail) {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer.deleted) {
                throw new Error('Customer deleted');
            } else {
                customerEmail = (customer.object as any).email;
            }
        }
    
        switch (eventType) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await updateSubscription(customerEmail, subscriptionId, priceId);
                break;
            case 'customer.subscription.deleted':
                await deleteSubscription(customerEmail);
                break;
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
