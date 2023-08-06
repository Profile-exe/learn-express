const path = require('path');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

require('dotenv').config();

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const isAuth = require('./middleware/is-auth');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, 'images'); // null: no error, 'images': folder name
    cb(null, path.join(__dirname, 'images'));
  },
  filename: (req, file, cb) => {
    // cb(null, `${new Date().toISOString()}-${file.originalname}`);
    cb(null, `${new Date().getTime()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
  if (['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb(null, true); // accept file
  } else {
    cb(null, false); // reject file
  }
};

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/feed', isAuth, feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode, message, data } = error;
  res.status(statusCode || 500).json({ message, data });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('DB Connected!');
    const server = app.listen(8080);

    server.keepAliveTimeout = 61 * 1000;
    server.headersTimeout = 61 * 1.5 * 1000;
  })
  .catch((err) => console.log(err));
