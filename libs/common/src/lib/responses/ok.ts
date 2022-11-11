export function Ok(data?: any) {
    return {
        statusCode: 200,
        body: JSON.stringify(data)
    }
}