import { Command } from "../Command";

export interface CreateProcessCommand extends Command {
  commandType: "create-process";
  /**
   * Unique identifier for referencing the process. To prevent duplication this should be idempotent.
   */
  id: string;
  name: string;
  timestamp: number;
}
