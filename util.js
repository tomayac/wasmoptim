const limit = async (tasks, concurrency) => {
  const results = [];

  const runTasks = async (tasksIterator) => {
    for (const [index, task] of tasksIterator) {
      try {
        results[index] = await task();
      } catch (error) {
        results[index] = new Error(`Failed with: ${error.message}`);
      }
    }
  };

  const taskRunners = new Array(concurrency)
    .fill(tasks.entries())
    .map(runTasks);
  await Promise.allSettled(taskRunners);

  return results;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export { limit, debounce };
