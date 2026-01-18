/**
 * Database Types for Supabase
 *
 * This file defines the database schema types for the AV Designer application.
 * When you set up your Supabase project, you can generate these types automatically
 * using: npx supabase gen types typescript --project-id <your-project-id>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          client_name: string;
          status: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_name: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          client_name?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          room_type: string;
          platform: string;
          ecosystem: string;
          quality_tier: string;
          dimensions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          room_type: string;
          platform?: string;
          ecosystem?: string;
          quality_tier?: string;
          dimensions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          room_type?: string;
          platform?: string;
          ecosystem?: string;
          quality_tier?: string;
          dimensions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rooms_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
      equipment: {
        Row: {
          id: string;
          manufacturer: string;
          model: string;
          sku: string;
          category: string;
          subcategory: string;
          description: string;
          specifications: Json;
          pricing: Json;
          compatibility: Json;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          manufacturer: string;
          model: string;
          sku: string;
          category: string;
          subcategory?: string;
          description?: string;
          specifications?: Json;
          pricing?: Json;
          compatibility?: Json;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          manufacturer?: string;
          model?: string;
          sku?: string;
          category?: string;
          subcategory?: string;
          description?: string;
          specifications?: Json;
          pricing?: Json;
          compatibility?: Json;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      room_equipment: {
        Row: {
          id: string;
          room_id: string;
          equipment_id: string;
          position: Json;
          rotation: number;
          connections: Json;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          equipment_id: string;
          position?: Json;
          rotation?: number;
          connections?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          equipment_id?: string;
          position?: Json;
          rotation?: number;
          connections?: Json;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'room_equipment_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'room_equipment_equipment_id_fkey';
            columns: ['equipment_id'];
            referencedRelation: 'equipment';
            referencedColumns: ['id'];
          }
        ];
      };
      standards: {
        Row: {
          id: string;
          name: string;
          description: string;
          rules: Json;
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          rules?: Json;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          rules?: Json;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          project_id: string;
          room_id: string;
          items: Json;
          subtotal: number;
          tax: number;
          total: number;
          currency: string;
          valid_until: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          room_id: string;
          items?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          currency?: string;
          valid_until?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          room_id?: string;
          items?: Json;
          subtotal?: number;
          tax?: number;
          total?: number;
          currency?: string;
          valid_until?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'quotes_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'quotes_room_id_fkey';
            columns: ['room_id'];
            referencedRelation: 'rooms';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
