export interface LoggedInUser {
  email: string
  accessToken?: string
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
