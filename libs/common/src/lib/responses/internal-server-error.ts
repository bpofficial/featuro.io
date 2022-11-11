export function InternalServerError(error_description?: any) {
    return {
        statusCode: 500,
        body: JSON.stringify({
            error: 'Internal Server Error',
            error_code: 500,
            error_description
        })
    }
}