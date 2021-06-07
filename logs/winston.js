const winston = require("winston");

const logConfig = {
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [new.winston.transports.File({ filename: "./logger.log" })],
};

const logger = winston.createLogger(logConfig);

module.exports = logger;
