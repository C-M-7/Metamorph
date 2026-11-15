export interface LoggedInUser {
  email: string
  role?: "ADMIN" | "USER" | string
  accessToken?: string
}

export interface AdminUserItem {
  id: number
  email: string
  role: "ADMIN" | "USER" | string
  createdAt?: string
}

export interface AppConfigurationItem {
  id: number
  identifier: string
  config: any
  disabled: boolean
}

export interface AppConfigurationRequest {
  identifier: string
  config: any
  disabled?: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export type JobStatusType = "COMPLETED" | "PROCESSING" | "FAILED"

export interface TransformationItem {
  id: string
  name: string
  sourceType: string
  targetType: string
  status: JobStatusType
  timestamp: string
  size: string
  duration?: string
  downloadUrl?: string
}
