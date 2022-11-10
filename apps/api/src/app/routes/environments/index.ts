import express, { Request, Response } from 'express'

function getEnvironmentRoutes() {
    const router = express.Router()
    router.get('/:id', retrieve)
    router.get('/', list)
    router.post('/', create)
    router.put('/:id', update)
    router.delete('/:id', del)
    return router
}

// all the controller and utility functions here:
async function retrieve(req: Request, res: Response) {
    const sum = Number(req.query.a) + Number(req.query.c)
    res.send(sum.toString())
}

async function list(req: Request, res: Response) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

async function create(req: Request, res: Response) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

async function update(req: Request, res: Response) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

async function del(req: Request, res: Response) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

export { getEnvironmentRoutes }
