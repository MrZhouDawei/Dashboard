# Venice Dashboard

An interactive dashboard developed with Angular/Express.js/Node.js/Firebase stack, designed to provide monitoring tools and first view of real-time data regarding the city of Venice ([Currently browser version only](https://dashboard-rework.vercel.app)).

> **ℹ️ NOTE**\
> ***It is possible to add other dashboards of various kinds, with or without widgets***

## Index

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Execution](#project-execution)
- [Project Structure](#project-structure)
- [Features](#features)
- [Contribute](#contribute)
- [License](#license)
- [Contacts](#contacts)

## Introduction

This project offers a dynamic and responsive dashboard made with Angular. The goal is to provide a clear and interactive visualization of essential data for citizens and tourists.
To manage the data, Express.js framework is used with Json as data transmission format and Firebase realtime database to save the data to be displayed and Redis key-value db to speed up queries and reduce load on the database/backend.
To launch the project in ***prod*** we will use vercel(**hobby plan**).

## Requirements

- **Node.js** (version 23.9.0)
- **Angular CLI** (version 18.2.12)
- **npm** (version 10.9.2)
- **Vercel CLI** (version 39.3.0)

## Installation

1. **Clone the repository:**

    ```bash
    # Clone the repository and go to the root folder
    git clone https://github.com/veniceprojectcenter/dashboard-cityknowledge.git
    cd dashboard-cityknowledge

2. **Install backend dependencies**
    ```bash
    # Install the backend dependencies
    cd backend
    npm install

3. **Install frontend dependencies**
    ```bash
    # Go back to root and install the frontend dependencies
    cd ../frontend/dashboard-rework
    npm install

## Configuration 

```env
 .env

 # Backend configuration
 DATABASE_URL=https://dummy-database-url.firebaseio.com
 TIDEAPI_KEY=dummy-tide-api-key
 CORS_ORIGIN=https://dummy-frontend-url.vercel.app
 SCRAPEAPY_KEY=dummy-scrapeapy-key
 REDIS_URL=rediss://dummy-redis-url:port

 PRODUCTION=false
 ENCRYPTION_KEY=dummy-encryption-key
 TIDEAPI_KEY=dummy-tide-api-key

 # Frontend configuration
 PRODUCTION=false/true
 ENCRYPTION_KEY=dummy-encryption-key
 TIDEAPI_KEY=dummy-tide-api-key
 ```

### serviceAccountKey.json
How to get Firebase secret key:
[serviceAccountKey.json](https://firebase.google.com/docs/cloud-messaging/auth-server#provide-credentials-manually)

### TIDEAPI
How to get API: [Open Meteo](https://open-meteo.com/en/docs/air-quality-api)

### SCRAPEAPI
How to get API: [ScraperAPI](https://www.scraperapi.com/?utm_source=google&utm_medium=cpc&utm_id=1485898465_54263081981&utm_term=scraperapi&utm_mt=p&utm_device=d&utm_campaign=geoT1-s-Branded&gad_source=1&gclid=Cj0KCQiAlbW-BhCMARIsADnwaspHMz-hNLDeKUOM0A5BWaJFYDzBSj65vwKWL46p-qp2uvPNfqtJ2noaAi1aEALw_wcB)

### firebase config

> Add to the app.config.ts file

Log in to the Firebase Console:

1. Go to Firebase Console and log in with your Google account.
2. Create a new project (if you haven't already):
3. Click "Add Project" and follow the instructions.
4. Add an app to the project:
5. Once the project is created, go to the "Project Overview" section and click the Web icon (</>) to register a new web app.
6. Copy the configuration:
7. After registering the app, Firebase will provide you with a code block that contains your firebaseConfig. Copy this object and paste it into your application configuration file.

## Project Execution

### Dev

- Express.js Server: inside 📁 [backend](./backend) run:

    ```bash
    node api/index.js # run localhost:3000
    node api/cron.js # run crono job file

- Angular FrontEnd: inside 📁 [frontend/dashboard_rework](./frontend/dashboard_rework) run:

    ```bash
    ng build
    ng serve

### Production

> For testing before deploying 
- Express.js Server: inside 📁 [backend](./backend) run:

    ```bash
    vercel dev

- Angular FrontEnd: inside 📁 [frontend/dashboard_rework](./frontend/dashboard_rework) run:

    ```bash
    vercel dev

## Deployment
Inside the folders [backend](./backend), [frontend/dashboard_rework](./frontend/dashboard_rework) run:

    vercel --prod



**MORE**
> **⚠️ WARNING**\
> Crono job -> GitHub Actions (00:30)\
> Database -> Firebase realtime data (Free plan)

> > **🔴 IMPORTANT**\
> For Vercel you need to manually add the environment variables with Vercel CLI or directly from the Vercel project management panel of the profile that hosts the project:
> ```
> vercel env add DATABASE_URL https://dummy-database-url.firebaseio.com
> vercel env add TIDEAPI_KEY dummy-tide-api-key
> vercel env add CORS_ORIGIN https://dummy-frontend-url.vercel.app
> vercel env add SCRAPEAPY_KEY dummy-scrapeapy-key
> vercel env add REDIS_URL rediss://dummy-redis-url:port
> vercel env add PRODUCTION false
> vercel env add ENCRYPTION_KEY dummy-encry

## Project Structure

- 📂 **Backend**
- 📌 [`index.js`](./backend/api/index.js): Server entry point
- 📌 [`cron.js`](./backend/api/cron.js): Script for automatic data update
- 📌 [`api.js`](./backend/api/api.js): Script with API
- 📌 [`functions.js`](./backend/api/functions.js): File containing firebase scraping and saving procedures
- 📌 `.env`: Environment variables (to be protected)
- 📌 [`cache.js`](./backend/api/cache.js): Singleton that provides caching services (uses `redis.js`)
- 📌 [`redis.js`](./backend/api/redis.js): Singleton that creates the Redis client for communication with the Key-Value DB
- 📌 [`secure-scraping.js`](./backend/api/secure-scraping.js): Class for dynamic and secure scraping with ScraperAPI
- 📌 [`serviceAccountKey.json`](./backend/api/serviceAccountKey.json): File containing data/identification keys for the backend with Firebase
- 📌 [`vercel.json`](./backend/vercel.json): File containing configurations to be respected during deployment with the command `vercel --prod, vercel dev`
- 📂 **Frontend**
- 📌 [`components`](./frontend/dashboard_rework/src/app/components): Folder with the Angular components
- 📌 [`services`](./frontend/dashboard_rework/src/app/services): Angular services to communicate with the backend
- 📌 [`interfaces`](./frontend/dashboard_rework/src/app/interfaces): Folder containing Interfaces
- 📌 `.env`: Environment variables (to be protected)
- 📌 [`appRouting`](./frontend/dashboard_rework/src/app/app.routes.ts): File containing all the routes of the FrontEnd application
- 📌 [`appConfig`](./frontend/dashboard_rework/src/app/app.config.ts): File containing configurations of the FrontEnd app (*including # refresh*)
- 📌 [`assets`](./frontend/dashboard_rework/public): Folder containing public assets

## Features

- **Real Time Data Visualization:**
> The dashboard displays information updated in real time, allowing citizens and tourists to view essential data such as transport schedules, cameras and weather updates.

❌ **Responsive and Intuitive User Interface:**
> Designed to adapt to any device, the dashboard guarantees an optimal user experience on both desktop and mobile devices.

- **Advanced Data Management:**
> Using Firebase Realtime Database and Redis for caching, the system offers quick access to data and reduces the load on the backend.

- **Customizable Widget Integration:**
> Authorized users can add or remove widgets according to their needs, customizing the display of information, furthermore the widgets are moveable and resizable, possibility to save layouts.

- **Automatic Update and Cron Jobs:**
> The backend uses cron scripts (managed via GitHub Actions) to automatically update data at regular intervals (e.g. every night at 00:30).

- **RESTful API:**
> The system exposes a series of APIs to allow integration with other applications and services, facilitating the extensibility of the project.

- **Security and Authentication:**
> Thanks to the integration with Firebase and security practices (such as the management of environment variables), the project guarantees a high level of security for data access and management.

## Contribute

> Steps to add dashboards:
1. Have an authorized account to log in and add and edit dashboards
> Steps to add widgets:
1. Have an authorized account to log in and add and edit widgets
2. Add APIs to file (remember to use caching if possible)[`api.js`](./backend/api/api.js).
3. Add scraping/fetching logic to [`functions.js`](./backend/api/functions.js).
4. FrontEnd side: on the app login and create widgets, provide fields , url and src-link and add html,css,js code for widgets.\
   **5.IMPORTANT!!🔴**\
   <ins>For classes and IDs in js and css use unique format-names so they do not clash with other widgets!\
   Separate html from js otherwise there may be loading issues when adding widgets to dashboard<ins>

## License

This project is distributed under the [Apache License](LICENSE)

## Contacts

Main Contributor: [daweizhou2002@gmail.com](https://mail.google.com/mail/?view=cm&fs=1&to=daweizhou2002@gmail.com)

