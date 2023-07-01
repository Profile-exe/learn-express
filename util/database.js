const { MongoClient } = require('mongodb');

const mongoConnect = (callback) => {
  MongoClient.connect(
    'mongodb+srv://kang:dding123@cluster0.kpdkhqt.mongodb.net/?retryWrites=true&w=majority'
  )
    .then((client) => {
      console.log('Connected!');
      callback(client);
    })
    .catch((err) => console.log(err));
};
