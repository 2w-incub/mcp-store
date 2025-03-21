import { createClient } from '@supabase/supabase-js';
import { Database, Json } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Error | null, action: string) => {
  if (error) {
    console.error(`Supabase error during ${action}:`, error.message);
    throw new Error(`Error during ${action}: ${error.message}`);
  }
};

// Server data types
export type Server = {
  id: string;
  name: string;
  description?: string | null;
  version_history?: string | null;
  compatibility?: Json | null;
  release_notes?: string | null;
  screenshots?: string[] | null;
  developer_info?: Json | null;
  license?: string | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  server_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
};

export type InstallationLog = {
  id: string;
  user_id?: string | null;
  server_id: string;
  status: string;
  error_message?: string | null;
  attempted_at: string;
};

export type UserFavorite = {
  id: string;
  user_id: string;
  server_id: string;
  added_at: string;
};

// Server functions
export const getServers = async (): Promise<Server[]> => {
  const { data, error } = await supabase.from('servers').select('*');
  handleSupabaseError(error, 'fetching servers');
  return data || [];
};

export const getServerById = async (id: string): Promise<Server | null> => {
  const { data, error } = await supabase
    .from('servers')
    .select('*')
    .eq('id', id)
    .single();
  handleSupabaseError(error, `fetching server ${id}`);
  return data;
};

export const getServerReviews = async (serverId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('server_id', serverId);
  handleSupabaseError(error, `fetching reviews for server ${serverId}`);
  return data || [];
};

export const createInstallationLog = async (
  log: Omit<InstallationLog, 'id' | 'attempted_at'>
): Promise<InstallationLog> => {
  const { data, error } = await supabase
    .from('installation_logs')
    .insert([log])
    .select()
    .single();
  handleSupabaseError(error, 'creating installation log');
  return data!;
};

export const logAnalytics = async (
  userId: string | null,
  action: string,
  details: Json
): Promise<void> => {
  const { error } = await supabase.from('analytics').insert([
    {
      user_id: userId,
      user_action: action,
      details,
    },
  ]);
  handleSupabaseError(error, 'logging analytics');
};

export const getUserFavorites = async (userId: string): Promise<UserFavorite[]> => {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId);
  handleSupabaseError(error, `fetching favorites for user ${userId}`);
  return data || [];
};

export const addUserFavorite = async (
  userId: string,
  serverId: string
): Promise<UserFavorite> => {
  const { data, error } = await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, server_id: serverId }])
    .select()
    .single();
  handleSupabaseError(error, 'adding server to favorites');
  return data!;
};

export const removeUserFavorite = async (
  userId: string,
  serverId: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('server_id', serverId);
  handleSupabaseError(error, 'removing server from favorites');
};