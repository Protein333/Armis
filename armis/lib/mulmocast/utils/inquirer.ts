import inquirer from "inquirer";
import { getAvailablePromptTemplates } from "./file.js";

export const selectTemplate = async (): Promise<string> => {
  const availableTemplates = getAvailablePromptTemplates();
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "templateName",
      message: "Select a template to use",
      choices: availableTemplates.map((t) => ({
        name: `${t.filename} - ${t.description}`,
        value: t.filename,
      })),
    },
  ]);
  return answers.templateName;
};

export const getUrlsIfNeeded = async (urls: string[]): Promise<string[]> => {
  if (urls && urls.length > 0) return urls;
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "urls",
      message: "Enter URLs for scripting references (comma separated):",
      validate: (input: string) => input.trim().length > 0 || "At least one URL is required",
    },
  ]);
  return answers.urls
    .split(",")
    .map((u: string) => u.trim())
    .filter((u: string) => u.length > 0);
};
