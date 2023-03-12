const { Telegraf } = require('telegraf');
const axios = require('axios');
const { getInfo } = require('./query');

const bot = new Telegraf('6293036775:AAGaEVUXINoQLDaU13Ge9XuP5GQfKyjku1c');

const kreonId = "5909990042579";

const prepareResult = async () => {
    const allData = await Promise.all(Array.from(new Array(9), (x, i) => getInfo(kreonId, i + 1)));
    return allData.reduceRight((acc, data, i) => {
        return data.reduce((dataAcc, { stock: [{ itemStatus }], pharmacy: { street, buildingNumber, geoLocation } }) => {
            const key = `${street} ${buildingNumber}`;
            if (dataAcc[key]?.amount) { return dataAcc };
            return {
                ...dataAcc, 
                [key]: {
                    geo: geoLocation,
                    amount: itemStatus === 'AVAILABLE' ? i + 1 : null,
                }
            };
        }, acc)
    }, {})
}

const buildGoogleMapsURL = async () => {
    const result = await prepareResult();
    const baseUrl = "http://localhost:8080?coords=";
    const markers = Object.values(result).map(({geo: {latitude: lat, longitude: lng}, amount: tooltip}) => ({ lat, lng, tooltip }))
    const markerStrings = markers.map(marker => `${marker.lat},${marker.lng},${encodeURIComponent(marker.tooltip)}`);
    return baseUrl + markerStrings.join(";");
}

bot.start(async (ctx) => {
    const result = await prepareResult();
    ctx.reply(Object.entries(result).map(([key, value]) => `${key}: ${value.amount}`).join("\n"));
});

bot.command('map', async (ctx) => {
    ctx.reply(await buildGoogleMapsURL());
});

bot.launch();

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });
