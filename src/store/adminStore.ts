import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  checkAdminStatus: (userId: string) => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addPolicy: (policy: any) => Promise<void>;
  updatePolicy: (id: string, policy: any) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAdmin: false,
  loading: true,
  checkAdminStatus: async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      set({ isAdmin: profile?.role === 'admin', loading: false });
    } catch (error) {
      console.error('Error checking admin status:', error);
      set({ isAdmin: false, loading: false });
    }
  },
  addProduct: async (product) => {
    const { error } = await supabase
      .from('products')
      .insert([product]);
    if (error) throw error;
  },
  updateProduct: async (id, product) => {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);
    if (error) throw error;
  },
  deleteProduct: async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  addPolicy: async (policy) => {
    const { error } = await supabase
      .from('store_policies')
      .insert([policy]);
    if (error) throw error;
  },
  updatePolicy: async (id, policy) => {
    const { error } = await supabase
      .from('store_policies')
      .update(policy)
      .eq('id', id);
    if (error) throw error;
  },
  deletePolicy: async (id) => {
    const { error } = await supabase
      .from('store_policies')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
}));