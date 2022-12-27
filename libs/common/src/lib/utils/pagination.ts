import { APIGatewayProxyEvent } from 'aws-lambda';

export function getPaginationParams(event: APIGatewayProxyEvent) {
    let page: string | number = event.queryStringParameters?.['page'] ?? '1';
    let pageSize: string | number = event.queryStringParameters?.['pageSize'] ?? '50';

    if (!page || Number.isNaN(page)) {
        page = 1;
    }
    page = Number(page);

    if (!pageSize || Number.isNaN(pageSize)) {
        pageSize = 50;
    }
    pageSize = Number(pageSize);
    
    return { page, pageSize };
}

export function paginate(data: unknown[], totalItems: number, page: number, pageSize: number) {
    return { 
        totalItems, 
        page, 
        pageSize: Math.min(data.length, pageSize),
        data 
    }
}