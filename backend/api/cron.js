const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const dotenv = require("dotenv");
dotenv.config();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_URL,
    });
}

const {
    savePopulationDataToFirebase,
    saveTideDataToFirebase,
    saveBusDataToFirebase,
    saveBoatDataToFirebase,
    saveVeniceTourismDataToFirebase,
    saveVeniceAirDataToFirebase,
    fetchTideData,
    scrapePopulationData,
    scrapeVeniceAirQualityData,
    scrapeVeniceTourismData,
} = require('./functions');

/**
 * Main function to handle data scraping and saving to Firebase.
 */
async function handler() {
    try {
        console.log('Cron job started...');

        const populationData = await scrapePopulationData();
        if (populationData) await savePopulationDataToFirebase(populationData);

        const veniceAirQualityData = await scrapeVeniceAirQualityData();
        if (veniceAirQualityData) await saveVeniceAirDataToFirebase(veniceAirQualityData);

        const veniceTourismData = await scrapeVeniceTourismData();
        if (veniceTourismData) await saveVeniceTourismDataToFirebase(veniceTourismData);

        const tideData = await fetchTideData(45.4408, 12.3155);
        if (tideData) {
            const today = new Date();
            const startDate = today.toISOString().split('T')[0];
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const endDate = tomorrow.toISOString().split('T')[0];
            await saveTideDataToFirebase(tideData, startDate, endDate);
        }

        await saveBusDataToFirebase();
        await saveBoatDataToFirebase();

        console.log('Cron job completed...');
    } catch (error) {
        console.error('Error during cron job execution:', error.message);
    } finally {
        await admin.app().delete();
        console.log("Firebase app deleted. Exiting...");
        process.exit(0);
    }
}

handler();