import { Command } from "../Command";

export interface UpdateTaskCommand extends Command {
  commandType: "update-task";
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  updatedTimestamp: number;
  failureReason: string;
}
