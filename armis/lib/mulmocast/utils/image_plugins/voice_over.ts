import { ImageProcessorParams } from "../../types/index.js";

export const imageType = "voice_over";

export const processBeatReference = async (__: ImageProcessorParams) => {
  // For voice-over, return undefined to indicate no image should be generated
  return undefined;
};

export const process = processBeatReference;
export const path = (__: ImageProcessorParams) => {
  return undefined;
};
