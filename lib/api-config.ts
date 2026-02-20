export const API_CONFIG = {
  huggingFace: {
    baseUrl: "https://router.huggingface.co/hf-inference/models",
    model: "black-forest-labs/FLUX.1-schnell",
    defaultWidth: 512,
    defaultHeight: 512,
  },
  prompts: {
    emojiSuffix: ", emoji style, cute emoticon, simple rounded shapes, bright colors, kawaii, flat design, solid color background",
  },
} as const;

export function getHuggingFaceUrl(): string {
  return `${API_CONFIG.huggingFace.baseUrl}/${API_CONFIG.huggingFace.model}`;
}

export function buildEmojiPrompt(prompt: string): string {
  return `${prompt}${API_CONFIG.prompts.emojiSuffix}`;
}

export interface GenerateImageResponse {
  imageUrl: string;
}

export interface GenerateImageError {
  error: string;
}

export type GenerateImageResult = GenerateImageResponse | GenerateImageError;

export function isErrorResponse(result: GenerateImageResult): result is GenerateImageError {
  return "error" in result;
}
