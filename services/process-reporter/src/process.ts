import { Task } from "./task";

export interface Process {
  id: string;
  name: string;
  createdTimestamp: number;
  tasks: Task[];
}
