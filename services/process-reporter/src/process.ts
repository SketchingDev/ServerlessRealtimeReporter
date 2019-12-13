import { Task } from "./task";

export interface Process {
  id: string;
  name: string;
  timestamp: number;
  tasks: Task[];
}
