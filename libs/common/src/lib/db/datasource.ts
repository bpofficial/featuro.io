import { DataSource } from "typeorm";

export const MySQLDataSource = new DataSource({
    type: 'mysql'
})
