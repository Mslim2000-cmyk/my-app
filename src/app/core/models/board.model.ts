import { User } from "./user.model";

// Board model interface
export interface Board {
  id: string;
  name: string;
  serialNumber: string;
  tenantId: string;
  status: BoardStatus;
  type: string;
  firmware?: string;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: BoardMetadata;
  users?: BoardUser[];
  commands?: CommandHistory[];
  assignedUsers?: User[];
  usageHistory?:User[];
}

export enum BoardStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error'
}

export interface BoardMetadata {
  location?: string;
  description?: string;
  tags?: string[];
  customFields?: { [key: string]: any };
}

export interface BoardUser {
  userId: string;
  email: string;
  name: string;
  role: string;
  assignedAt: Date;
}

export interface CommandHistory {
  id: string;
  boardId: string;
  command: string;
  payload?: any;
  status: CommandStatus;
  response?: any;
  executedBy: string;
  executedAt: Date;
  completedAt?: Date;
}

export enum CommandStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout'
}

export interface BoardStats {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  error: number;
}

export interface CreateBoardRequest {
  name: string;
  serialNumber: string;
  type: string;
  metadata?: BoardMetadata;
}

export interface UpdateBoardRequest {
  name?: string;
  type?: string;
  firmware?: string;
  metadata?: BoardMetadata;
}

export interface AssignUserToBoardRequest {
  userId: string;
  role: string;
}