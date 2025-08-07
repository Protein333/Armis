import { GraphAILogger } from "graphai";
import type { AgentFunction, AgentFunctionInfo } from "graphai";
import { getAspectRatio } from "./movie_google_agent.js";
import { provider2ImageAgent } from "../utils/provider2agent.js";
import type { AgentBufferResult, ImageAgentInputs, ImageAgentParams, GoogleImageAgentConfig } from "../types/agent.js";

type PredictionResponse = {
  predictions?: {
    bytesBase64Encoded?: string;
  }[];
};

async function generateImage(
  projectId: string | undefined,
  model: string,
  token: string | undefined,
  prompt: string,
  aspectRatio: string,
): Promise<Buffer | undefined> {
  const GOOGLE_IMAGEN_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`;

  try {
    // Prepare the payload for the API request
    const payload = {
      instances: [
        {
          prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio,
        safetySetting: "block_only_high",
      },
    };

    // Make the API call using fetch
    const response = await fetch(GOOGLE_IMAGEN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const responseData: PredictionResponse = await response.json();

    // Parse and return the generated image URL or data
    const predictions = responseData.predictions;
    if (predictions && predictions.length > 0) {
      const base64Image = predictions[0].bytesBase64Encoded;
      if (base64Image) {
        return Buffer.from(base64Image, "base64"); // Decode the base64 image to a buffer
      } else {
        throw new Error("No base64-encoded image data returned from the API.");
      }
    } else {
      // console.log(response);
      GraphAILogger.info("No predictions returned from the API.", responseData, prompt);
      return undefined;
    }
  } catch (error) {
    GraphAILogger.info("Error generating image:", error);
    throw error;
  }
}

export const imageGoogleAgent: AgentFunction<ImageAgentParams, AgentBufferResult, ImageAgentInputs, GoogleImageAgentConfig> = async ({
  namedInputs,
  params,
  config,
}) => {
  const { prompt } = namedInputs;
  const aspectRatio = getAspectRatio(params.canvasSize);
  const model = params.model ?? provider2ImageAgent["google"].defaultModel;
  const projectId = config?.projectId;
  const token = config?.token;

  try {
    const buffer = await generateImage(projectId, model, token, prompt, aspectRatio);
    if (buffer) {
      return { buffer };
    }
    throw new Error("ERROR: geneateImage returned undefined");
  } catch (error) {
    GraphAILogger.info("Failed to generate image:", error);
    throw error;
  }
};

const imageGoogleAgentInfo: AgentFunctionInfo = {
  name: "imageGoogleAgent",
  agent: imageGoogleAgent,
  mock: imageGoogleAgent,
  samples: [],
  description: "Google Image agent",
  category: ["image"],
  author: "Receptron Team",
  repository: "https://github.com/receptron/mulmocast-cli/",
  // source: "https://github.com/receptron/mulmocast-cli/blob/main/src/agents/image_google_agent.ts",
  license: "MIT",
  environmentVariables: [],
};

export default imageGoogleAgentInfo;
