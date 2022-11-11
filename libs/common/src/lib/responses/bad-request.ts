export function BadRequest(error_description?: any) {
    return {
        statusCode: 400,
        body: JSON.stringify({
            error: 'Bad Request',
            error_code: 400,
            error_description
        })
    }
}