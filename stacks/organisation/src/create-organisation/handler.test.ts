import { createOrganisation } from './handler';

describe('CreateOrganisationHandler', () => {

    it('should create an org', async () => {
        const event: any = {
            body: {
                name: 'test organisation',
                subdomain: 'test',
                priceId: 'test-price-id',
                customerId: 'test-customer-id'
            },
            requestContext: {
                authorizer: {
                    context: {
                        sub: 'test-user-id'
                    }
                }
            }
        };

        const result = await createOrganisation(event, null, null);
        console.log(r)
    })
})