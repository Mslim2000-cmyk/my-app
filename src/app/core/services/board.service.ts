import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { environment } from '@env/environment';
import {
  Board,
  BoardStats,
  BoardStatus,
  CommandHistory,
  CommandStatus,
  CreateBoardRequest,
  UpdateBoardRequest,
  AssignUserToBoardRequest
} from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService extends ApiService {
  private readonly boardsEndpoint = environment.endpoints.boards;

  constructor(http: HttpClient) {
    super(http);
  }

  /* ===================== BOARDS ===================== */

  getBoards(params?: { status?: string; search?: string }): Observable<Board[]> {
    if (environment.mockApi) {
      return of(this.getMockBoards());
    }

    return this.get<Board[]>(this.boardsEndpoint, params).pipe(
      catchError(() => of(this.getMockBoards()))
    );
  }

  getBoardById(id: string): Observable<Board> {
    if (environment.mockApi) {
      const board = this.getMockBoards().find(b => b.id === id);
      return of(board ?? this.getMockBoards()[0]);
    }

    return this.get<Board>(`${this.boardsEndpoint}/${id}`).pipe(
      catchError(() => of(this.getMockBoards()[0]))
    );
  }

  createBoard(request: CreateBoardRequest): Observable<Board> {
    if (environment.mockApi) {
      const board: Board = {
        ...request,
        id: `board-${Date.now()}`,
        tenantId: 'tenant-001',
        status: BoardStatus.OFFLINE,
        firmware: 'v1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return of(board);
    }

    return this.post<Board>(this.boardsEndpoint, request);
  }

  updateBoard(id: string, request: UpdateBoardRequest): Observable<Board> {
    if (environment.mockApi) {
      const board = this.getMockBoards().find(b => b.id === id);
      return of({ ...board!, ...request, updatedAt: new Date() });
    }

    return this.put<Board>(`${this.boardsEndpoint}/${id}`, request);
  }

  deleteBoard(_: string): Observable<void> {
    if (environment.mockApi) {
      return of(void 0);
    }

    return this.delete<void>(`${this.boardsEndpoint}/${_}`);
  }

  /* ===================== STATS ===================== */

  getBoardStats(): Observable<BoardStats> {
    return this.getBoards().pipe(
      map(boards => ({
        total: boards.length,
        online: boards.filter(b => b.status === BoardStatus.ONLINE).length,
        offline: boards.filter(b => b.status === BoardStatus.OFFLINE).length,
        maintenance: boards.filter(b => b.status === BoardStatus.MAINTENANCE).length,
        error: boards.filter(b => b.status === BoardStatus.ERROR).length
      }))
    );
  }

  /* ===================== USERS ===================== */

  assignUserToBoard(_: string, __: AssignUserToBoardRequest): Observable<void> {
    if (environment.mockApi) {
      return of(void 0);
    }

    return this.post<void>(`${this.boardsEndpoint}/${_}/users`, __);
  }

  removeUserFromBoard(boardId: string, userId: string): Observable<void> {
    if (environment.mockApi) {
      return of(void 0);
    }

    return this.delete<void>(`${this.boardsEndpoint}/${boardId}/users/${userId}`);
  }

  /* ===================== COMMANDS ===================== */

  getCommandHistory(boardId: string): Observable<CommandHistory[]> {
    if (environment.mockApi) {
      return of(this.getMockCommandHistory(boardId));
    }

    return this.get<CommandHistory[]>(`${this.boardsEndpoint}/${boardId}/commands`).pipe(
      catchError(() => of(this.getMockCommandHistory(boardId)))
    );
  }

  sendCommand(boardId: string, command: string, payload?: any): Observable<CommandHistory> {
    if (environment.mockApi) {
      return of({
        id: `cmd-${Date.now()}`,
        boardId,
        command,
        payload,
        status: CommandStatus.COMPLETED,
        executedBy: 'demo@user.com',
        executedAt: new Date(),
        completedAt: new Date()
      });
    }

    return this.post<CommandHistory>(`${this.boardsEndpoint}/${boardId}/commands`, {
      command,
      payload
    });
  }

  /* ===================== MOCK DATA ===================== */

  private getMockBoards(): Board[] {
    return [
      {
        id: 'board-001',
        name: 'Temperature Sensor Alpha',
        serialNumber: 'TSA-2024-001',
        tenantId: 'tenant-001',
        status: BoardStatus.ONLINE,
        type: 'temperature_sensor',
        firmware: 'v2.1.0',
        lastSeen: new Date(),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        metadata: {
          location: 'Building A - Floor 1',
          tags: ['production', 'critical']
        }
      },
      {
        id: 'board-002',
        name: 'Humidity Monitor Beta',
        serialNumber: 'HMB-2024-002',
        tenantId: 'tenant-001',
        status: BoardStatus.OFFLINE,
        type: 'humidity_sensor',
        firmware: 'v1.8.2',
        lastSeen: new Date(Date.now() - 86400000),
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date(),
        metadata: {
          location: 'Building A - Floor 2',
          tags: ['production']
        }
      },
      {
        id: 'board-003',
        name: 'Pressure Sensor Delta',
        serialNumber: 'PSD-2024-004',
        tenantId: 'tenant-001',
        status: BoardStatus.MAINTENANCE,
        type: 'pressure_sensor',
        firmware: 'v1.5.0',
        lastSeen: new Date(Date.now() - 3600000),
        createdAt: new Date('2024-04-05'),
        updatedAt: new Date(),
        metadata: {
          location: 'Building C - Basement',
          tags: ['maintenance']
        }
      }
    ];
  }

  private getMockCommandHistory(boardId: string): CommandHistory[] {
    return [
      {
        id: 'cmd-001',
        boardId,
        command: 'GET_STATUS',
        status: CommandStatus.COMPLETED,
        response: { status: 'healthy' },
        executedBy: 'admin@example.com',
        executedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3599000)
      },
      {
        id: 'cmd-002',
        boardId,
        command: 'RESTART',
        status: CommandStatus.FAILED,
        response: { error: 'Timeout' },
        executedBy: 'tech@example.com',
        executedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 7198000)
      }
    ];
  }
}
