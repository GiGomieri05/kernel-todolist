'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';
import { TaskComposerDialog } from './TaskComposerDialog';

export function TaskComposer() {
  const [input, setInput] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setIsDialogOpen(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="O que você precisa fazer? (ex: 'reunião com o Henrique amanhã às 15h')"
          className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        <Button 
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!input.trim()}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Adicionar com IA
        </Button>
      </form>

      <TaskComposerDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setInput('');
        }}
        input={input}
      />
    </>
  );
}
