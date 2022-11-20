import { stripe } from '@featuro.io/stripe';
import { APIGatewayProxyResult } from 'aws-lambda';
import { DataSource } from 'typeorm';
import { createOrganisation } from './handler';

describe('CreateOrganisationHandler', () => {

    it('should create an org', async () => {
        const save = jest.fn().mockImplementation(v => v);
        jest.spyOn(DataSource.prototype, 'initialize').mockResolvedValue(null)
        jest.spyOn(DataSource.prototype, 'getRepository').mockReturnValue({ save } as any)
        jest.spyOn(stripe.subscriptions, 'create').mockResolvedValue({ id: 'test-subscription-id' } as any);
        jest.spyOn(stripe.customers, 'create').mockResolvedValue({ id: 'test-customer-id' } as any);
        jest.spyOn(stripe.prices, 'retrieve').mockResolvedValue({ product: { metadata: {} } } as any);

        const event: any = {
            body: JSON.stringify({
                name: 'test organisation',
                subdomain: 'test',
                priceId: 'test-price-id',
                customerId: 'test-customer-id'
            }),
            requestContext: {
                authorizer: {
                    context: {
                        sub: 'test-user-id'
                    }
                }
            }
        };

        const result = (await createOrganisation(event, null, null)) as APIGatewayProxyResult;
        expect(save).toBeCalledTimes(4);
        expect(result.statusCode).toBe(201);

        const data = JSON.parse(result.body);
        expect(data.ownerId).toBe('test-user-id')

        console.log(save.mock.calls)
    })
})