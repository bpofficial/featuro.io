import { EnvironmentModel, FeatureConditionModel, FeatureConditionSetModel, FeatureModel, FeatureVariantModel, OrganisationModel, ProjectModel, ProjectTargetModel, ProjectVariantModel } from '@featuro.io/models';
import { evaluateFeature } from './handler';
import { v4 as uuid } from 'uuid';
import { DataSource } from 'typeorm';

describe('Evaluate feature flag', () => {

    const org = new OrganisationModel({
        id: uuid()
    })

    const projId = uuid();

    const env = new EnvironmentModel({
        id: 'env-1',
        project: { id: projId },
        apiKey: 'test-key'
    })

    const feature = new FeatureModel({
        id: uuid(),
        project: { id: projId }
    })
    feature.addEnvironment(env);
    feature.settings[0].isActive = true

    const target = new ProjectTargetModel({
        id: uuid(),
        key: 'hod',
        type: 'date',
        isSystem: true,
        project: { id: projId }
    })

    const variant = new ProjectVariantModel({
        id: 'variant-1',
        key: 'active-variant',
        name: 'Defaulta active variant',
        project: { id: projId } as any
    })

    const inactiveVariant = new ProjectVariantModel({
        id: uuid(),
        key: 'inactive',
        name: 'Default inactive variant',
        project: { id: projId } as any
    })

    feature.inactiveVariant = new FeatureVariantModel({
        variant: inactiveVariant
    });

    feature.activeDefaultVariant = new FeatureVariantModel({
        variant
    });

    const condition = new FeatureConditionModel({
        id: uuid(),
        target,
        operator: 'eq',
        staticOperand: '12',
    })

    const conditionSet = new FeatureConditionSetModel({
        id: uuid(),
        name: 'cset-1',
        description: 'test',
        conditions: [condition],
        variants: [variant],
        feature
    })

    feature.conditionSets = [conditionSet];

    const proj = new ProjectModel({
        id: projId,
        key: 'test-proj',
        organisation: org,
        environments: [env],
        targets: [target],
        variants: [variant],
        features: [feature]
    })

    const event: any = {
        pathParameters: {
            projectId: proj.id,
            featureId: feature.id
        },
        multiValueHeaders: {
            'X-Api-Key': env.apiKey
        }
    };

    const save = jest.fn().mockImplementation(v => ({...v, id: uuid()}));
    const findOne = jest.fn().mockImplementation(qry => {
        const apiKey = qry.where.features.settings.environment.apiKey;
        if (apiKey === env.apiKey) return proj;
        return null;
    });

    const getRepository = jest.fn().mockReturnValue({ save, findOne });

    jest.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({ getRepository } as any)

    it('should do something useful', async () => {
        const result = await evaluateFeature(event, null, null);
        console.log(JSON.parse((result as any).body))
    })
})