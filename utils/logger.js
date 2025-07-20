import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Custom log levels and colors
const customLevels = {
  levels: {
    critical: 0,
    high: 1,
    warn: 2,
    medium: 3,
    info: 4,
    low: 5,
    verbose: 6,
    debug: 7,
  },
  colors: {
    critical: 'red',
    high: 'magenta',
    warn: 'yellow',
    medium: 'cyan',
    info: 'blue',
    low: 'green',
    verbose: 'gray',
    debug: 'white',
  },
};
winston.addColors(customLevels.colors);

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'app.log') }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      ),
    }),
  ],
});

export default logger; 