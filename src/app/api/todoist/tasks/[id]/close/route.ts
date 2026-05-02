import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { closeTask, updateTask } from '@/lib/todoist/tasks';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(session);
    const { id } = await params;
    await closeTask(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao fechar tarefa:', error);
    
    if ((error as Error).message === 'Token do Todoist inválido') {
      return NextResponse.json({ error: 'Token do Todoist inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(session);
    const { id } = await params;
    const body = await request.json();
    const task = await updateTask(id, body);

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    
    if ((error as Error).message === 'Token do Todoist inválido') {
      return NextResponse.json({ error: 'Token do Todoist inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
