import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import {
  TenantConfig,
  DataSchema,
  DataField,
  DataFieldType,
  ProcessingRule,
  AlertRule,
  FeatureFlags,
  SaveConfigRequest,
  ConfigResponse,
  ConditionType,
  ConditionOperator,
  ActionType,
  AlertSeverity,
  NotificationChannel,
  Alert
} from '../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService extends ApiService {
  private readonly configEndpoint = environment.endpoints.config;

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get tenant configuration
   */
  getConfig(): Observable<TenantConfig> {
    return this.get<TenantConfig>(this.configEndpoint).pipe(
      catchError(() => {
        console.warn('Using mock config data');
        return of(this.getMockConfig());
      })
    );
  }

  /**
   * Save tenant configuration
   */
  saveConfig(config: SaveConfigRequest): Observable<ConfigResponse> {
    return this.post<ConfigResponse>(this.configEndpoint, config).pipe(
      catchError(() => {
        console.warn('Config save API not available - mock response');
        return of({
          success: true,
          message: 'Configuration saved successfully (mock)',
          config: this.getMockConfig()
        });
      })
    );
  }

  /**
   * Update data schema
   */
  updateDataSchema(schema: DataSchema): Observable<ConfigResponse> {
    return this.saveConfig({ dataSchema: schema });
  }

  /**
   * Update processing rules
   */
  updateProcessingRules(rules: ProcessingRule[]): Observable<ConfigResponse> {
    return this.saveConfig({ processingRules: rules });
  }

  /**
   * Update alert rules
   */
  updateAlertRules(rules: AlertRule[]): Observable<ConfigResponse> {
    return this.saveConfig({ alertRules: rules });
  }

  /**
   * Update feature flags
   */
  updateFeatures(features: FeatureFlags): Observable<ConfigResponse> {
    return this.saveConfig({ features });
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): Observable<Alert[]> {
    return this.get<Alert[]>(`${this.configEndpoint}/alerts`, { limit }).pipe(
      catchError(() => of(this.getMockAlerts()))
    );
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): Observable<Alert> {
    return this.patch<Alert>(`${this.configEndpoint}/alerts/${alertId}/acknowledge`, {});
  }

  /**
   * Get available data field types
   */
  getFieldTypes(): DataFieldType[] {
    return Object.values(DataFieldType);
  }

  /**
   * Get available condition operators
   */
  getConditionOperators(): ConditionOperator[] {
    return Object.values(ConditionOperator);
  }

  /**
   * Get available action types
   */
  getActionTypes(): ActionType[] {
    return Object.values(ActionType);
  }

  /**
   * Get available alert severities
   */
  getAlertSeverities(): AlertSeverity[] {
    return Object.values(AlertSeverity);
  }

  /**
   * Get available notification channels
   */
  getNotificationChannels(): NotificationChannel[] {
    return Object.values(NotificationChannel);
  }

  /**
   * Create a new empty data field
   */
  createEmptyField(order: number): DataField {
    return {
      id: `field-${Date.now()}`,
      name: '',
      type: DataFieldType.STRING,
      required: false,
      order
    };
  }

  /**
   * Create a new empty processing rule
   */
  createEmptyProcessingRule(): ProcessingRule {
    return {
      id: `rule-${Date.now()}`,
      name: '',
      enabled: true,
      priority: 1,
      condition: {
        type: ConditionType.SIMPLE,
        field: '',
        operator: ConditionOperator.EQUALS,
        value: ''
      },
      actions: []
    };
  }

  /**
   * Create a new empty alert rule
   */
  createEmptyAlertRule(): AlertRule {
    return {
      id: `alert-${Date.now()}`,
      name: '',
      enabled: true,
      severity: AlertSeverity.WARNING,
      condition: {
        type: ConditionType.SIMPLE,
        field: '',
        operator: ConditionOperator.GREATER_THAN,
        value: 0
      },
      notification: {
        channels: [NotificationChannel.EMAIL]
      },
      cooldown: 300
    };
  }

  /**
   * Mock configuration data
   */
  private getMockConfig(): TenantConfig {
    return {
      id: 'config-001',
      tenantId: 'tenant-001',
      dataSchema: {
        fields: [
          {
            id: 'field-001',
            name: 'temperature',
            type: DataFieldType.TEMPERATURE,
            required: true,
            unit: '°C',
            description: 'Temperature reading from sensor',
            validation: { min: -50, max: 100 },
            order: 1
          },
          {
            id: 'field-002',
            name: 'humidity',
            type: DataFieldType.HUMIDITY,
            required: true,
            unit: '%',
            description: 'Relative humidity percentage',
            validation: { min: 0, max: 100 },
            order: 2
          },
          {
            id: 'field-003',
            name: 'pressure',
            type: DataFieldType.PRESSURE,
            required: false,
            unit: 'hPa',
            description: 'Atmospheric pressure',
            validation: { min: 800, max: 1200 },
            order: 3
          },
          {
            id: 'field-004',
            name: 'deviceId',
            type: DataFieldType.STRING,
            required: true,
            description: 'Unique device identifier',
            validation: { minLength: 8, maxLength: 32 },
            order: 4
          },
          {
            id: 'field-005',
            name: 'timestamp',
            type: DataFieldType.DATE,
            required: true,
            description: 'Reading timestamp',
            order: 5
          }
        ],
        version: '1.0.0'
      },
      processingRules: [
        {
          id: 'proc-001',
          name: 'Temperature Unit Conversion',
          description: 'Convert Fahrenheit to Celsius',
          enabled: true,
          priority: 1,
          condition: {
            type: ConditionType.SIMPLE,
            field: 'temperatureUnit',
            operator: ConditionOperator.EQUALS,
            value: 'F'
          },
          actions: [
            {
              type: ActionType.TRANSFORM,
              config: {
                field: 'temperature',
                formula: '(value - 32) * 5/9'
              }
            }
          ]
        },
        {
          id: 'proc-002',
          name: 'Data Enrichment',
          description: 'Add location data based on device ID',
          enabled: true,
          priority: 2,
          condition: {
            type: ConditionType.SIMPLE,
            field: 'deviceId',
            operator: ConditionOperator.IS_NOT_NULL
          },
          actions: [
            {
              type: ActionType.ENRICH,
              config: {
                lookupTable: 'devices',
                keyField: 'deviceId',
                outputFields: ['location', 'zone']
              }
            }
          ]
        }
      ],
      alertRules: [
        {
          id: 'alert-001',
          name: 'High Temperature Alert',
          description: 'Alert when temperature exceeds threshold',
          enabled: true,
          severity: AlertSeverity.WARNING,
          condition: {
            type: ConditionType.SIMPLE,
            field: 'temperature',
            operator: ConditionOperator.GREATER_THAN,
            value: 35
          },
          notification: {
            channels: [NotificationChannel.EMAIL, NotificationChannel.PUSH],
            template: 'high-temp-alert',
            recipients: ['admin@example.com']
          },
          cooldown: 300,
          threshold: {
            count: 3,
            window: 600
          }
        },
        {
          id: 'alert-002',
          name: 'Critical Temperature Alert',
          description: 'Critical alert for extreme temperatures',
          enabled: true,
          severity: AlertSeverity.CRITICAL,
          condition: {
            type: ConditionType.SIMPLE,
            field: 'temperature',
            operator: ConditionOperator.GREATER_THAN,
            value: 45
          },
          notification: {
            channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.PUSH],
            template: 'critical-temp-alert',
            recipients: ['admin@example.com', 'oncall@example.com']
          },
          cooldown: 60
        },
        {
          id: 'alert-003',
          name: 'Humidity Out of Range',
          description: 'Alert for abnormal humidity levels',
          enabled: true,
          severity: AlertSeverity.INFO,
          condition: {
            type: ConditionType.OR,
            conditions: [
              {
                type: ConditionType.SIMPLE,
                field: 'humidity',
                operator: ConditionOperator.LESS_THAN,
                value: 20
              },
              {
                type: ConditionType.SIMPLE,
                field: 'humidity',
                operator: ConditionOperator.GREATER_THAN,
                value: 80
              }
            ]
          },
          notification: {
            channels: [NotificationChannel.EMAIL]
          },
          cooldown: 600
        }
      ],
      features: {
        realTimeProcessing: true,
        dataRetention: true,
        dataRetentionDays: 90,
        alerting: true,
        webhooks: true,
        apiAccess: true,
        customDashboards: true,
        multiUser: true,
        maxUsers: 10,
        maxBoards: 20,
        maxDataPoints: 1000000,
        advancedAnalytics: false,
        exportData: true,
        auditLog: true
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    };
  }

  /**
   * Mock alerts data
   */
  private getMockAlerts(): Alert[] {
    return [
      {
        id: 'instance-001',
        ruleId: 'alert-001',
        ruleName: 'High Temperature Alert',
        severity: AlertSeverity.WARNING,
        message: 'Temperature reading of 38°C exceeded threshold of 35°C',
        boardId: 'board-001',
        boardName: 'Temperature Sensor Alpha',
        data: { temperature: 38, threshold: 35 },
        acknowledged: false,
        createdAt: new Date(Date.now() - 1800000)
      },
      {
        id: 'instance-002',
        ruleId: 'alert-002',
        ruleName: 'Critical Temperature Alert',
        severity: AlertSeverity.CRITICAL,
        message: 'CRITICAL: Temperature reading of 48°C exceeded critical threshold',
        boardId: 'board-002',
        boardName: 'Humidity Monitor Beta',
        data: { temperature: 48, threshold: 45 },
        acknowledged: true,
        acknowledgedBy: 'admin@example.com',
        acknowledgedAt: new Date(Date.now() - 3000000),
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'instance-003',
        ruleId: 'alert-003',
        ruleName: 'Humidity Out of Range',
        severity: AlertSeverity.INFO,
        message: 'Humidity level of 15% is below minimum threshold',
        boardId: 'board-003',
        boardName: 'Motion Detector Gamma',
        data: { humidity: 15, minThreshold: 20 },
        acknowledged: false,
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        id: 'instance-004',
        ruleId: 'alert-001',
        ruleName: 'High Temperature Alert',
        severity: AlertSeverity.WARNING,
        message: 'Temperature reading of 36°C exceeded threshold',
        boardId: 'board-001',
        boardName: 'Temperature Sensor Alpha',
        data: { temperature: 36, threshold: 35 },
        acknowledged: true,
        acknowledgedBy: 'manager@example.com',
        acknowledgedAt: new Date(Date.now() - 80000000),
        createdAt: new Date(Date.now() - 86400000),
        resolvedAt: new Date(Date.now() - 82800000)
      }
    ];
  }
}