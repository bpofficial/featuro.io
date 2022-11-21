import 'reflect-metadata';

import { DataSource } from "typeorm";
import { Entities } from '@featuro.io/entities';

export async function createConnection() {
    return new DataSource({ 
        type: 'mysql',
        url: process.env.DB_URI,
        synchronize: process.env.NODE_ENV !== 'production',
        entities: Entities
    }).initialize()
        .catch((error) => {
            console.error('Database connection failed!', error)
            throw new Error('Internal Server Error');
        })
}
