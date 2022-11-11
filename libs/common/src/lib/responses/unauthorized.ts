export function Unauthorized(error_description?: any) {
    return {
        statusCode: 401,
        body: JSON.stringify({
            error: 'Unauthorized',
            error_code: 401,
            error_description
        })
    }
}