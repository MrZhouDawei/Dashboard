const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const secureScraping = require('./secure-scraping');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Deletes the existing data at the specified Firebase database path.
 * @param {string} path - The database path from which to remove the data.
 */
async function deleteExistingData(path) {
    try {
        await admin.database().ref(path).remove();
    } catch (error) {
        console.error(`Error deleting data from ${path}:`, error.message);
    }
}

/**
 * Scrapes air quality data for Venice using the Open-Meteo API.
 * @returns {Promise<Object>} The air quality data.
 */
async function scrapeVeniceAirQualityData(){
    const lat = 45.437191; // Latitude for Venice
    const lng = 12.334590; // Longitude for Venice

    // New URL for the Open-Meteo API
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}` +
        `&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index,ammonia,methane`;

    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching Venice air quality data', error);
    }
}

/**
 * Saves the air quality data for Venice to Firebase.
 * @param {Object} data - The air quality data to be saved.
 */
async function saveVeniceAirDataToFirebase(data){
    try{
        const date = new Date().toISOString().split('T')[0];
        await deleteExistingData('dashboard/data/VeniceAir');
        await admin.database().ref(`dashboard/data/VeniceAir/${date}/`).set({
            data: data
        });
    } catch(error) {
        console.error(`Error saving Venice air quality data:`, error);
    }
}

/**
 * Scrapes tourism data for Venice from the Veneto Region website.
 * @returns {Promise<Array>} An array of objects containing description, arrivals, and presence data.
 */
async function scrapeVeniceTourismData() {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    const url = `https://statistica.regione.veneto.it/jsp/turi1.jsp?D0=${previousYear}&D1=REGIONE+VENETO&D2=00Totale+anno&` +
        `D3=Movimento+annuale+per+tipo+di+esercizio&B1=Visualizza`;
    try {
        // Perform the HTTP request to the page
        const { data } = await axios.get(url);

        // Load the HTML response into Cheerio
        const $ = cheerio.load(data);

        // Select the second table (index 1)
        const table = $('table').eq(1);

        // Extract description, arrivals, and presence values
        const tourismData = [];
        table.find('tr').each((i, row) => {
            const rowCells = $(row).find('td')
                .map((i, cell) => $(cell).text().trim()).get();
            if (rowCells.length > 0) {
                const description = rowCells[0];
                const arrivals = parseInt(rowCells[rowCells.length - 2].replace(/\./g, ''));
                const present = parseInt(rowCells[rowCells.length - 1].replace(/\./g, ''));

                tourismData.push({
                    description,
                    arrivals,
                    present
                });
            }
        });
        return tourismData;
    } catch (error) {
        console.error(`Error fetching tourism data: ${error}`);
    }
}

/**
 * Saves the tourism data for Venice to Firebase.
 * @param {Array} data - The tourism data array to be saved.
 */
async function saveVeniceTourismDataToFirebase(data) {
    try{
        const date = new Date().toISOString().split('T')[0];
        await deleteExistingData('dashboard/data/Tourism');
        await admin.database().ref(`dashboard/data/Tourism/${date}/`).set({
            data: data
        });
        console.log(`Venice tourism data successfully saved to Firebase`);
    } catch (error) {
        console.error("Error saving Venice tourism data to Firebase", error);
    }
}

/**
 * Scrapes train timetable data for Venice from the specified URL.
 * @param {string} url - The URL of the page containing train timetable data.
 * @returns {Promise<Array>} An array of train timetable data.
 */
async function scrapeVeniceTrainsTimeData(url){
    try{
        let allTrainsData = [];
        const singleTitleRow = {};

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        let listTitleRow = $('thead[id=headerTabId] tr');

        listTitleRow.find('th').each((i, row) => {
            const id = $(row).attr('id');
            singleTitleRow[id] = $(row).text().trim();
        });
        allTrainsData.push(singleTitleRow);

        let listRows = $('tbody[id=bodyTabId] tr');

        listRows.each((i, row) => {
            const $row = $(row);
            const singleTrainData = {};

            $row.find('td').each((y, cell) => {
                const $cell = $(cell);
                const id = $cell.attr('id');

                if ($cell.find('img').length > 0) {
                    singleTrainData[id] = $cell.find('img').attr('src');
                } else {
                    // Check first in divs, otherwise get direct text
                    singleTrainData[id] = $cell.find('div').text().trim() || $cell.text().trim();
                }
            });
            allTrainsData.push(singleTrainData);
        });
        return allTrainsData;
    } catch(error) {
        console.error("Error fetching Venice Trains Time Data", error);
    }
}

/**
 * Scrapes population data for Venice.
 * @returns {Promise<Array|null>} An array of population data or null if no data is found.
 */
async function scrapePopulationData() {
    try {
        const url = 'https://portale.comune.venezia.it/millefoglie/statistiche/scheda/QUARTIERE-POPOLA-2$1$--------';
        const { data } = await axios.get(url);

        const $ = cheerio.load(data);

        // Find the last row of the table
        const lastRow = $('table tr').last();
        const rowData = [];

        // Extract data from each cell in the row
        lastRow.find('td').each((x, cell) => {
            rowData.push($(cell).text().trim());
        });

        return rowData.length > 0 ? rowData : null;
    } catch (error) {
        console.error('Error scraping population data:', error);
        return null;
    }
}

/**
 * Saves the population data for Venice to Firebase.
 * @param {Array} data - The population data to be saved.
 */
async function savePopulationDataToFirebase(data) {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const path = `dashboard/data/VenicePopulation/${dateString}`;

    try {
        await deleteExistingData('dashboard/data/VenicePopulation/');
        await admin.database().ref(path).set({
            col1: data[0] || null,
            col2: data[1] || null,
            col3: data[2] || null,
            timestamp: today.toLocaleString(),
        });
        console.log(`Population data successfully saved to Firebase: ${path}`);
    } catch (error) {
        console.error(`Error saving population data to Firebase:`, error);
    }
}

/**
 * Fetches tide data using the Stormglass API.
 * @param {number} lat - The latitude for the API request.
 * @param {number} lng - The longitude for the API request.
 * @returns {Promise<Object|null>} The tide data or null if an error occurs.
 */
async function fetchTideData(lat, lng) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const start = today.toISOString().split('T')[0];
    const end = tomorrow.toISOString().split('T')[0];

    const url = `https://api.stormglass.io/v2/tide/extremes/point?lat=${lat}&lng=${lng}&start=${start}&end=${end}`;

    try {
        const { data } = await axios.get(url, {
            headers: {
                Authorization: process.env.TIDEAPI_KEY,
            },
        });
        return data;
    } catch (error) {
        console.error('Error fetching tide data from Stormglass API:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Saves the tide data to Firebase.
 * @param {Object} data - The tide data received from the API.
 * @param {string} startDate - The start date (ISO format, date only).
 * @param {string} endDate - The end date (ISO format, date only).
 */
async function saveTideDataToFirebase(data, startDate, endDate) {
    const path = `dashboard/data/Tides/${startDate}_to_${endDate}`;

    try {
        await deleteExistingData('dashboard/data/Tides/');
        await admin.database().ref(path).set({
            tides: data.data,
            meta: data.meta,
            timestamp: new Date().toLocaleString(),
        });
    } catch (error) {
        console.error('Error saving tide data to Firebase:', error.message);
    }
}

/**
 * Fetches and saves bus data to Firebase.
 * Performs web scraping for each defined bus stop and saves the records in the database.
 */
async function saveBusDataToFirebase() {
    try {
        const date = new Date().toISOString().split('T')[0];
        // List of bus stop IDs (e.g., clusters of nearby stops)
        const listBusStopsIds = ['503','501','505','506','507','508','509','510','511','512','6084','8044','514','515','516','517'];
        const allBusData = [];

        /**
         * Converts a time string "HH:MM:SS" to seconds from the start of the day.
         * @param {string} timeStr - The time string.
         * @returns {number} The time in seconds.
         */
        function timeStringToSeconds(timeStr) {
            if (!timeStr || timeStr === "Undefined") return 0;
            const [hh, mm, ss] = timeStr.split(':').map(Number);
            return hh * 3600 + mm * 60 + ss;
        }

        /**
         * Fetches data for a single bus stop.
         * @param {string} busStopId - The bus stop ID.
         */
        async function fetchBusStopData(busStopId) {
            try {
                const url = `https://orari.actv.it/getStopSingle/${date}/AUT/${busStopId}`;
                const { data } = await secureScraping.secureGet(url);
                const busData = data[0];

                if (busData && busData.lines) {
                    busData.lines.forEach((line) => {
                        if (line && line.stopTimes) {
                            line.stopTimes.forEach(stopTime => {
                                if (stopTime && stopTime.sTimeDeparture && stopTime.sTimeDeparture !== "Undefined") {
                                    const departureTimestamp = timeStringToSeconds(stopTime.sTimeDeparture);
                                    allBusData.push({
                                        stopId: busStopId,
                                        lineName: line.lineName || null,
                                        linePath: line.linePath || null,
                                        sTimeDeparture: stopTime.sTimeDeparture,
                                        departureTimestamp: departureTimestamp,
                                        sNameNext: stopTime.sNameNext || null,
                                        sTimeNext: stopTime.sTimeNext || null,
                                        sNameTerminal: stopTime.sNameTerminal || null,
                                        sTimeTerminal: stopTime.sTimeTerminal || null
                                    });
                                }
                            });
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching data for bus stop ${busStopId}:`, error.message);
            }
        }

        // Execute requests in batches (e.g., 4 at a time with 10 seconds delay between batches)
        await secureScraping.processInBatches(listBusStopsIds, fetchBusStopData, 4, 10000);

        if (allBusData.length > 0) {
            await deleteExistingData('busData/');
            const busDataRef = admin.database().ref("busData");

            const promises = allBusData.map(record => busDataRef.push(record));
            await Promise.all(promises);

            console.log(`Bus data successfully saved with ${allBusData.length} records.`);
        } else {
            console.warn('No new bus data found.');
        }
    } catch (error) {
        console.error('Error saving bus data to Firebase:', error);
    }
}

/**
 * Fetches and saves boat (vaporetti) data to Firebase.
 * Performs web scraping for each defined boat stop and saves the records in the database.
 */
async function saveBoatDataToFirebase() {
    try {
        const date = new Date().toISOString().split('T')[0];
        const listBoatStopsIds = ['5029', '5028', '5027', '5104', '5112', '5030', '5031'];
        const allBoatData = [];

        /**
         * Converts a time string "HH:MM:SS" to seconds from the start of the day.
         * @param {string} timeStr - The time string.
         * @returns {number} The time in seconds.
         */
        function timeStringToSeconds(timeStr) {
            if (!timeStr || timeStr === "Undefined") return 0;
            const [hh, mm, ss] = timeStr.split(':').map(Number);
            return hh * 3600 + mm * 60 + ss;
        }

        /**
         * Fetches data for a single boat stop.
         * @param {string} boatStopId - The boat stop ID.
         */
        async function fetchBoatStopData(boatStopId) {
            try {
                const url = `https://orari.actv.it/getStopSingle/${date}/NAV/${boatStopId}`;
                const { data } = await secureScraping.secureGet(url);
                const boatData = data[0];

                if (boatData && boatData.lines) {
                    boatData.lines.forEach((line) => {
                        if (line && line.stopTimes) {
                            line.stopTimes.forEach(stopTime => {
                                if (stopTime && stopTime.sTimeDeparture && stopTime.sTimeDeparture !== "Undefined") {
                                    const departureTimestamp = timeStringToSeconds(stopTime.sTimeDeparture);
                                    allBoatData.push({
                                        stopId: boatStopId,
                                        lineName: line.lineName || null,
                                        linePath: line.linePath || null,
                                        sTimeDeparture: stopTime.sTimeDeparture,
                                        departureTimestamp: departureTimestamp,
                                        sNameNext: stopTime.sNameNext || null,
                                        sTimeNext: stopTime.sTimeNext || null,
                                        sNameTerminal: stopTime.sNameTerminal || null,
                                        sTimeTerminal: stopTime.sTimeTerminal || null
                                    });
                                }
                            });
                        }
                    });
                }
            } catch (error) {
                console.error(`Error fetching data for boat stop ${boatStopId}:`, error.message);
            }
        }

        // Process requests in batches (e.g., 4 at a time with 10 seconds delay between batches)
        await secureScraping.processInBatches(listBoatStopsIds, fetchBoatStopData, 4, 10000);

        if (allBoatData.length > 0) {
            await deleteExistingData('boatData/');

            const promises = allBoatData.map(record => {
                const ref = admin.database().ref("boatData");
                return ref.push(record);
            });
            await Promise.all(promises);
            console.log(`Boat data successfully saved with ${allBoatData.length} records.`);
        } else {
            console.warn('No new boat data found.');
        }
    } catch (error) {
        console.error('Error saving boat data to Firebase:', error);
    }
}

/**
 * Scrapes flight data from the provided HTML data.
 * Extracts information from the <script> tag containing "__NEXT_DATA__".
 * @param {string} htmlData - The HTML content of the page.
 * @param {boolean} isArrival - Flag indicating whether the flights are arrivals.
 * @returns {Object} An object containing date, airport name, app host URL, flight details, and arrival flag.
 * @throws {Error} If the <script> tag or JSON delimiters are not found.
 */
async function scrapeFlights(htmlData, isArrival) {
    try {
        const $ = cheerio.load(htmlData);
        const scriptText = $('script:contains("__NEXT_DATA__")').text().trim();
        if (!scriptText) {
            throw new Error("Unable to find the <script> tag with __NEXT_DATA__");
        }
        const firstCurly = scriptText.indexOf('{');
        const lastCurly = scriptText.lastIndexOf('};');
        if (firstCurly === -1 || lastCurly === -1) {
            throw new Error("Unable to identify JSON delimiters in the string");
        }
        const jsonString = scriptText.substring(firstCurly, lastCurly + 1);
        const nextData = JSON.parse(jsonString);

        let date = nextData.props.initialState.flightTracker.route.header.date;
        let airportName = nextData.props.initialState.flightTracker.route.header.title;
        let appHostUrl = nextData.props.initialState.app.appHost;
        let flights = nextData.props.initialState.flightTracker.route.flights;

        return {
            date,
            airportName,
            appHostUrl,
            flights,
            isArrival
        };
    } catch (error) {
        console.error("Error scraping flight data:", error);
        throw error;
    }
}

module.exports = {
    savePopulationDataToFirebase,
    saveTideDataToFirebase,
    saveBusDataToFirebase,
    saveBoatDataToFirebase,
    saveVeniceTourismDataToFirebase,
    saveVeniceAirDataToFirebase,
    fetchTideData,
    scrapePopulationData,
    scrapeVeniceTrainsTimeData,
    scrapeFlights,
    scrapeVeniceTourismData,
    scrapeVeniceAirQualityData,
};
