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
      user_profiles: {
        Row: {
          id: string
          name: string
          email: string
          business_name: string
          business_type: string
          location: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          business_name: string
          business_type: string
          location?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          business_name?: string
          business_type?: string
          location?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: string
          account_name: string
          account_id: string | null
          followers: number
          is_connected: boolean
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          account_name: string
          account_id?: string | null
          followers?: number
          is_connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          account_name?: string
          account_id?: string | null
          followers?: number
          is_connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          platforms: string[]
          scheduled_for: string
          status: string
          engagement_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          platforms?: string[]
          scheduled_for: string
          status?: string
          engagement_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          platforms?: string[]
          scheduled_for?: string
          status?: string
          engagement_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      post_analytics: {
        Row: {
          id: string
          post_id: string
          platform: string
          likes: number
          comments: number
          shares: number
          reach: number
          impressions: number
          recorded_at: string
        }
        Insert: {
          id?: string
          post_id: string
          platform: string
          likes?: number
          comments?: number
          shares?: number
          reach?: number
          impressions?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          platform?: string
          likes?: number
          comments?: number
          shares?: number
          reach?: number
          impressions?: number
          recorded_at?: string
        }
      }
      customer_messages: {
        Row: {
          id: string
          user_id: string
          platform: string
          from_user: string
          from_user_id: string | null
          content: string
          message_type: string
          is_read: boolean
          replied_at: string | null
          reply_content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform: string
          from_user: string
          from_user_id?: string | null
          content: string
          message_type?: string
          is_read?: boolean
          replied_at?: string | null
          reply_content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform?: string
          from_user?: string
          from_user_id?: string | null
          content?: string
          message_type?: string
          is_read?: boolean
          replied_at?: string | null
          reply_content?: string | null
          created_at?: string
        }
      }
      customer_interactions: {
        Row: {
          id: string
          user_id: string
          customer_name: string
          customer_email: string | null
          customer_phone: string | null
          platform: string
          interaction_type: string
          notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_name: string
          customer_email?: string | null
          customer_phone?: string | null
          platform: string
          interaction_type?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string | null
          platform?: string
          interaction_type?: string
          notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      automation_rules: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          rule_type: string
          trigger_conditions: Json
          actions: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          rule_type: string
          trigger_conditions?: Json
          actions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          rule_type?: string
          trigger_conditions?: Json
          actions?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      compliance_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          compliance_type: string
          due_date: string
          status: string
          priority: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          compliance_type: string
          due_date: string
          status?: string
          priority?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          compliance_type?: string
          due_date?: string
          status?: string
          priority?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      automation_logs: {
        Row: {
          id: string
          user_id: string
          rule_id: string | null
          action_taken: string
          result: string | null
          executed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rule_id?: string | null
          action_taken: string
          result?: string | null
          executed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rule_id?: string | null
          action_taken?: string
          result?: string | null
          executed_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}