// tslint:disable-next-line:interface-name
export interface Process {
  id: string;
  name: string;
  timestamp: number;
  tasks: Task[];
}

// tslint:disable-next-line:interface-name
export interface Task {
  id: string;
  name: string;
  processId: string;
  created: string;
  updated: string;
  status: string;
  failureReason: string;
}
