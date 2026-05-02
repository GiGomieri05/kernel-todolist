import Groq from 'groq-sdk';
import { AIProvider, ParseContext, ParseResult } from './provider';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export class GroqProvider implements AIProvider {
  async parseTaskInput(input: string, context: ParseContext): Promise<ParseResult> {
    const systemPrompt = this.buildSystemPrompt(context);
    
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

  private buildSystemPrompt(context: ParseContext): string {
    return `Você é um assistente que estrutura tarefas pessoais para um sistema de produtividade chamado K.E.R.N.E.L. Todo List.

Contexto atual:
- Data: ${context.currentDate}
- Hora: ${context.currentTime}
- Projetos disponíveis: ${context.projects.map(p => p.name).join(', ')}
- Labels disponíveis: ${context.labels.map(l => l.name).join(', ')}

Regras:
1. Sempre responda em JSON puro
2. Decomponha tarefas compostas em múltiplas subtarefas
3. Atribua o projeto mais apropriado baseado no contexto
4. Use apenas labels existentes
5. Prioridade: 4=p1 (urgente), 3=p2 (importante), 2=p3 (médio), 1=p4 (baixa)
6. Se mencionar horário, preencha dueDate e dueTime
7. Inclua reasoning curto explicando decisões

Formato de saída:
{
  "tasks": [{
    "content": "string",
    "description": "string?",
    "projectId": "string",
    "projectName": "string",
    "labels": ["string"],
    "priority": 1|2|3|4,
    "dueDate": "YYYY-MM-DD?",
    "dueTime": "HH:mm?",
    "reasoning": "string"
  }],
  "wasDecomposed": boolean,
  "decompositionReason": "string?",
  "warnings": ["string?"]
}`;
  }
}

export const groqProvider = new GroqProvider();
