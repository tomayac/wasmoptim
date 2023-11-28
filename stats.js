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

    const saveResult = await saveResponse.json();
    console.log(saveResult);
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

    const statsResult = await statsResponse.json();
    console.log(statsResult);
    return statsResult;
  } catch (error) {
    console.error(error.name, error.message);
  }
};

(async () => {
  const stats = await getStats();
  if (stats) {
    statsFiles.textContent = stats.files;
    statsSize.textContent = prettyBytes(stats.size);
    statsPercent.textContent = stats.percent;
  }
})();

export { sendStats };
