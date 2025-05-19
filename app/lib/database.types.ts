export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          phase: string
          deliverable_id: string
          status: 'todo' | 'in_progress' | 'done'
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          phase: string
          deliverable_id: string
          status?: 'todo' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          phase?: string
          deliverable_id?: string
          status?: 'todo' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      task_documents: {
        Row: {
          id: string
          task_id: string
          title: string
          url: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          url: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          url?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 