export class ConcurrencyLimiter {
  constructor(limit = 2) {
    this.limit = Math.max(1, Number(limit) || 1);
    this.active = 0;
    this.queue = [];
  }

  run(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.#drain();
    });
  }

  #drain() {
    while (this.active < this.limit && this.queue.length) {
      const job = this.queue.shift();
      this.active += 1;

      Promise.resolve()
        .then(job.task)
        .then(job.resolve, job.reject)
        .finally(() => {
          this.active -= 1;
          this.#drain();
        });
    }
  }
}
