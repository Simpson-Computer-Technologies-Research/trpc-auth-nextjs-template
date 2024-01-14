export interface Response {
  result: any;
  success: boolean;
  message: string;
  timestamp: number;
  id: string;
}

export enum Status {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum Permission {
  DEFAULT = "default",
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  ADMIN = "admin",
}
