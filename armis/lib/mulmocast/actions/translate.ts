import "dotenv/config";
import { GraphAI, assert, isNull } from "graphai";
import type { GraphData, AgentFilterFunction, DefaultParamsType, DefaultResultData, CallbackFunction } from "graphai";
import * as agents from "@graphai/vanilla";
import { openAIAgent } from "@graphai/openai_agent";
import { fileWriteAgent } from "@graphai/vanilla_node_agents";
import { createHash } from "crypto";

import { recursiveSplitJa } from "../utils/string.js";
import { settings2GraphAIConfig } from "../utils/utils.js";
import { LANG, LocalizedText, MulmoStudioContext, MulmoBeat, MulmoStudioMultiLingualData, MulmoStudioMultiLingual, MultiLingualTexts } from "../types/index.js";
import { getOutputMultilingualFilePath, mkdir, writingMessage } from "../utils/file.js";
import { translateSystemPrompt, translatePrompts } from "../utils/prompt.js";
import { MulmoStudioContextMethods } from "../methods/mulmo_studio_context.js";

const vanillaAgents = agents.default ?? agents;

const hashSHA256 = (text: string) => {
  return createHash("sha256").update(text, "utf8").digest("hex");
};
// 1. translateGraph / map each beats.
// 2. beatGraph / map each target lang.
// 3. translateTextGraph / translate text.

export const translateTextGraph = {
  version: 0.5,
  nodes: {
    localizedText: {
      inputs: {
        targetLang: ":targetLang", // for cache
        beat: ":beat", // for cache
        multiLingual: ":multiLingual", // for cache
        lang: ":lang", // for cache
        beatIndex: ":beatIndex", // for cache (state)
        mulmoContext: ":context", // for cache (state)
        system: translateSystemPrompt,
        prompt: translatePrompts,
      },
      passThrough: {
        lang: ":targetLang",
      },
      output: {
        text: ".text",
      },
      // return { lang, text } <- localizedText
      agent: "openAIAgent",
    },
    splitText: {
      agent: (namedInputs: { localizedText: LocalizedText; targetLang: LANG }) => {
        const { localizedText, targetLang } = namedInputs;
        // Cache
        if (localizedText.texts) {
          return localizedText.texts;
        }
        if (targetLang === "ja") {
          return recursiveSplitJa(localizedText.text);
        }
        // not split
        return [localizedText.text];
      },
      inputs: {
        targetLang: ":targetLang",
        localizedText: ":localizedText",
      },
    },
    textTranslateResult: {
      isResult: true,
      agent: "copyAgent",
      inputs: {
        lang: ":targetLang",
        text: ":localizedText.text",
        texts: ":splitText",
        ttsTexts: ":splitText",
        cacheKey: ":multiLingual.cacheKey",
      },
    },
  },
};

const beatGraph = {
  version: 0.5,
  nodes: {
    targetLangs: {},
    context: {},
    beat: {},
    // for cache
    multiLingual: {
      agent: (namedInputs: { text?: string; multiLinguals?: MulmoStudioMultiLingualData[]; beatIndex: number }) => {
        const { multiLinguals, beatIndex, text } = namedInputs;
        const cacheKey = hashSHA256(text ?? "");
        if (!multiLinguals?.[beatIndex]) {
          return { cacheKey, multiLingualTexts: {} };
        }
        return {
          multiLingualTexts: Object.keys(multiLinguals?.[beatIndex].multiLingualTexts).reduce((tmp: MultiLingualTexts, lang) => {
            if (multiLinguals?.[beatIndex].multiLingualTexts[lang].cacheKey === cacheKey) {
              tmp[lang] = multiLinguals?.[beatIndex].multiLingualTexts[lang];
            }
            return tmp;
          }, {}),
          cacheKey,
        };
      },
      inputs: {
        text: ":beat.text",
        beatIndex: ":__mapIndex",
        multiLinguals: ":context.multiLingual",
      },
    },
    preprocessMultiLingual: {
      agent: "mapAgent",
      inputs: {
        beat: ":beat",
        multiLingual: ":multiLingual",
        rows: ":targetLangs",
        lang: ":context.studio.script.lang",
        context: ":context",
        beatIndex: ":__mapIndex",
      },
      params: {
        compositeResult: true,
        rowKey: "targetLang",
      },
      graph: translateTextGraph,
    },
    mergeLocalizedText: {
      // console: { after: true},
      agent: "arrayToObjectAgent",
      inputs: {
        items: ":preprocessMultiLingual.textTranslateResult",
      },
      params: {
        key: "lang",
      },
    },
    multiLingualTexts: {
      agent: "mergeObjectAgent",
      inputs: {
        items: [":multiLingual.multiLingualTexts", ":mergeLocalizedText"],
      },
    },
    mergeMultiLingualData: {
      isResult: true,
      // console: { after: true},
      agent: "mergeObjectAgent",
      inputs: {
        items: [":multiLingual", { multiLingualTexts: ":multiLingualTexts" }],
      },
    },
  },
};

const translateGraph: GraphData = {
  version: 0.5,
  nodes: {
    context: {},
    outDirPath: {},
    outputMultilingualFilePath: {},
    targetLangs: {},
    mergeStudioResult: {
      isResult: true,
      agent: "mergeObjectAgent",
      inputs: {
        items: [{ multiLingual: ":beatsMap.mergeMultiLingualData" }],
      },
    },
    beatsMap: {
      agent: "mapAgent",
      inputs: {
        targetLangs: ":targetLangs",
        context: ":context",
        rows: ":context.studio.script.beats",
      },
      params: {
        rowKey: "beat",
        compositeResult: true,
      },
      graph: beatGraph,
    },
    writeOutput: {
      // console: { before: true },
      agent: "fileWriteAgent",
      inputs: {
        file: ":outputMultilingualFilePath",
        text: ":mergeStudioResult.multiLingual.toJSON()",
      },
    },
  },
};

const localizedTextCacheAgentFilter: AgentFilterFunction<
  DefaultParamsType,
  DefaultResultData,
  { mulmoContext: MulmoStudioContext; targetLang: LANG; beat: MulmoBeat; beatIndex: number; multiLingual: MulmoStudioMultiLingualData; lang: LANG }
> = async (context, next) => {
  const { namedInputs } = context;
  const { mulmoContext, targetLang, beat, beatIndex, lang, multiLingual } = namedInputs;

  if (!beat.text) {
    return { text: "" };
  }

  // same language
  if (targetLang === lang) {
    return { text: beat.text };
  }

  // The original text is unchanged and the target language text is present
  if (multiLingual.cacheKey === multiLingual.multiLingualTexts[targetLang]?.cacheKey) {
    return { text: multiLingual.multiLingualTexts[targetLang].text };
  }
  try {
    MulmoStudioContextMethods.setBeatSessionState(mulmoContext, "multiLingual", beatIndex, true);
    return await next(context);
  } finally {
    MulmoStudioContextMethods.setBeatSessionState(mulmoContext, "multiLingual", beatIndex, false);
  }
};
const agentFilters = [
  {
    name: "localizedTextCacheAgentFilter",
    agent: localizedTextCacheAgentFilter as AgentFilterFunction,
    nodeIds: ["localizedText"],
  },
];

export const translate = async (
  context: MulmoStudioContext,
  args?: {
    callbacks?: CallbackFunction[];
    settings?: Record<string, string>;
  },
) => {
  const { settings, callbacks } = args ?? {};
  try {
    MulmoStudioContextMethods.setSessionState(context, "multiLingual", true);
    const fileName = MulmoStudioContextMethods.getFileName(context);
    const outDirPath = MulmoStudioContextMethods.getOutDirPath(context);
    const outputMultilingualFilePath = getOutputMultilingualFilePath(outDirPath, fileName);
    mkdir(outDirPath);

    const targetLangs = [...new Set([context.lang, context.studio.script.captionParams?.lang].filter((x) => !isNull(x)))];
    const config = settings2GraphAIConfig(settings, process.env);

    assert(!!config?.openAIAgent?.apiKey, "The OPENAI_API_KEY environment variable is missing or empty");

    const graph = new GraphAI(translateGraph, { ...vanillaAgents, fileWriteAgent, openAIAgent }, { agentFilters, config });

    graph.injectValue("context", context);
    graph.injectValue("targetLangs", targetLangs);
    graph.injectValue("outDirPath", outDirPath);
    graph.injectValue("outputMultilingualFilePath", outputMultilingualFilePath);
    if (callbacks) {
      callbacks.forEach((callback) => {
        graph.registerCallback(callback);
      });
    }
    const results = await graph.run<{ multiLingual: MulmoStudioMultiLingual }>();
    writingMessage(outputMultilingualFilePath);
    if (results.mergeStudioResult) {
      context.multiLingual = results.mergeStudioResult.multiLingual;
    }
  } finally {
    MulmoStudioContextMethods.setSessionState(context, "multiLingual", false);
  }
};
