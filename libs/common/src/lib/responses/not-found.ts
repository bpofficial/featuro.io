export function NotFound(error_description?: any) {
    return {
        statusCode: 404,
        body: JSON.stringify({
            error: 'Not Found',
            error_code: 404,
            error_description
        })
    }
}