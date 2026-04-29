import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { logs } from '@opentelemetry/api-logs'
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'

let sdk = null
let loggerProvider = null

try {
  // Create resource
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'be-car-insurance',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  })

  // Configure and initialize logger provider
  const logExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://128.85.32.98:4318/v1/logs',
  })

  loggerProvider = new LoggerProvider({
    resource,
    processors: [new BatchLogRecordProcessor(logExporter)],
  })

  logs.setGlobalLoggerProvider(loggerProvider)

  // Configure trace exporter
  const traceExporterOptions = {
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://128.85.32.98:4318/v1/traces'
  }

  const traceExporter = new OTLPTraceExporter(traceExporterOptions)

  // Initialize SDK with traces
  sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource,
  })

  sdk.start()
  console.log('✓ OpenTelemetry SDK initialized')
  console.log(`  Endpoint: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://128.85.32.98:4318'}`)
} catch (error) {
  console.warn('⚠️  OpenTelemetry initialization failed:', error.message)
  console.warn('App will continue without tracing')
  sdk = null
}

// Graceful shutdown for SDK if it initialized
if (sdk) {
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('✓ OpenTelemetry SDK shut down'))
      .catch((err) => console.error('Error shutting down OpenTelemetry:', err))
      .finally(() => process.exit(0))
  })

  process.on('SIGINT', () => {
    sdk
      .shutdown()
      .then(() => console.log('✓ OpenTelemetry SDK shut down'))
      .catch((err) => console.error('Error shutting down OpenTelemetry:', err))
      .finally(() => process.exit(0))
  })
}

export { sdk }

