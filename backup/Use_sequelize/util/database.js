require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_SCHEMA,
  process.env.DB_USER,
  process.env.DB_PASSWD,
  {
    dialect: 'mysql',
    host: '127.0.0.1',
  }
); // 커넥션 풀 자동으로 설정

module.exports = sequelize;
