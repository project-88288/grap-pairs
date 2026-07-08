require('dotenv').config();
const binanceClient = require('./binance');
const kucoinClient = require('./kucoin');
const fileUtils = require('./fileUtils');
const path = require('path');

// Resolve paths - handle both absolute and relative paths
const resolvePath = (envPath, defaultPath) => {
  const pathValue = envPath || defaultPath;
  return path.isAbsolute(pathValue) ? pathValue : path.resolve(process.cwd(), pathValue);
};

const GRAP_PAIR = resolvePath(process.env.GRAP_PAIR, './results');
const TOP_LIMIT = parseInt(process.env.TOP_LIMIT || '50');

// Feature gates (set to "false" in .env to disable)
const parseBool = (value, defaultValue = true) =>
  value === undefined ? defaultValue : value.toLowerCase() === 'true';
const FAVORITE_PAIRS = parseBool(process.env.FavoritePairs);
const TOP_GAINERS = parseBool(process.env.getTopGainers);
const TOP_LOSERS = parseBool(process.env.getTopLosers);
const TOP_ACTIVE = parseBool(process.env.getTopActiveByVolume);
const ADD_EXITS = parseBool(process.env.addExits);

async function fetchAllData() {
  console.log('🚀 Starting pair data fetch...\n');
  console.log(`⚙️  Configuration:`);
  console.log(`   Top limit: ${TOP_LIMIT}`);
  console.log(`   Results folder: ${GRAP_PAIR}\n`);

  console.log(`   Favorite pairs: ${FAVORITE_PAIRS ? 'enabled' : 'disabled'}`);
  console.log(`   Top active by volume: ${TOP_ACTIVE ? 'enabled' : 'disabled'}`);
  console.log(`   Top gainers: ${TOP_GAINERS ? 'enabled' : 'disabled'}`);
  console.log(`   Top losers: ${TOP_LOSERS ? 'enabled' : 'disabled'}`);
  console.log(`   Merge with existing: ${ADD_EXITS ? 'enabled' : 'disabled (overwrite)'}\n`);

  // Fetch favorite pairs from exchange futures APIs
  let binanceFavorites = [];
  if (FAVORITE_PAIRS) {
    console.log('📊 Fetching favorite pairs from exchange futures...');
    binanceFavorites = await binanceClient.getFuturesFavoritePairs();
    console.log(`   ✓ Binance futures pairs: ${binanceFavorites.join(', ')}\n`);
  }

  const results = {
    binance: {},
    kucoin: {},
    timestamp: fileUtils.getCurrentTimestamp()
  };

  // Fetch Binance data
  console.log('📊 Fetching Binance data...');
  results.binance.favorites = FAVORITE_PAIRS
    ? await binanceClient.getFavoritePairs(binanceFavorites)
    : [];
  console.log(`   ✓ Found ${results.binance.favorites.length} favorite pairs`);

  results.binance.topActive = TOP_ACTIVE
    ? await binanceClient.getTopActiveByVolume(TOP_LIMIT)
    : [];
  console.log(`   ✓ Found ${results.binance.topActive.length} top active pairs`);

  results.binance.topGainers = TOP_GAINERS
    ? await binanceClient.getTopGainers(TOP_LIMIT)
    : [];
  console.log(`   ✓ Found ${results.binance.topGainers.length} top gainer pairs`);

  results.binance.topLosers = TOP_LOSERS
    ? await binanceClient.getTopLosers(TOP_LIMIT)
    : [];
  console.log(`   ✓ Found ${results.binance.topLosers.length} top loser pairs\n`);

  // Fetch Kucoin data
  console.log('📊 Fetching Kucoin data...');
  results.kucoin.favorites = [];
  console.log(`   ✓ Found ${results.kucoin.favorites.length} favorite pairs`);

  results.kucoin.topActive = TOP_ACTIVE
    ? await kucoinClient.getTopActiveByVolume(TOP_LIMIT)
    : [];
  console.log(`   ✓ Found ${results.kucoin.topActive.length} top active pairs`);

  results.kucoin.topGainers = TOP_GAINERS
    ? await kucoinClient.getTopGainers(TOP_LIMIT)
    : [];
  console.log(`   ✓ Found ${results.kucoin.topGainers.length} top gainer pairs`);

  results.kucoin.topLosers = TOP_LOSERS
    ? await kucoinClient.getTopLosers(TOP_LIMIT)
    : [];
  console.log(`   ✓ Found ${results.kucoin.topLosers.length} top loser pairs\n`);

  // Save data to files
  console.log('💾 Saving data to files...\n');

  // Format data - only symbol names as clean array
  const formatCategory = (data) => data.map(p => p.symbol);

  // Merge all categories into single arrays per exchange
  const binancePairs = [
    ...formatCategory(results.binance.favorites),
    ...formatCategory(results.binance.topActive),
    ...formatCategory(results.binance.topGainers),
    ...formatCategory(results.binance.topLosers)
  ];

  const kucoinPairs = [
    ...formatCategory(results.kucoin.favorites),
    ...formatCategory(results.kucoin.topActive),
    ...formatCategory(results.kucoin.topGainers),
    ...formatCategory(results.kucoin.topLosers)
  ];

  // Save clean pair arrays. When addExits is enabled, merge with existing data
  // before writing; otherwise overwrite the files with this run's pairs only.
  if (ADD_EXITS) {
    fileUtils.mergeAndSaveJson(GRAP_PAIR, 'binance-pairs.json', binancePairs);
    fileUtils.mergeAndSaveJson(GRAP_PAIR, 'kucoin-pairs.json', kucoinPairs);
  } else {
    fileUtils.saveToJson(GRAP_PAIR, 'binance-pairs.json', [...new Set(binancePairs)]);
    fileUtils.saveToJson(GRAP_PAIR, 'kucoin-pairs.json', [...new Set(kucoinPairs)]);
  }

  console.log('✅ All data saved successfully!\n');
  return results;
}

// Run the fetcher
fetchAllData().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
