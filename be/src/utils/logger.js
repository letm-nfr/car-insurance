import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

// Create a resource with service information
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'be-car-insurance',
  [ATTR_SERVICE_VERSION]: '1.0.0',
})

// Configure the OTLP exporter
// It automatically reads OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS
const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://128.85.32.98:4318/v1/logs',
})

// Create and configure the logger provider
const loggerProvider = new LoggerProvider({
  resource,
  processors: [new BatchLogRecordProcessor(logExporter)],
})

// Get a logger instance
const otelLogger = loggerProvider.getLogger('be-car-insurance', '1.0.0')

// Wrap logger methods to match common logging interface
const wrappedLogger = {
  debug: (message, meta = {}) => {
    otelLogger.emit({
      severityNumber: 5,
      severityText: 'DEBUG',
      body: message,
      attributes: meta,
    })
  },
  info: (message, meta = {}) => {
    otelLogger.emit({
      severityNumber: 9,
      severityText: 'INFO',
      body: message,
      attributes: meta,
    })
  },
  warn: (message, meta = {}) => {
    otelLogger.emit({
      severityNumber: 13,
      severityText: 'WARN',
      body: message,
      attributes: meta,
    })
  },
  error: (message, error, meta = {}) => {
    otelLogger.emit({
      severityNumber: 17,
      severityText: 'ERROR',
      body: message,
      attributes: {
        ...meta,
        error: error?.message || String(error),
        stack: error?.stack,
      },
    })
  },
}

// Enhanced logger with context
export const getContextualLogger = () => {
  return {
    debug: (message, data = {}) => wrappedLogger.debug(message, data),
    info: (message, data = {}) => wrappedLogger.info(message, data),
    warn: (message, data = {}) => wrappedLogger.warn(message, data),
    error: (message, error, data = {}) => wrappedLogger.error(message, error, data),
  }
}

// Structured logging for HTTP requests
export const logRequest = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    wrappedLogger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous',
    })
  })

  next()
}

// Structured logging for errors
export const logError = (error, context = {}) => {
  wrappedLogger.error('Application Error', error, {
    ...context,
    errorName: error.name,
  })
}

export const logger = wrappedLogger

export default wrappedLogger
