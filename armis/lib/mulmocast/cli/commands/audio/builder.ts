import type { Argv } from "yargs";
import { commonOptions } from "../../common.js";

export const builder = (yargs: Argv) =>
  commonOptions(yargs).option("a", {
    alias: "audiodir",
    describe: "Audio output directory",
    type: "string",
  });
