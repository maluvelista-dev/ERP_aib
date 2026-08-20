import { performance } from 'node:perf_hooks';

export const startPdfMetrics = (req, _res, next) => {
  req.pdfMetrics = {
    startedAt: performance.now(),
    database_load_ms: 0,
    queue_wait_ms: 0,
    render_ms: 0,
    storage_ms: 0,
    database_update_ms: 0,
    audit_ms: 0
  };
  next();
};

export const measurePdfDatabaseLoad = async (req, loadOrder) => {
  const startedAt = performance.now();
  const order = await loadOrder();
  req.pdfMetrics.database_load_ms += performance.now() - startedAt;
  return order;
};

export const logPdfMetrics = (req, orderId, userId) => {
  const metrics = req.pdfMetrics ?? { startedAt: performance.now() };
  const round = (value) => Math.round(Number(value ?? 0) * 100) / 100;

  console.info(JSON.stringify({
    event: 'pdf_generation_completed',
    orderId,
    userId,
    database_load_ms: round(metrics.database_load_ms),
    queue_wait_ms: round(metrics.queue_wait_ms),
    render_ms: round(metrics.render_ms),
    storage_ms: round(metrics.storage_ms),
    database_update_ms: round(metrics.database_update_ms),
    audit_ms: round(metrics.audit_ms),
    total_ms: round(performance.now() - metrics.startedAt)
  }));
};
