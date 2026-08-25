// API 类型定义 - 供前后端共用（后端 route.ts 产出，前端可直接引用）

// 项目数据结构定义
export interface Project {
  id: number;
  name: string;
  description: string;
  url?: string;
  github?: string;
  writeStatus: string;
}

// 健康检查成功时的服务状态
export interface ServiceStatusOk {
  online: boolean;
  status: string; // up | redirect | client_error | server_error | unknown
  statusCode: number;
  responseTime: number;
  checkedAt: string; // ISO 时间
}

// 服务不可用（down）时的服务状态，网络失败时可附带错误信息
export interface ServiceStatusDown {
  online: false;
  status: 'down';
  statusCode: null;
  responseTime: null;
  checkedAt: string; // ISO 时间
  errorText?: string;
}

// 服务状态联合类型
export type ServiceStatus = ServiceStatusOk | ServiceStatusDown;

// 项目 + 实时服务状态
export interface ProjectWithStatus extends Project {
  serviceStatus: ServiceStatus;
}

// 服务汇总信息
export interface ServiceSummary {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  online: number;
  offline: number;
  total: number;
  healthPercentage: number;
}

// GET /api/projects 成功返回结构
export interface ProjectsApiResponse {
  projects: ProjectWithStatus[];
  total: number;
  timestamp: string; // ISO 时间
  serviceSummary: ServiceSummary;
}

// GET /api/projects 失败（500）返回结构
export interface ProjectsApiErrorResponse {
  error: string;
  message: string;
}
