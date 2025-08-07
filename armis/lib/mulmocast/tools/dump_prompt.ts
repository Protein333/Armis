import { GraphAILogger } from "graphai";
import { readTemplatePrompt } from "../utils/file.js";
import clipboardy from "clipboardy";

export const dumpPromptFromTemplate = async ({ templateName }: { templateName: string }) => {
  const prompt = readTemplatePrompt(templateName);
  GraphAILogger.info(prompt);
  clipboardy.write(prompt);
};
