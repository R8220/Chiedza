import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();
let sequelize;

if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'chiedza',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: { underscored: true, timestamps: true }
    }
  );
} else {
  const storage = process.env.SQLITE_STORAGE || './data/chiedza.sqlite';
  if (storage !== ':memory:') fs.mkdirSync(path.dirname(storage), { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite', storage, logging: false,
    define: { underscored: true, timestamps: true }
  });
}

export default sequelize;
