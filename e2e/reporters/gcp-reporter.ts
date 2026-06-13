import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
// We use a try-catch for imports so it doesn't break local development if google-cloud is not installed
let MetricServiceClient: any;
try {
  const monitoring = require('@google-cloud/monitoring');
  MetricServiceClient = monitoring.MetricServiceClient;
} catch (e) {
  // Ignore in non-GCP environments
}

export default class GCPReporter implements Reporter {
  private client: any;
  private projectId: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'estrategia-365';
    if (MetricServiceClient && process.env.ENABLE_GCP_METRICS === 'true') {
      this.client = new MetricServiceClient();
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    // Only process tests tagged with @synthetic
    if (!test.title.includes('@synthetic')) return;

    const isSuccess = result.status === 'passed';
    const latencyMs = result.duration;

    // Extract a cleaner metric name from the title
    // E.g., "@synthetic [Login] User logs in" -> "login"
    let metricSuffix = 'unknown';
    const match = test.title.match(/\[(.*?)\]/);
    if (match && match[1]) {
      metricSuffix = match[1].toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    console.log(`[Synthetic] ${metricSuffix} | Success: ${isSuccess} | Latency: ${latencyMs}ms`);

    if (this.client) {
      await this.reportMetric(`custom.googleapis.com/synthetic/${metricSuffix}/success`, isSuccess ? 1 : 0);
      await this.reportMetric(`custom.googleapis.com/synthetic/${metricSuffix}/latency`, latencyMs);
    }
  }

  private async reportMetric(metricType: string, value: number) {
    const dataPoint = {
      interval: {
        endTime: {
          seconds: Date.now() / 1000,
        },
      },
      value: {
        doubleValue: value,
      },
    };

    const timeSeriesData = {
      metric: {
        type: metricType,
      },
      resource: {
        type: 'global',
        labels: {
          project_id: this.projectId,
        },
      },
      points: [dataPoint],
    };

    const request = {
      name: this.client.projectPath(this.projectId),
      timeSeries: [timeSeriesData],
    };

    try {
      await this.client.createTimeSeries(request);
      console.log(`Successfully reported metric: ${metricType} = ${value}`);
    } catch (error) {
      console.error(`Failed to report metric ${metricType}:`, error);
    }
  }
}
