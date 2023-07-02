require('dotenv').config();

const { MongoClient } = require('mongodb');

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@cluster0.kpdkhqt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
    .then((client) => {
      console.log('Connected!');
      _db = client.db(); // DB 연결 저장
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  } else {
    throw 'No database found!';
  }
};

module.exports = { mongoConnect, getDb };
