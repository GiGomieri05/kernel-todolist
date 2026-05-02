import Groq from 'groq-sdk';
import { AIProvider, ParseContext, ParseResult } from './provider';
import { buildSystemPrompt } from './prompts';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export class GroqProvider implements AIProvider {
  async parseTaskInput(input: string, context: ParseContext): Promise<ParseResult> {
    const systemPrompt = buildSystemPrompt(context);
    
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const result = JSON.parse(content) as ParseResult;
      return result;
    } catch {
      return {
        tasks: [],
        wasDecomposed: false,
        warnings: ['Erro ao processar resposta da IA'],
      };
    }
  }
}

export const groqProvider = new GroqProvider();
