import logger from '../utils/logger.js';

const logRequestResponse = (req, res, next) => {
  const start = Date.now();
  logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.userId || null,
  });

  const oldJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - start;
    logger.info(`Response: ${req.method} ${req.originalUrl} (${duration}ms)`, {
      status: res.statusCode,
      response: data,
      errorSeverity: data?.errorSeverity || null,
    });
    return oldJson.apply(this, arguments);
  };

  next();
};

export default logRequestResponse; 