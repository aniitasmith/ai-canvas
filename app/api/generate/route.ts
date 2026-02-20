import { NextRequest, NextResponse } from "next/server";
import { getHuggingFaceUrl, buildEmojiPrompt, API_CONFIG } from "@/lib/api-config";

export async function POST(request: NextRequest) {
  const token = process.env.HF_TOKEN;
  
  if (!token) {
    return NextResponse.json(
      { error: "HF_TOKEN is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const emojiPrompt = buildEmojiPrompt(prompt);
    const { defaultWidth, defaultHeight } = API_CONFIG.huggingFace;

    const response = await fetch(getHuggingFaceUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: emojiPrompt,
        parameters: {
          width: defaultWidth,
          height: defaultHeight,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
