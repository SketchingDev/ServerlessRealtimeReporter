import { Command } from "../Command";

export interface CreateTaskCommand extends Command {
  commandType: "create-task";
  id: string;
  name: string;
  processId: string;
  createdTimestamp: number;
}
