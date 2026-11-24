import Anthropic from "@anthropic-ai/sdk";
import { parseStreamingJson } from "@jayparmarr/llm-json-guard";

interface ReleasePlan {
  featureName: string;
  summary: string;
  tasks: string[];
}

const anthropic = new Anthropic();

async function streamStructuredPlan(prompt: string) {
  let buffer = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `${prompt}\nRespond strictly with JSON matching { featureName, summary, tasks }.`,
      },
    ],
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      buffer += event.delta.text;
      const partial = parseStreamingJson<ReleasePlan>(buffer);
      if (partial) {
        console.clear();
        console.log("Live Parsed Object:");
        console.dir(partial, { depth: null });
      }
    }
  }
}

streamStructuredPlan("Plan a zero-dependency TypeScript CLI release.").catch(console.error);