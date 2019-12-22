export interface Task {
  id: string;
  name: string;
  processId: string;
  // TODO Rename to createdTimestamp
  created: string;
  // TODO Rename to updatedTimestamp
  updated: string;
  status: string;
  failureReason: string;
}
