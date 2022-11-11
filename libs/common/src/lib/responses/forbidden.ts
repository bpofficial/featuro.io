export function Forbidden(error_description?: any) {
    return {
        statusCode: 403,
        body: JSON.stringify({
            error: 'Forbidden',
            error_code: 403,
            error_description
        })
    }
}