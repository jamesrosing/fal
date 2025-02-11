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
      team_members: {
        Row: {
          id: string
          name: string
          title: string | null
          role: string
          image_url: string | null
          description: string | null
          order: number
          is_provider: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          role: string
          image_url?: string | null
          description?: string | null
          order: number
          is_provider: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          role?: string
          image_url?: string | null
          description?: string | null
          order?: number
          is_provider?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables here as needed
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