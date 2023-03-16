const { Telegraf } = require('telegraf');
const { getInfo } = require('./query');

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

const kreonId = '5909990042579';

const prepareResult = async () => {
  const allData = await Promise.all(Array.from({ length: 9 }, (_, i) => getInfo(kreonId, i + 1)));
  return allData.reduceRight((acc, data, i) =>
    data.reduce((dataAcc, { stock: [{ itemStatus }], pharmacy: { street, buildingNumber, geoLocation } }) => {
      const key = `${street} ${buildingNumber}`;
      if (dataAcc[key]?.amount) return dataAcc;
      return { ...dataAcc, [key]: { geo: geoLocation, amount: itemStatus === 'AVAILABLE' ? i + 1 : null } };
    }, acc),
    {}
  );
};

const buildGoogleMapsURL = async () => {
  const result = await prepareResult();
  const baseUrl = process.env.MAP_SITE_LINK;
  const markers = Object.values(result).map(({ geo: { latitude: lat, longitude: lng }, amount: tooltip }) => ({ lat, lng, tooltip }));
  const markerStrings = markers.map(marker => `${marker.lat},${marker.lng},${encodeURIComponent(marker.tooltip)}`);
  return baseUrl + markerStrings.join(';');
};

bot.start(async ctx => {
  const result = await prepareResult();
  ctx.reply(Object.entries(result).map(([key, value]) => `${key}: ${value.amount}`).join('\n'));
});

bot.command('map', async ctx => {
  ctx.reply(await buildGoogleMapsURL());
});

bot.launch();

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
});
