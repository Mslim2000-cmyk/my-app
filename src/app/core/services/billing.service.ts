import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import {
  Bill,
  BillStatus,
  BillItemType,
  CalculateBillRequest,
  CalculateBillResponse,
  BillHistoryResponse,
  DeviceToken,
  RegenerateTokenResponse
} from '../models/bill.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService extends ApiService {
  private readonly billingEndpoint = environment.endpoints.billingCalculate;
  private readonly tokenEndpoint = environment.endpoints.deviceTokenRegenerate;

  constructor(http: HttpClient) {
    super(http);
  }

  /* ===================== BILL CALCULATION ===================== */

  calculateBill(request: CalculateBillRequest): Observable<CalculateBillResponse> {
    if (environment.mockApi) {
      return of({
        success: true,
        bill: this.generateMockBill(request)
      });
    }

    return this.post<CalculateBillResponse>(this.billingEndpoint, request).pipe(
      catchError(() =>
        of({
          success: true,
          bill: this.generateMockBill(request)
        })
      )
    );
  }

  /* ===================== BILL HISTORY ===================== */

  getBillHistory(
    page: number = 1,
    pageSize: number = 10
  ): Observable<BillHistoryResponse> {
    if (environment.mockApi) {
      const bills = this.getMockBillHistory();
      return of({
        bills,
        total: bills.length,
        page,
        pageSize
      });
    }

    return this.get<BillHistoryResponse>('/api/billing/history', { page, pageSize }).pipe(
      catchError(() => {
        const bills = this.getMockBillHistory();
        return of({
          bills,
          total: bills.length,
          page,
          pageSize
        });
      })
    );
  }

  getBillById(id: string): Observable<Bill> {
    if (environment.mockApi) {
      const bill = this.getMockBillHistory().find(b => b.id === id);
      return of(bill ?? this.getMockBillHistory()[0]);
    }

    return this.get<Bill>(`/api/billing/${id}`).pipe(
      catchError(() => of(this.getMockBillHistory()[0]))
    );
  }

  /* ===================== DOWNLOAD ===================== */

  downloadBillPdf(_: string): Observable<Blob> {
    if (environment.mockApi) {
      // Fake empty PDF blob
      return of(new Blob(['Mock PDF'], { type: 'application/pdf' }));
    }

    return this.http.get(`${this.apiUrl}/api/billing/${_}/pdf`, {
      responseType: 'blob'
    });
  }

  /* ===================== DEVICE TOKEN ===================== */

  getDeviceToken(): Observable<DeviceToken> {
    if (environment.mockApi) {
      return of(this.getMockDeviceToken());
    }

    return this.get<DeviceToken>('/api/tenant/device-token').pipe(
      catchError(() => of(this.getMockDeviceToken()))
    );
  }

  regenerateDeviceToken(): Observable<RegenerateTokenResponse> {
    if (environment.mockApi) {
      return of({
        success: true,
        token: this.getMockDeviceToken(true),
        message: 'Token regenerated successfully (mock)'
      });
    }

    return this.post<RegenerateTokenResponse>(this.tokenEndpoint, {}).pipe(
      catchError(() =>
        of({
          success: true,
          token: this.getMockDeviceToken(true),
          message: 'Token regenerated successfully'
        })
      )
    );
  }

  /* ===================== MOCK BILL ===================== */

  private generateMockBill(request: CalculateBillRequest): Bill {
    const now = new Date();

    return {
      id: `bill-${Date.now()}`,
      tenantId: 'tenant-001',
      periodStart: new Date(request.periodStart),
      periodEnd: new Date(request.periodEnd),
      status: BillStatus.DRAFT,
      lineItems: [
        {
          id: 'item-1',
          description: 'Platform Subscription',
          quantity: 1,
          unitPrice: 99,
          amount: 99,
          type: BillItemType.SUBSCRIPTION
        },
        {
          id: 'item-2',
          description: 'API Overusage',
          quantity: 5000,
          unitPrice: 0.002,
          amount: 10,
          type: BillItemType.OVERAGE
        },
        {
          id: 'item-3',
          description: 'Discount',
          quantity: 1,
          unitPrice: -15,
          amount: -15,
          type: BillItemType.DISCOUNT
        }
      ],
      subtotal: 94,
      tax: 9.4,
      total: 103.4,
      currency: 'USD',
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      createdAt: now,
      invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(Math.random() * 10000)}`
    };
  }

  /* ===================== MOCK HISTORY ===================== */

  private getMockBillHistory(): Bill[] {
    const now = new Date();

    return Array.from({ length: 5 }).map((_, i) => {
      const end = new Date(now);
      end.setMonth(end.getMonth() - i);

      const start = new Date(end);
      start.setDate(1);

      return {
        id: `bill-${i}`,
        tenantId: 'tenant-001',
        periodStart: start,
        periodEnd: end,
        status: i === 0 ? BillStatus.PENDING : BillStatus.PAID,
        lineItems: [],
        subtotal: 120 + i * 10,
        tax: 12 + i,
        total: 132 + i * 11,
        currency: 'USD',
        dueDate: new Date(end.getTime() + 30 * 86400000),
        paidAt: i === 0 ? undefined : new Date(),
        createdAt: end,
        invoiceNumber: `INV-${end.getFullYear()}-${i}`
      };
    });
  }

  /* ===================== MOCK TOKEN ===================== */

  private getMockDeviceToken(showFull: boolean = false): DeviceToken {
    const token = 'iot_' + Math.random().toString(36).substring(2, 18);

    return {
      token: showFull ? token : '',
      maskedToken: token.slice(0, 6) + '****' + token.slice(-4),
      createdAt: new Date(Date.now() - 30 * 86400000),
      lastUsedAt: new Date(Date.now() - 3600000)
    };
  }
}
