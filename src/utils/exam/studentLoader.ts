
import { supabase } from '../../lib/supabase';

export const getAllStudentsFromDatabase = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('name');

    if (error) {
      console.error('Error loading students:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStudentsFromDatabase:', error);
    return [];
  }
};
