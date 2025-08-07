import { TransactionLog } from "graphai";
import ora from "ora";

const spinner = ora();
spinner.prefixText = "\n";

export const cliLoadingPlugin =
  ({ nodeId, message }: { nodeId: string; message: string }) =>
  (log: TransactionLog) => {
    if (log.nodeId === nodeId && log.state === "queued") {
      spinner.start(message);
    }
    if (log.nodeId === nodeId && log.state === "completed") {
      spinner.stop();
    }
  };
