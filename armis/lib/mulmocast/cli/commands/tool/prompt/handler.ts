import { ToolCliArgs } from "../../../../types/cli_types.js";
import { selectTemplate } from "../../../../utils/inquirer.js";
import { dumpPromptFromTemplate } from "../../../../tools/dump_prompt.js";
import { setGraphAILogger } from "../../../../cli/helpers.js";

export const handler = async (argv: ToolCliArgs<{ template?: string }>) => {
  let { template } = argv;
  const { v: verbose } = argv;

  if (!template) {
    template = await selectTemplate();
  }

  setGraphAILogger(verbose, {
    template,
  });

  await dumpPromptFromTemplate({ templateName: template });
};
