import express from 'express'

// A function to get the routes.
// That way all the route definitions are in one place which I like.
// This is the only thing that's exported
function getMemberRoutes() {
    const router = express.Router()
    router.get('/:id', retrieve)
    router.get('/', list)
    router.post('/', create)
    router.put('/:id', update)
    router.delete('/:id', del)
    return router
}

// all the controller and utility functions here:
async function retrieve(req, res) {
    const sum = Number(req.query.a) + Number(req.query.c)
    res.send(sum.toString())
}

async function list(req, res) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

async function create(req, res) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

async function update(req, res) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

async function del(req, res) {
    const difference = Number(req.query.a) - Number(req.query.b)
    res.send(difference.toString())
}

export { getMemberRoutes }
