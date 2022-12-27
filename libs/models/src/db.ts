import 'reflect-metadata';

import { DataSource } from "typeorm";
import { Entities } from './entities';

export async function createConnection() {
    return new DataSource({ 
        type: 'mysql',
        connectorPackage: 'mysql2',
        driver: require('mysql2'),
        url: process.env.DB_URI,
        synchronize: process.env.NODE_ENV !== 'production',
        entities: Entities,
        cache: true,
        poolSize: 16000,
    }).initialize()
        .catch((error) => {
            console.error('Database connection failed!', error)
            throw new Error('Internal Server Error');
        })
}
