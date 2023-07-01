const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('node_complete', 'root', '', {
  dialect: 'mysql',
  host: '127.0.0.1',
}); // 커넥션 풀 자동으로 설정

module.exports = sequelize;
