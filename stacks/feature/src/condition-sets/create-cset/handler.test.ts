import { FeatureModel, OrganisationModel, ProjectModel, ProjectTargetModel, ProjectVariantModel } from '@featuro.io/models';
import { createConditionSet } from './handler';
import { v4 as uuid } from 'uuid';
import { DataSource } from 'typeorm';

describe('Create Condition Set', () => {

    const org = new OrganisationModel({
        id: uuid()
    })

    const proj = new ProjectModel({
        id: uuid(),
        key: 'test-proj',
        organisation: org
    })

    const feature = new FeatureModel({
        id: uuid()
    })

    const user = {
        org: org.id,
        sub: 'test-user-id',
        permissions: ['create:feature']
    }

    const target = new ProjectTargetModel({
        id: 'target-1',
    })

    const variant = new ProjectVariantModel({
        id: 'variant-1'
    })

    const event: any = {
        pathParameters: {
            projectId: proj.id,
            featureId: feature.id
        },
        body: JSON.stringify({
            name: 'Test Feature',
            description: 'dads',
            conditions: [
                {
                    target: {
                        id: target.id
                    },
                    operator: 'eq',
                    staticOperand: '12'
                }
            ],
            variants: [
                {
                    variant: {
                        id: variant.id
                    },
                    split: 100
                }
            ]
        }),
        requestContext: {
            authorizer: {
                context: user
            }
        }
    };


    const save = jest.fn().mockImplementation(v => ({...v, id: uuid()}));
    const findOne = jest.fn().mockImplementation(qry => {
        if (qry.where.id === proj.id && qry.where.organisation.id === proj.organisation.id) {
            return proj;
        }
        return null;
    });

    const getRepository = jest.fn().mockReturnValue({ save, findOne });

    jest.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({ getRepository } as any)


    it('should do something useful', async () => {
        const result = await createConditionSet(event, null, null);
        console.log(JSON.parse((result as any).body).conditions)
    })
})