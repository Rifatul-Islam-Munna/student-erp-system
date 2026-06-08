export interface WorkflowRuleCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value?: any;
}

export interface WorkflowRuleAction {
  type: "notification" | "email" | "webhook" | "update_field" | "create_task" | "assign_to";
  config: Record<string, any>;
}

export interface WorkflowRule {
  _id?: string;
  name: string;
  trigger: "on_create" | "on_update" | "on_delete" | "on_status_change" | "scheduled";
  triggerEntity?: string;
  conditions: WorkflowRuleCondition[];
  actions: WorkflowRuleAction[];
  isActive: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowRuleQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}