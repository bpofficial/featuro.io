import express from 'express';

export const getRoutes = () => {
    // create a router for all the routes of our app
    const router = express.Router()

    router.use('/api/v1/organisations', getMathRoutes())
    router.use('/api/v1/projects', getMathRoutes())
    router.use('/api/v1/environments', getMathRoutes())
    router.use('/api/v1/features', getMathRoutes())
    router.use('/api/v1/members', getMathRoutes())

    return router
}
