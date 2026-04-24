export interface TaskAdditionalInfo {
  priority?: string | null;
  estimatedEndDate?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
}
