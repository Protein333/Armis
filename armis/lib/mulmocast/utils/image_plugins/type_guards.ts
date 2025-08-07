import {
  MulmoTextSlideMedia,
  mulmoTextSlideMediaSchema,
  MulmoMarkdownMedia,
  mulmoMarkdownMediaSchema,
  MulmoImageMedia,
  mulmoImageMediaSchema,
  MulmoChartMedia,
  mulmoChartMediaSchema,
  MulmoMermaidMedia,
  mulmoMermaidMediaSchema,
} from "../../types/index.js";

export const isMulmoImageTextSlide = (value: unknown): value is MulmoTextSlideMedia => {
  const result = mulmoTextSlideMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageMarkdown = (value: unknown): value is MulmoMarkdownMedia => {
  const result = mulmoMarkdownMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageImage = (value: unknown): value is MulmoImageMedia => {
  const result = mulmoImageMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageChart = (value: unknown): value is MulmoChartMedia => {
  const result = mulmoChartMediaSchema.safeParse(value);
  return result.success;
};

export const isMulmoImageMermaild = (value: unknown): value is MulmoMermaidMedia => {
  const result = mulmoMermaidMediaSchema.safeParse(value);
  return result.success;
};
