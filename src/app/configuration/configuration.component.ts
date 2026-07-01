import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PageHeaderComponent } from '@shared/components';
import { ConfigService } from '@core/services';
import { 
  TenantConfig, DataSchema, DataField, DataFieldType, 
  ProcessingRule, AlertRule, FeatureFlags,
  ConditionOperator, ConditionType, ActionType, AlertSeverity, NotificationChannel 
} from '@core/models';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTableModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    PageHeaderComponent
  ],
  template: `
    <div class="configuration-container">
      <app-page-header 
        title="Configuration" 
        subtitle="Manage your tenant settings, data schemas, processing rules, and alerts.">
      </app-page-header>

      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Loading configuration...</span>
      </div>

      <mat-tab-group *ngIf="!loading" class="config-tabs">
        <!-- Data Schema Tab -->
        <mat-tab label="Data Schema">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Data Fields</mat-card-title>
                <mat-card-subtitle>Define the structure of data your boards will send</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="fields-list">
                  <mat-expansion-panel *ngFor="let field of config?.dataSchema?.fields; let i = index">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-icon class="field-icon">{{ getFieldIcon(field.type) }}</mat-icon>
                        {{ field.name }}
                      </mat-panel-title>
                      <mat-panel-description>
                        {{ field.type }} 
                        <span *ngIf="field.required" class="required-badge">Required</span>
                      </mat-panel-description>
                    </mat-expansion-panel-header>
                    
                    <div class="field-details">
                      <div class="detail-row">
                        <span class="label">Description:</span>
                        <span>{{ field.description || 'No description' }}</span>
                      </div>
                      <div class="detail-row" *ngIf="field.unit">
                        <span class="label">Unit:</span>
                        <span>{{ field.unit }}</span>
                      </div>
                      <div class="detail-row" *ngIf="field.validation?.min !== undefined">
                        <span class="label">Min Value:</span>
                        <span>{{ field.validation?.min }}</span>
                      </div>
                      <div class="detail-row" *ngIf="field.validation?.max !== undefined">
                        <span class="label">Max Value:</span>
                        <span>{{ field.validation?.max }}</span>
                      </div>
                    </div>

                    <mat-action-row>
                      <button mat-button color="primary">
                        <mat-icon>edit</mat-icon> Edit
                      </button>
                      <button mat-button color="warn">
                        <mat-icon>delete</mat-icon> Delete
                      </button>
                    </mat-action-row>
                  </mat-expansion-panel>
                </div>

                <button mat-raised-button color="primary" class="add-btn">
                  <mat-icon>add</mat-icon> Add Field
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Processing Rules Tab -->
        <mat-tab label="Processing Rules">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Processing Rules</mat-card-title>
                <mat-card-subtitle>Define rules for processing incoming data</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="rules-list">
                  <mat-card *ngFor="let rule of config?.processingRules" class="rule-card" [class.disabled]="!rule.enabled">
                    <div class="rule-header">
                      <div class="rule-info">
                        <h4>{{ rule.name }}</h4>
                        <p>{{ rule.description }}</p>
                      </div>
                      <mat-slide-toggle 
                        [checked]="rule.enabled" 
                        (change)="toggleRule(rule)"
                        matTooltip="Enable/Disable rule">
                      </mat-slide-toggle>
                    </div>
                    
                    <mat-divider></mat-divider>
                    
                    <div class="rule-details">
                      <div class="conditions-section">
                        <span class="section-label">When:</span>
                        <div class="condition" *ngFor="let condition of rule.condition.conditions || [rule.condition]">
                          <mat-chip>{{ condition.field }} {{ getOperatorLabel(condition.operator) }} {{ condition.value }}</mat-chip>
                        </div>
                      </div>
                      
                      <div class="actions-section">
                        <span class="section-label">Then:</span>
                        <div class="action" *ngFor="let action of rule.actions">
                          <mat-chip color="primary" selected>{{ getActionLabel(action.type) }}</mat-chip>
                        </div>
                      </div>
                    </div>
                  </mat-card>
                </div>

                <button mat-raised-button color="primary" class="add-btn">
                  <mat-icon>add</mat-icon> Add Rule
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Alert Rules Tab -->
        <mat-tab label="Alert Rules">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Alert Rules</mat-card-title>
                <mat-card-subtitle>Configure alerts for specific conditions</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="alerts-list">
                  <mat-card *ngFor="let alert of config?.alertRules" class="alert-rule-card" [class.disabled]="!alert.enabled">
                    <div class="alert-header">
                      <div class="alert-info">
                        <mat-icon [class]="'severity-' + alert.severity">
                          {{ getSeverityIcon(alert.severity) }}
                        </mat-icon>
                        <div>
                          <h4>{{ alert.name }}</h4>
                          <p>{{ alert.description }}</p>
                        </div>
                      </div>
                      <mat-slide-toggle 
                        [checked]="alert.enabled" 
                        (change)="toggleAlert(alert)">
                      </mat-slide-toggle>
                    </div>
                    
                    <div class="alert-condition">
                      <span class="condition-text">
                        {{ alert.condition.field }} {{ getOperatorLabel(alert.condition.operator) }} {{ alert.condition.value }}
                      </span>
                    </div>
                    
                    <div class="alert-channels">
                      <span class="label">Notify via:</span>
                      <mat-chip-listbox>
                        <mat-chip *ngFor="let channel of alert.notification.channels">
                          {{ channel }}
                        </mat-chip>
                      </mat-chip-listbox>
                    </div>
                  </mat-card>
                </div>

                <button mat-raised-button color="primary" class="add-btn">
                  <mat-icon>add</mat-icon> Add Alert Rule
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Features Tab -->
        <mat-tab label="Features">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Feature Flags</mat-card-title>
                <mat-card-subtitle>Enable or disable platform features for your tenant</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="features-list" *ngIf="config?.features">
                  <div class="feature-item">
                    <div class="feature-info">
                      <mat-icon>analytics</mat-icon>
                      <div>
                        <h4>Real-time Analytics</h4>
                        <p>Enable real-time data analytics and dashboards</p>
                      </div>
                    </div>
                    <mat-slide-toggle 
                      [(ngModel)]="config!.features.realTimeProcessing"
                      (change)="saveFeatures()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="feature-item">
                    <div class="feature-info">
                      <mat-icon>history</mat-icon>
                      <div>
                        <h4>Historical Data</h4>
                        <p>Store and access historical device data</p>
                      </div>
                    </div>
                    <mat-slide-toggle 
                      [(ngModel)]="config!.features.dataRetention"
                      (change)="saveFeatures()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="feature-item">
                    <div class="feature-info">
                      <mat-icon>notifications</mat-icon>
                      <div>
                        <h4>Custom Alerts</h4>
                        <p>Create custom alert rules and notifications</p>
                      </div>
                    </div>
                    <mat-slide-toggle 
                      [(ngModel)]="config!.features.alerting"
                      (change)="saveFeatures()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="feature-item">
                    <div class="feature-info">
                      <mat-icon>api</mat-icon>
                      <div>
                        <h4>API Access</h4>
                        <p>Enable programmatic API access to your data</p>
                      </div>
                    </div>
                    <mat-slide-toggle 
                      [(ngModel)]="config!.features.apiAccess"
                      (change)="saveFeatures()">
                    </mat-slide-toggle>
                  </div>

                  <mat-divider></mat-divider>

                  <div class="feature-item">
                    <div class="feature-info">
                      <mat-icon>people</mat-icon>
                      <div>
                        <h4>Multi-user Access</h4>
                        <p>Allow multiple users to access your tenant</p>
                      </div>
                    </div>
                    <mat-slide-toggle 
                      [(ngModel)]="config!.features.multiUser"
                      (change)="saveFeatures()">
                    </mat-slide-toggle>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .configuration-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
      color: #666;
    }

    .config-tabs {
      background: white;
      border-radius: 12px;
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    mat-card {
      border-radius: 8px;
      margin-bottom: 16px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    .fields-list, .rules-list, .alerts-list {
      margin-bottom: 24px;
    }

    .field-icon {
      margin-right: 12px;
      color: #666;
    }

    .required-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-left: 8px;
    }

    .field-details {
      padding: 16px 0;
    }

    .detail-row {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;

      .label {
        font-weight: 500;
        min-width: 100px;
        color: #666;
      }
    }

    .rule-card, .alert-rule-card {
      padding: 16px;
      margin-bottom: 12px;

      &.disabled {
        opacity: 0.6;
      }
    }

    .rule-header, .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      h4 {
        margin: 0 0 4px 0;
        font-weight: 500;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #666;
      }
    }

    .alert-info {
      display: flex;
      gap: 12px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .severity-critical { color: #f44336; }
    .severity-warning { color: #ffc107; }
    .severity-info { color: #2196f3; }

    .rule-details {
      padding: 16px 0;
    }

    .conditions-section, .actions-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .section-label {
      font-weight: 500;
      color: #666;
      min-width: 60px;
    }

    .alert-condition {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 12px;
    }

    .condition-text {
      font-family: monospace;
      font-size: 13px;
    }

    .alert-channels {
      display: flex;
      align-items: center;
      gap: 12px;

      .label {
        font-weight: 500;
        color: #666;
      }
    }

    .features-list {
      max-width: 600px;
    }

    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;

      .feature-info {
        display: flex;
        gap: 16px;

        mat-icon {
          color: #666;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        h4 {
          margin: 0 0 4px 0;
          font-weight: 500;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
      }
    }

    .add-btn {
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class ConfigurationComponent implements OnInit {
  loading = true;
  config: TenantConfig | null = null;

  constructor(
    private configService: ConfigService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading = true;
    this.configService.getConfig().subscribe({
      next: (config) => {
        this.config = config;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load configuration', 'Close', { duration: 3000 });
      }
    });
  }

  getFieldIcon(type: DataFieldType): string {
    const icons: Record<DataFieldType, string> = {
      [DataFieldType.STRING]: 'text_fields',
      [DataFieldType.NUMBER]: 'pin',
      [DataFieldType.BOOLEAN]: 'check_circle',
      [DataFieldType.DATE]: 'event',
      [DataFieldType.ARRAY]: 'view_list',
      [DataFieldType.OBJECT]: 'data_object',
      [DataFieldType.CURRENT]: 'electric_bolt',
      [DataFieldType.TEMPERATURE]: 'thermostat',
      [DataFieldType.HUMIDITY]: 'water_drop',
      [DataFieldType.PRESSURE]: 'speed',
      [DataFieldType.VOLTAGE]: 'bolt',
      [DataFieldType.GPS]: 'location_on',
      [DataFieldType.CUSTOM]: 'settings'
    };
    return icons[type] ;
  }

  getOperatorLabel(operator?: ConditionOperator): string {
    if (!operator) return '=';
    const labels: Record<ConditionOperator, string> = {
      [ConditionOperator.EQUALS]: '=',
      [ConditionOperator.NOT_EQUALS]: '≠',
      [ConditionOperator.GREATER_THAN]: '>',
      [ConditionOperator.LESS_THAN]: '<',
      [ConditionOperator.GREATER_THAN_OR_EQUAL]: '≥',
      [ConditionOperator.LESS_THAN_OR_EQUAL]: '≤',
      [ConditionOperator.CONTAINS]: 'contains',
      [ConditionOperator.NOT_CONTAINS]: 'not contains',
      [ConditionOperator.STARTS_WITH]: 'starts with',
      [ConditionOperator.ENDS_WITH]: 'ends with',
      [ConditionOperator.IN]: 'in',
      [ConditionOperator.NOT_IN]: 'not in',
      [ConditionOperator.IS_NULL]: 'is null',
      [ConditionOperator.IS_NOT_NULL]: 'is not null'
    };
    return labels[operator] || '=';
  }

  getActionLabel(type: ActionType): string {
    const labels: Record<ActionType, string> = {
      [ActionType.TRANSFORM]: 'Transform',
      [ActionType.AGGREGATE]: 'Aggregate',
      [ActionType.FILTER]: 'Filter',
      [ActionType.FORWARD]: 'Forward',
      [ActionType.STORE]: 'Store',
      [ActionType.ENRICH]: 'Enrich',
      [ActionType.WEBHOOK]: 'Webhook',
      [ActionType.EMAIL]: 'Email',
      [ActionType.SMS]: 'SMS'
      
    };
    return labels[type] || type;
  }

  getSeverityIcon(severity: AlertSeverity): string {
    const icons: Record<AlertSeverity, string> = {
      [AlertSeverity.CRITICAL]: 'error',
      [AlertSeverity.WARNING]: 'warning',
      [AlertSeverity.ERROR]: 'report_problem',
      [AlertSeverity.INFO]: 'info'
    };
    return icons[severity] || 'info';
  }

  toggleRule(rule: ProcessingRule): void {
    rule.enabled = !rule.enabled;
    this.snackBar.open(`Rule ${rule.enabled ? 'enabled' : 'disabled'}`, 'Close', { duration: 2000 });
  }

  toggleAlert(alert: AlertRule): void {
    alert.enabled = !alert.enabled;
    this.snackBar.open(`Alert ${alert.enabled ? 'enabled' : 'disabled'}`, 'Close', { duration: 2000 });
  }

  saveFeatures(): void {
    if (!this.config?.features) return;
    
    this.configService.updateFeatures(this.config.features).subscribe({
      next: () => {
        this.snackBar.open('Features updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to update features', 'Close', { duration: 3000 });
      }
    });
  }
}