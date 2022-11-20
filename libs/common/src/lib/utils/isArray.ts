export function isArrayLike(obj: unknown) {
    return typeof obj === 'object' && Array.isArray(obj) && obj !== null
}