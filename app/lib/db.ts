import { supabase } from './supabase';
import { Database } from './database.types';

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectDeliverable = Database['public']['Tables']['project_deliverables']['Row'];
export type ProjectDeliverableDocument = Database['public']['Tables']['project_deliverable_documents']['Row'];

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

  const { data: deliverables, error: deliverablesError } = await supabase
    .from('project_deliverables')
    .select('*')
    .eq('project_id', id);

  if (deliverablesError) throw deliverablesError;

  const deliverablesByPhase = deliverables.reduce((acc, del) => {
    if (!acc[del.phase]) {
      acc[del.phase] = [];
    }
    acc[del.phase].push(del.deliverable_id);
    return acc;
  }, {} as Record<string, string[]>);

  const deliverableIds = deliverables.reduce((acc, del) => {
    acc[del.deliverable_id] = del.id;
    return acc;
  }, {} as Record<string, string>);

  return {
    ...project,
    deliverables: deliverablesByPhase,
    deliverableIds
  };
}

export async function createProject(
  title: string,
  description: string | null,
  deliverables: Record<string, string[]>,
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

  // Then, create all deliverables
  const deliverableRecords = Object.entries(deliverables).flatMap(([phase, ids]) =>
    ids.map(deliverableId => ({
      project_id: project.id,
      phase,
      deliverable_id: deliverableId,
      created_by: userId
    }))
  );

  if (deliverableRecords.length > 0) {
    const { error: deliverablesError } = await supabase
      .from('project_deliverables')
      .insert(deliverableRecords);

    if (deliverablesError) throw deliverablesError;
  }

  return project;
}

export async function updateProject(
  id: string,
  title: string,
  description: string | null,
  deliverables: Record<string, string[]>,
  userId: string
) {
  // Update project details
  const { error: projectError } = await supabase
    .from('projects')
    .update({ title, description })
    .eq('id', id);

  if (projectError) throw projectError;

  // Delete existing deliverables
  const { error: deleteError } = await supabase
    .from('project_deliverables')
    .delete()
    .eq('project_id', id);

  if (deleteError) throw deleteError;

  // Insert new deliverables
  const deliverableRecords = Object.entries(deliverables).flatMap(([phase, ids]) =>
    ids.map(deliverableId => ({
      project_id: id,
      phase,
      deliverable_id: deliverableId,
      created_by: userId
    }))
  );

  if (deliverableRecords.length > 0) {
    const { error: deliverablesError } = await supabase
      .from('project_deliverables')
      .insert(deliverableRecords);

    if (deliverablesError) throw deliverablesError;
  }
}

export async function deleteProject(id: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function addProjectDeliverables(
  projectId: string,
  phase: string,
  deliverableIds: string[],
  userId: string
) {
  const deliverableRecords = deliverableIds.map(deliverableId => ({
    project_id: projectId,
    phase,
    deliverable_id: deliverableId,
    created_by: userId
  }));

  const { error } = await supabase
    .from('project_deliverables')
    .insert(deliverableRecords);

  if (error) throw error;
}

export async function getProjectDeliverableDocuments(projectDeliverableId: string) {
  const { data: documents, error } = await supabase
    .from('project_deliverable_documents')
    .select('*')
    .eq('project_deliverable_id', projectDeliverableId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return documents;
}

export async function addProjectDeliverableDocument(
  projectDeliverableId: string,
  title: string,
  url: string,
  userId: string
) {
  const { data: document, error } = await supabase
    .from('project_deliverable_documents')
    .insert([
      {
        project_deliverable_id: projectDeliverableId,
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

export async function updateProjectDeliverableDocument(
  documentId: string,
  title: string,
  url: string
) {
  const { data: document, error } = await supabase
    .from('project_deliverable_documents')
    .update({ title, url })
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return document;
}

export async function deleteProjectDeliverableDocument(documentId: string) {
  const { error } = await supabase
    .from('project_deliverable_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
} 