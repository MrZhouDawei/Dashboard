require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const apiRoutes = require('./api');
const serviceAccount = require("./serviceAccountKey.json");

/**
 * @description Express server configuration with Firebase authentication and CORS setup.
 */

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'OPTION'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Initialize Firebase Admin SDK with service account credentials.
 */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', apiRoutes);

module.exports = app;
