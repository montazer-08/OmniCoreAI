'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { AI_PERSONALITIES } from '@/ai/personalities';

const AiChatInputSchema = z.object({
  query: z.string(),
  overclock: z.boolean().optional(),
  personality: z.enum(
    Object.keys(AI_PERSONALITIES) as [
      keyof typeof AI_PERSONALITIES,
      ...(keyof typeof AI_PERSONALITIES)[]
    ]
  ).optional(),
  futureYouMode: z.boolean().optional(),
});

export type AiChatInput = z.infer<typeof AiChatInputSchema>;
export type AiChatOutput = ReadableStream<string>;

export async function aiChat(
  input: AiChatInput,
  options?: { signal: AbortSignal }
): Promise<{ response: AiChatOutput }> {

  // ✅ اختيار الموديل بالطريقة الصحيحة
  const model = input.overclock
    ? googleAI.model('gemini-2.5-flash')
    : googleAI.model('gemini-1.5-pro');

  // ✅ اختيار الشخصية
  let systemPrompt = AI_PERSONALITIES.default;
  if (input.futureYouMode) {
    systemPrompt = AI_PERSONALITIES.futureYou;
  } else if (input.personality) {
    systemPrompt = AI_PERSONALITIES[input.personality];
  }

  // ✅ generateStream بالطريقة الرسمية
  const { stream } = ai.generateStream({
    model,
    prompt: `${systemPrompt}

User query:
${input.query}
`,
    ...(options?.signal && { signal: options.signal }),
  });

  const outputStream = new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.text) controller.enqueue(chunk.text);
      }
      controller.close();
    },
  });

  return { response: outputStream };
}
