export function Created(data?: any) {
    return {
        statusCode: 201,
        body: JSON.stringify(data)
    }
}