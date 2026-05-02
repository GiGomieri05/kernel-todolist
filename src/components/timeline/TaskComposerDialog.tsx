'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, AlertTriangle, Info } from 'lucide-react';
import { useTodoistProjects } from '@/hooks/useTodoist';
import { useWindowMappings } from '@/hooks/useMappings';
import { ProposedTask, ParseResult } from '@/lib/ai/provider';
import { toast } from 'sonner';

interface TaskComposerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  input: string;
}

export function TaskComposerDialog({ isOpen, onClose, input }: TaskComposerDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [tasks, setTasks] = useState<ProposedTask[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  
  const { projects } = useTodoistProjects();
  const { mappings } = useWindowMappings();

  useEffect(() => {
    if (isOpen && input) {
      parseInput();
    }
  }, [isOpen, input]);

  const parseInput = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      
      if (!res.ok) throw new Error('Erro ao analisar');
      
      const data: ParseResult = await res.json();
      setResult(data);
      setTasks(data.tasks);
    } catch (error) {
      toast.error('Erro ao analisar tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = (index: number, updates: Partial<ProposedTask>) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, ...updates } : t));
  };

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const addManualTask = () => {
    const defaultProject = projects[0];
    setTasks(prev => [...prev, {
      content: '',
      description: '',
      projectId: defaultProject?.id || '',
      projectName: defaultProject?.name || '',
      labels: [],
      priority: 3,
      reasoning: 'Adicionada manualmente',
    }]);
  };

  const createTasks = async () => {
    setIsCreating(true);
    setCreatedCount(0);
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      try {
        const res = await fetch('/api/todoist/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: task.content,
            description: task.description,
            projectId: task.projectId,
            labels: task.labels,
            priority: task.priority,
            dueDate: task.dueDate,
            dueDatetime: task.dueTime ? `${task.dueDate}T${task.dueTime}:00` : undefined,
          }),
        });
        
        if (res.ok) {
          setCreatedCount(c => c + 1);
        }
      } catch {
        // Task failed, continue with others
      }
    }
    
    toast.success(`${createdCount} tarefa(s) criadas`);
    onClose();
    setIsCreating(false);
    
    // Refresh page to show new tasks
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-zinc-400">Analisando sua tarefa...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {result?.wasDecomposed ? 'Tarefas propostas' : 'Nova tarefa'}
          </DialogTitle>
        </DialogHeader>

        {result?.wasDecomposed && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-indigo-400">
              Sua tarefa foi dividida em {tasks.length} etapas.
              {result.decompositionReason && ` ${result.decompositionReason}`}
            </p>
          </div>
        )}

        {result?.warnings && result.warnings.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-amber-400">{result.warnings[0]}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <TaskEditorCard
              key={index}
              task={task}
              index={index}
              projects={projects}
              mappings={mappings}
              onUpdate={(updates) => updateTask(index, updates)}
              onRemove={() => removeTask(index)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={addManualTask}
            className="border-zinc-700 text-zinc-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar manual
          </Button>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={createTasks}
              disabled={isCreating || tasks.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando {createdCount}/{tasks.length}...
                </>
              ) : (
                `Criar ${tasks.length} tarefa(s)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TaskEditorCardProps {
  task: ProposedTask;
  index: number;
  projects: { id: string; name: string; color?: string }[];
  mappings: { pattern: string; projectId: string; projectName?: string }[];
  onUpdate: (updates: Partial<ProposedTask>) => void;
  onRemove: () => void;
}

function TaskEditorCard({ task, index, projects, onUpdate, onRemove }: TaskEditorCardProps) {
  const priorityOptions = [
    { value: 4, label: 'p1 (Urgente)', color: 'bg-red-500' },
    { value: 3, label: 'p2 (Importante)', color: 'bg-orange-500' },
    { value: 2, label: 'p3 (Médio)', color: 'bg-blue-500' },
    { value: 1, label: 'p4 (Baixa)', color: 'bg-zinc-600' },
  ];

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Input
            value={task.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder="Título da tarefa"
            className="bg-zinc-900 border-zinc-700 text-zinc-100"
          />
          
          <Textarea
            value={task.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Descrição (opcional)"
            className="bg-zinc-900 border-zinc-700 text-zinc-100 min-h-[60px]"
          />
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-zinc-500 hover:text-red-400 ml-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Select
          value={task.projectId}
          onValueChange={(v) => {
            const p = projects.find(p => p.id === v);
            onUpdate({ projectId: v, projectName: p?.name || '' });
          }}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id} className="text-zinc-100">
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={task.priority.toString()}
          onValueChange={(v) => onUpdate({ priority: parseInt(v) as 1|2|3|4 })}
        >
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {priorityOptions.map(p => (
              <SelectItem key={p.value} value={p.value.toString()} className="text-zinc-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.color}`} />
                  {p.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={task.dueDate || ''}
          onChange={(e) => onUpdate({ dueDate: e.target.value || undefined })}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 w-32"
        />
        <Input
          type="time"
          value={task.dueTime || ''}
          onChange={(e) => onUpdate({ dueTime: e.target.value || undefined })}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 w-24"
        />
      </div>

      <div className="flex items-center gap-1 text-xs text-zinc-500">
        <Info className="h-3 w-3" />
        <span>{task.reasoning}</span>
      </div>
    </div>
  );
}
