import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { getCachedTasksForDate } from '@/lib/todoist/cache';
import { createTask } from '@/lib/todoist/tasks';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(session);
    const uid = decodedToken.uid;

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 });
    }

    const { withDate, withoutDate } = await getCachedTasksForDate(uid, date);

    return NextResponse.json({ withDate, withoutDate, date });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    
    if ((error as Error).message === 'Token do Todoist inválido') {
      return NextResponse.json({ error: 'Token do Todoist inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const task = await createTask(body);

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    
    if ((error as Error).message === 'Token do Todoist inválido') {
      return NextResponse.json({ error: 'Token do Todoist inválido' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
