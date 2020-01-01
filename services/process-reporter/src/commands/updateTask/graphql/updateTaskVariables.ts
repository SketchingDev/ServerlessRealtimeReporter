export interface UpdateTaskVariables {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILURE";
  updated: number;
  failureReason: string;
}
