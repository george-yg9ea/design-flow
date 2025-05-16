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
      project_deliverables: {
        Row: {
          id: string
          project_id: string
          phase: string
          deliverable_id: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          phase: string
          deliverable_id: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          phase?: string
          deliverable_id?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      project_deliverable_documents: {
        Row: {
          id: string
          project_deliverable_id: string
          title: string
          url: string
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_deliverable_id: string
          title: string
          url: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_deliverable_id?: string
          title?: string
          url?: string
          created_at?: string
          updated_at?: string
          created_by?: string | null
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