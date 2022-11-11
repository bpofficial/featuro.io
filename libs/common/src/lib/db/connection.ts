import { MySQLDataSource } from "./datasource";

export const createConnection = async () => {
    await MySQLDataSource.initialize()
        .catch((error) => console.log(error))

    return MySQLDataSource;
}
