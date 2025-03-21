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
      servers: {
        Row: {
          id: string
          name: string
          description: string | null
          version_history: string | null
          compatibility: Json | null
          release_notes: string | null
          screenshots: string[] | null
          developer_info: Json | null
          license: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          version_history?: string | null
          compatibility?: Json | null
          release_notes?: string | null
          screenshots?: string[] | null
          developer_info?: Json | null
          license?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          version_history?: string | null
          compatibility?: Json | null
          release_notes?: string | null
          screenshots?: string[] | null
          developer_info?: Json | null
          license?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          server_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          server_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          server_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      installation_logs: {
        Row: {
          id: string
          user_id: string | null
          server_id: string
          status: string
          error_message: string | null
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          server_id: string
          status: string
          error_message?: string | null
          attempted_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          server_id?: string
          status?: string
          error_message?: string | null
          attempted_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string | null
          user_action: string
          details: Json | null
          recorded_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_action: string
          details?: Json | null
          recorded_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_action?: string
          details?: Json | null
          recorded_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          server_id: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          server_id: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          server_id?: string
          added_at?: string
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