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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      taskings: {
        Row: {
          id: string
          name: string
          description: string | null
          category: 'personal' | 'shared'
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: 'personal' | 'shared'
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: 'personal' | 'shared'
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taskings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          id: string
          name: string
          file_path: string
          file_size: number
          mime_type: string
          tasking_id: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          file_path: string
          file_size: number
          mime_type: string
          tasking_id: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          tasking_id?: string
          uploaded_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_tasking_id_fkey"
            columns: ["tasking_id"]
            referencedRelation: "taskings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      briefings: {
        Row: {
          id: string
          title: string
          summary: string
          content: string
          tasking_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary: string
          content: string
          tasking_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string
          content?: string
          tasking_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_tasking_id_fkey"
            columns: ["tasking_id"]
            referencedRelation: "taskings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefings_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      document_embeddings: {
        Row: {
          id: string
          file_id: string
          content: string
          embedding: number[]
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          content: string
          embedding: number[]
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          file_id?: string
          content?: string
          embedding?: number[]
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_embeddings_file_id_fkey"
            columns: ["file_id"]
            referencedRelation: "files"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          tasking_id?: string
        }
        Returns: {
          id: string
          file_id: string
          content: string
          similarity: number
          metadata: Json | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 