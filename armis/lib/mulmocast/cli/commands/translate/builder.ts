import type { Argv } from "yargs";
import { commonOptions } from "../../common.js";

export const builder = (yargs: Argv) =>
  commonOptions(yargs).positional("file", {
    describe: "Mulmo Script File",
    type: "string",
  });
