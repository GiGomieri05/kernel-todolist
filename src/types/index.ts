import { User as FirebaseUser } from 'firebase/auth';

export type User = FirebaseUser;

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  recurringEventId?: string;
  location?: string;
  description?: string;
};

export type Calendar = {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor?: string;
};

export type TodoistProject = {
  id: string;
  name: string;
  color: string;
  parentId: string | null;
  order: number;
};

export type TodoistTask = {
  id: string;
  content: string;
  description: string;
  projectId: string;
  parentId: string | null;
  labels: string[];
  priority: 1 | 2 | 3 | 4;
  due: {
    date: string;
    datetime?: string;
    timezone?: string;
    isRecurring: boolean;
    string: string;
  } | null;
  duration: { amount: number; unit: 'minute' | 'day' } | null;
  url: string;
  isCompleted: boolean;
};

export type TodoistLabel = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type WindowMapping = {
  id: string;
  pattern: string;
  matchType: 'exact' | 'startsWith' | 'contains' | 'regex';
  projectId: string;
  defaultLabels?: string[];
  defaultPriority?: 1 | 2 | 3 | 4;
  order: number;
};

export type ParseContext = {
  currentDate: string;
  currentTime: string;
  projects: { id: string; name: string }[];
  labels: { id: string; name: string }[];
  windowMappings: { pattern: string; projectId: string; projectName: string }[];
  upcomingWindows: {
    date: string;
    windows: { start: string; end: string; title: string; projectId?: string }[];
  }[];
};

export type ProposedTask = {
  content: string;
  description?: string;
  projectId: string;
  projectName: string;
  labels: string[];
  priority: 1 | 2 | 3 | 4;
  dueDate?: string;
  dueTime?: string;
  reasoning: string;
};

export type ParseResult = {
  tasks: ProposedTask[];
  wasDecomposed: boolean;
  decompositionReason?: string;
  warnings?: string[];
};
