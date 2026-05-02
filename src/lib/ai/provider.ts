export interface ParseContext {
  currentDate: string;
  currentTime: string;
  projects: { id: string; name: string }[];
  labels: { id: string; name: string }[];
  windowMappings: { pattern: string; projectId: string; projectName: string }[];
  upcomingWindows: {
    date: string;
    windows: { start: string; end: string; title: string; projectId?: string }[];
  }[];
}

export interface ProposedTask {
  content: string;
  description?: string;
  projectId: string;
  projectName: string;
  labels: string[];
  priority: 1 | 2 | 3 | 4;
  dueDate?: string;
  dueTime?: string;
  reasoning: string;
}

export interface ParseResult {
  tasks: ProposedTask[];
  wasDecomposed: boolean;
  decompositionReason?: string;
  warnings?: string[];
}

export interface AIProvider {
  parseTaskInput(input: string, context: ParseContext): Promise<ParseResult>;
}
