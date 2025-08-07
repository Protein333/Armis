import { mulmoScriptSchema } from "../../../../types/schema.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GraphAILogger } from "graphai";
import { ToolCliArgs } from "../../../../types/cli_types.js";
import { setGraphAILogger } from "../../../../cli/helpers.js";

export const handler = async (argv: ToolCliArgs) => {
  const { v: verbose } = argv;
  setGraphAILogger(verbose);

  const defaultSchema = zodToJsonSchema(mulmoScriptSchema, {
    strictUnions: true,
  });
  GraphAILogger.info(JSON.stringify(defaultSchema, null, 2));
};
