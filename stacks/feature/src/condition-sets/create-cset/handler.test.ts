import { OrganisationModel, ProjectModel } from '@featuro.io/models';
import { createFeature } from './handler';
import { v4 as uuid } from 'uuid';
import { DataSource } from 'typeorm';

describe('Create Feature', () => {

    const org = new OrganisationModel({
        id: uuid()
    })

    const proj = new ProjectModel({
        id: uuid(),
        key: 'test-proj',
        organisation: org
    })

    const user = {
        org: org.id,
        sub: 'test-user-id',
        permissions: ['create:feature']
    }

    const event: any = {
        pathParameters: {
            projectId: proj.id
        },
        body: JSON.stringify({
            name: 'Test Feature',
            key: 'test-feature'
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

    describe('when user has permissions', () => {
        it('should create a feature', async () => {
            const context = { ...user }
            const evt = { ...event, requestContext: { authorizer: { context } } };

            const result = await createFeature(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(201)
            }
        })
    })

    describe('when the request body is invalid', () => {
        it('should fail with a 400 Bad Request error', async () => {
            const evt = { ...event, body: JSON.stringify({}) };
    
            const result = await createFeature(evt, null, null);

            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(400)
            }
        })
    })

    describe('when user does not have permissions', () => {
        it('should not create a feature', async () => {
            const context = { ...user, permissions: [] };
            const evt = { ...event, requestContext: { authorizer: { context } } };

            const result = await createFeature(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(403)
            }
        })
    })

    describe('when the endpoint is being accessed without authorisation', () => {
        it('should fail with a 401 Unauthorized error', async () => {
            const evt = { ...event, requestContext: { authorizer: null } };
    
            const result = await createFeature(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(401)
            }
        })
    })

    describe('when the projectId is invalid', () => {
        it('should fail with a 400 Bad Request error', async () => {
            const evt = { ...event, pathParameters: null };
    
            const result = await createFeature(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(400)
            }
        })
    })

    describe('when a project with a matching projectId is not found', () => {
        it('should fail with a 403 Forbidden error', async () => {
            const evt = { ...event, pathParameters: { projectId: uuid() } };
    
            const result = await createFeature(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(403)
            }
        })
    })

    describe("when a user's organisation doesn't match that of the project identified by the given projectId", () => {
        it('should fail with a 403 Forbidden error', async () => {
            const context = { ...user, org: uuid() };
            const evt = { ...event, requestContext: { authorizer: { context } } };
    
            const result = await createFeature(evt, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(403)
            }
        })
    })

    describe("when an internal error occurs", () => {
        it('should fail with a 500 Internal server error', async () => {

            findOne.mockImplementationOnce(() => Promise.reject(new Error('Test error')));

            const result = await createFeature(event, null, null);
            
            expect(result).toBeTruthy();
            if (result) {
                expect(result.statusCode).toBe(500)
            }
        })
    })
})