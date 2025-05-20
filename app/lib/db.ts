import { supabase } from './supabase';
import { Database } from './database.types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskDocument = Database['public']['Tables']['task_documents']['Row'];
export type TaskComment = Database['public']['Tables']['task_comments']['Row'];

export async function getProjects() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return projects;
}

export async function getProject(id: string) {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (projectError) throw projectError;

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id);

  if (tasksError) throw tasksError;

  // Group by phase for design view
  const tasksByPhase = tasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }
    acc[task.phase].push(task.deliverable_id);
    return acc;
  }, {} as Record<string, string[]>);

  // Create lookup for task_id
  const taskIds = tasks.reduce((acc, task) => {
    acc[task.deliverable_id] = task.id;
    return acc;
  }, {} as Record<string, string>);

  // Group by status for kanban view
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push({
      id: task.deliverable_id,
      taskId: task.id,
      phase: task.phase,
      status: task.status
    });
    return acc;
  }, {} as Record<string, Array<{ id: string; taskId: string; phase: string; status: string }>>);

  return {
    ...project,
    tasks: tasksByPhase,
    taskIds,
    tasksByStatus
  };
}

export async function createProject(
  title: string,
  description: string | null,
  tasks: Record<string, string[]>,
  userId: string
) {
  // First, create the project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert([
      {
        title,
        description,
        created_by: userId
      }
    ])
    .select()
    .single();

  if (projectError) throw projectError;

  // Then, create all tasks with default 'todo' status
  const taskRecords = Object.entries(tasks).flatMap(([phase, ids]) =>
    ids.map(deliverableId => ({
      project_id: project.id,
      phase,
      deliverable_id: deliverableId,
      status: 'todo' as const,
      created_by: userId
    }))
  );

  if (taskRecords.length > 0) {
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(taskRecords);

    if (tasksError) throw tasksError;
  }

  return project;
}

export async function updateProject(
  id: string,
  title: string,
  description: string | null,
  tasks: Record<string, string[]>,
  userId: string
) {
  // Update project details
  const { error: projectError } = await supabase
    .from('projects')
    .update({ title, description })
    .eq('id', id);

  if (projectError) throw projectError;

  // Delete existing tasks
  const { error: deleteError } = await supabase
    .from('tasks')
    .delete()
    .eq('project_id', id);

  if (deleteError) throw deleteError;

  // Insert new tasks with default 'todo' status
  const taskRecords = Object.entries(tasks).flatMap(([phase, ids]) =>
    ids.map(deliverableId => ({
      project_id: id,
      phase,
      deliverable_id: deliverableId,
      status: 'todo' as const,
      created_by: userId
    }))
  );

  if (taskRecords.length > 0) {
    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(taskRecords);

    if (tasksError) throw tasksError;
  }
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function addProjectTasks(
  projectId: string,
  phase: string,
  deliverableIds: string[],
  userId: string
) {
  const taskRecords = deliverableIds.map(deliverableId => ({
    project_id: projectId,
    phase,
    deliverable_id: deliverableId,
    status: 'todo' as const,
    created_by: userId
  }));

  const { error } = await supabase
    .from('tasks')
    .insert(taskRecords);

  if (error) throw error;
}

export async function getTaskDocuments(taskId: string) {
  const { data: documents, error } = await supabase
    .from('task_documents')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return documents;
}

export async function addTaskDocument(
  taskId: string,
  title: string,
  url: string,
  userId: string
) {
  const { data: document, error } = await supabase
    .from('task_documents')
    .insert([
      {
        task_id: taskId,
        title,
        url,
        created_by: userId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return document;
}

export async function updateTaskDocument(
  documentId: string,
  title: string,
  url: string
) {
  const { data: document, error } = await supabase
    .from('task_documents')
    .update({ title, url })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return document;
}

export async function deleteTaskDocument(documentId: string) {
  const { error } = await supabase
    .from('task_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

export async function updateTaskStatus(
  taskId: string,
  status: 'todo' | 'in_progress' | 'done'
) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTaskComments(taskId: string) {
  const { data, error } = await supabase
    .from('task_comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      user_profiles!user_id (
        email
      )
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    user_id: comment.user_id,
    user_email: Array.isArray(comment.user_profiles)
      ? (comment.user_profiles[0]?.email || 'Unknown User')
      : (comment.user_profiles?.email || 'Unknown User')
  }));
}

export async function createTaskComment(
  taskId: string,
  content: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('task_comments')
    .insert([
      {
        task_id: taskId,
        content,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTaskComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('task_comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTaskComment(commentId: string) {
  const { error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// Project Updates
export async function createProjectUpdate(
  projectId: string,
  content: string,
  userId: string,
  mood: 'not_great' | 'okay' | 'good' | 'great' = 'good'
) {
  const { error } = await supabase
    .from('project_updates')
    .insert([
      {
        project_id: projectId,
        content,
        user_id: userId,
        mood,
      },
    ]);

  if (error) throw error;
}

interface ProjectUpdateResponse {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  mood: 'not_great' | 'okay' | 'good' | 'great';
  user_profiles: { email: string; name?: string } | { email: string; name?: string }[];
}

export async function getProjectUpdates(projectId: string) {
  const { data, error } = await supabase
    .from('project_updates')
    .select(`
      id,
      content,
      created_at,
      user_id,
      mood,
      user_profiles!user_id (
        email,
        name
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false }) as { data: ProjectUpdateResponse[] | null, error: any };

  if (error) throw error;
  if (!data) return [];
  
  return data.map(update => ({
    id: update.id,
    content: update.content,
    created_at: update.created_at,
    user_id: update.user_id,
    mood: update.mood,
    user_email: Array.isArray(update.user_profiles)
      ? ((update.user_profiles[0] as any)?.email || 'Unknown User')
      : (update.user_profiles?.email || 'Unknown User'),
    user_name: Array.isArray(update.user_profiles)
      ? ((update.user_profiles[0] as any)?.name || (update.user_profiles[0] as any)?.email || 'Unknown User')
      : (update.user_profiles?.name || update.user_profiles?.email || 'Unknown User')
  }));
}

export async function updateProjectUpdate(updateId: string, content: string) {
  const { data, error } = await supabase
    .from('project_updates')
    .update({ content })
    .eq('id', updateId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProjectUpdate(updateId: string) {
  const { error } = await supabase
    .from('project_updates')
    .delete()
    .eq('id', updateId);

  if (error) throw error;
}

interface DeliverableComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email: string;
}

export async function getDeliverableComments(projectDeliverableId: string) {
  const { data, error } = await supabase
    .from('deliverable_comments')
    .select(`
      id,
      content,
      created_at,
      user_id,
      user_profiles!user_id (
        email
      )
    `)
    .eq('project_deliverable_id', projectDeliverableId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    user_id: comment.user_id,
    user_email: Array.isArray(comment.user_profiles)
      ? (comment.user_profiles[0]?.email || 'Unknown User')
      : (comment.user_profiles?.email || 'Unknown User')
  }));
}

export async function createDeliverableComment(
  projectDeliverableId: string,
  content: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('deliverable_comments')
    .insert([
      {
        project_deliverable_id: projectDeliverableId,
        content,
        user_id: userId
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeliverableComment(commentId: string, content: string) {
  const { data, error } = await supabase
    .from('deliverable_comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDeliverableComment(commentId: string) {
  const { error } = await supabase
    .from('deliverable_comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: { name?: string }) {
  const { error } = await supabase
    .from('user_profile')
    .upsert({ 
      id: userId,
      ...updates,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
} 