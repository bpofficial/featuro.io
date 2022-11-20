import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, Ok } from '@featuro.io/common';

export const retrieveFeature: APIGatewayProxyHandler = async (
    event,
    _context
): Promise<APIGatewayProxyResult> => {
    try {
        return Ok('working!');
    } catch (err) {
        console.debug(err);
        return InternalServerError(err.message);
    }
};
