import { FeatureModel, OrganisationModel, ProjectModel } from '@featuro.io/models';
import { listFeatures } from './handler';
import { v4 as uuid } from 'uuid';
import { DataSource } from 'typeorm';

describe('Delete Feature', () => {

    const org = new OrganisationModel({
        id: uuid()
    })

    const proj = new ProjectModel({
        id: uuid(),
        key: 'test-proj',
        organisation: org
    })

    const feat = new FeatureModel({
        id: uuid(),
        key: 'test-feature',
        project: proj
    })

    proj.features = [feat];

    const user = {
        org: org.id,
        sub: 'test-user-id',
        permissions: ['read:feature']
    }

    const event: any = {
        pathParameters: {
            projectId: proj.id,
        },
        requestContext: {
            authorizer: {
                context: user
            }
        }
    };


    const save = jest.fn().mockImplementation(v => Promise.resolve(v));
    const findOne = jest.fn().mockImplementation(({ where }) => {
        if (where.id === proj.id && where.organisation.id === proj.organisation.id) {
            return proj;
        }
        return null;
    });

    const getRepository = jest.fn().mockReturnValue({ save, findOne });

    jest.spyOn(DataSource.prototype, 'initialize').mockResolvedValue({ getRepository } as any)

    describe('when user has permissions', () => {
        it('should list all features in the project', async () => {
            const context = { ...user }
            const evt = { ...event, requestContext: { authorizer: { context } } };

            const result = await listFeatures(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(200)
            }
        })
    })

    describe('when the projectId is invalid', () => {
        it('should fail with a 400 Bad Request error', async () => {
            const evt = { ...event, pathParameters: null };
    
            const result = await listFeatures(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(400)
            }
        })
    })

    describe('when a project with a matching projectId is not found', () => {
        it('should fail with a 403 Forbidden error', async () => {
            const evt = { ...event, pathParameters: { projectId: uuid(), featureId: feat.id } };
    
            const result = await listFeatures(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(403)
            }
        })
    })

    // Generic reusable security-based tests //

    describe('when user does not have permissions', () => {
        it('should not list a feature', async () => {
            const context = { ...user, permissions: [] };
            const evt = { ...event, requestContext: { authorizer: { context } } };

            const result = await listFeatures(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(403)
            }
        })
    })

    describe('when the endpoint is being accessed without authorisation', () => {
        it('should fail with a 401 Unauthorized error', async () => {
            const evt = { ...event, requestContext: { authorizer: null } };
    
            const result = await listFeatures(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(401)
            }
        })
    })

    describe("when a user's organisation doesn't match that of the project identified by the given projectId", () => {
        it('should fail with a 403 Forbidden error', async () => {
            const context = { ...user, org: uuid() };
            const evt = { ...event, requestContext: { authorizer: { context } } };
    
            const result = await listFeatures(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(403)
            }
        })
    })

    describe("when an internal error occurs", () => {
        it('should fail with a 500 Internal server error', async () => {

            findOne.mockImplementationOnce(() => Promise.reject(new Error('Test error')));

            const result = await listFeatures(event, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(500)
            }
        })
    })
})