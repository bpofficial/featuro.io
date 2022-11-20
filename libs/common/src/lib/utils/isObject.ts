export function isObjectLike(obj: unknown) {
    return typeof obj === 'object' && !Array.isArray(obj) && obj !== null
}