import { CONFIGURATION } from 'src/libs';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: CONFIGURATION.DATABASE.HOST,
  port: CONFIGURATION.DATABASE.PORT,
  username: CONFIGURATION.DATABASE.USERNAME,
  password: CONFIGURATION.DATABASE.PASSWORD,
  database: CONFIGURATION.DATABASE.NAME,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: true,
};

export const dataSource: DataSource = new DataSource(dataSourceOptions);
