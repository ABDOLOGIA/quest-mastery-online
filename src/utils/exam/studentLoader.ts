
import { supabase } from '../../lib/supabase';

export const getAllStudentsFromDatabase = async (): Promise<any[]> => {
  try {
    console.log('Loading all students from database...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading students:', error);
      throw error;
    }

    console.log('Students loaded from database:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getAllStudentsFromDatabase:', error);
    return [];
  }
};
