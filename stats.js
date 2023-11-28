import { statsFiles, statsSize, statsPercent } from './dom.js';
import prettyBytes from 'pretty-bytes';

const STATS_ENDPOINT = 'https://wasmoptim-stats.glitch.me';

const sendStats = async (beforeSize, afterSize) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const body = JSON.stringify({ beforeSize, afterSize });
  try {
    const saveResponse = await fetch(`${STATS_ENDPOINT}/saved-bytes`, {
      method: 'POST',
      headers,
      body,
    });
    await saveResponse.json();
  } catch (error) {
    console.error(error.name, error.message);
  }
};

const getStats = async () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  try {
    const statsResponse = await fetch(`${STATS_ENDPOINT}/saved-bytes`, {
      method: 'GET',
      headers,
    });

    const stats = await statsResponse.json();
    statsFiles.textContent = stats.entryCount;
    statsSize.textContent = prettyBytes(stats.totalBytesSaved);
    statsPercent.textContent = stats.averagePercentageSaved;
  } catch (error) {
    console.error(error.name, error.message);
  }
};
getStats();

export { sendStats, getStats };
