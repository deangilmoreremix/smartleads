import { supabase } from './supabase';

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum LogCategory {
  EMAIL_VERIFICATION = 'email_verification',
  EMAIL_SENDING = 'email_sending',
  SEQUENCE_PROCESSING = 'sequence_processing',
  LEAD_DEDUPLICATION = 'lead_deduplication',
  WEBHOOK = 'webhook',
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  API = 'api',
}

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: Record<string, any>;
  userId?: string;
  campaignId?: string;
  leadId?: string;
  error?: Error;
}

export class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private readonly bufferSize = 100;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.startAutoFlush();
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  public log(entry: LogEntry): void {
    // Console logging for development
    const consoleMethod = entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL
      ? console.error
      : entry.level === LogLevel.WARNING
      ? console.warn
      : console.log;

    consoleMethod(
      `[${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}`,
      entry.details || '',
      entry.error || ''
    );

    // Add to buffer for batch insertion
    this.logBuffer.push(entry);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  public info(
    category: LogCategory,
    message: string,
    details?: Record<string, any>,
    metadata?: { userId?: string; campaignId?: string; leadId?: string }
  ): void {
    this.log({
      level: LogLevel.INFO,
      category,
      message,
      details,
      ...metadata,
    });
  }

  public warning(
    category: LogCategory,
    message: string,
    details?: Record<string, any>,
    metadata?: { userId?: string; campaignId?: string; leadId?: string }
  ): void {
    this.log({
      level: LogLevel.WARNING,
      category,
      message,
      details,
      ...metadata,
    });
  }

  public error(
    category: LogCategory,
    message: string,
    error?: Error,
    details?: Record<string, any>,
    metadata?: { userId?: string; campaignId?: string; leadId?: string }
  ): void {
    this.log({
      level: LogLevel.ERROR,
      category,
      message,
      error,
      details,
      ...metadata,
    });
  }

  public critical(
    category: LogCategory,
    message: string,
    error?: Error,
    details?: Record<string, any>,
    metadata?: { userId?: string; campaignId?: string; leadId?: string }
  ): void {
    this.log({
      level: LogLevel.CRITICAL,
      category,
      message,
      error,
      details,
      ...metadata,
    });

    // Immediately flush critical errors
    this.flush();
  }

  private async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Store critical errors and warnings in the database
      const logsToStore = logsToSend.filter(
        (log) =>
          log.level === LogLevel.CRITICAL ||
          log.level === LogLevel.ERROR ||
          log.level === LogLevel.WARNING
      );

      if (logsToStore.length > 0) {
        const logRecords = logsToStore.map((log) => ({
          user_id: log.userId || null,
          campaign_id: log.campaignId || null,
          lead_id: log.leadId || null,
          log_level: log.level,
          category: log.category,
          message: log.message,
          details: log.details || {},
          error_message: log.error?.message || null,
          error_stack: log.error?.stack || null,
        }));

        const { error } = await supabase.from('system_logs').insert(logRecords);

        if (error) {
          console.error('Failed to insert logs to database:', error);
          // Don't put logs back to avoid infinite loop
        }
      }
    } catch (err) {
      console.error('Failed to flush logs:', err);
      // Don't put logs back to avoid infinite loop if database is having issues
    }
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const logger = Logger.getInstance();

export interface MetricValue {
  count?: number;
  value?: number;
  tags?: Record<string, string>;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, MetricValue> = new Map();

  private constructor() {}

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  public increment(metricName: string, value: number = 1, tags?: Record<string, string>): void {
    const existing = this.metrics.get(metricName) || { count: 0 };
    existing.count = (existing.count || 0) + value;
    if (tags) {
      existing.tags = { ...existing.tags, ...tags };
    }
    this.metrics.set(metricName, existing);
  }

  public gauge(metricName: string, value: number, tags?: Record<string, string>): void {
    this.metrics.set(metricName, { value, tags });
  }

  public getMetric(metricName: string): MetricValue | undefined {
    return this.metrics.get(metricName);
  }

  public getAllMetrics(): Map<string, MetricValue> {
    return new Map(this.metrics);
  }

  public reset(): void {
    this.metrics.clear();
  }
}

export const metrics = MetricsCollector.getInstance();

export async function trackEmailVerification(
  status: 'success' | 'failed',
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  metrics.increment(`email_verification.${status}`, 1, { userId });

  if (status === 'failed') {
    logger.warning(
      LogCategory.EMAIL_VERIFICATION,
      'Email verification failed',
      details,
      { userId }
    );
  }
}

export async function trackSequenceProcessing(
  processed: number,
  successful: number,
  failed: number,
  userId: string
): Promise<void> {
  metrics.increment('sequence.processed', processed, { userId });
  metrics.increment('sequence.successful', successful, { userId });
  metrics.increment('sequence.failed', failed, { userId });

  if (failed > 0) {
    logger.warning(
      LogCategory.SEQUENCE_PROCESSING,
      `Sequence processing completed with ${failed} failures`,
      { processed, successful, failed },
      { userId }
    );
  }
}

export async function trackEmailSending(
  status: 'queued' | 'sent' | 'failed' | 'bounced',
  userId: string,
  campaignId: string,
  leadId?: string
): Promise<void> {
  metrics.increment(`email.${status}`, 1, { userId, campaignId });

  if (status === 'failed' || status === 'bounced') {
    logger.error(
      LogCategory.EMAIL_SENDING,
      `Email ${status}`,
      undefined,
      { status },
      { userId, campaignId, leadId }
    );
  }
}
