import { APIGatewayProxyHandler } from 'aws-lambda';
import { createConnection } from '@featuro.io/common';
import { DataSource } from 'typeorm';

let connection: DataSource;
export const createOrganisation: APIGatewayProxyHandler = async (event, _context) => {
    connection = connection || await createConnection();

    return {
        statusCode: 200,
        body: ''
    };
};
