import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ayervfasdkclxtpzscnk.supabase.co';
const supabaseKey = 'sb_publishable_CPx22ZvkWWCoMsrnsoaBBA_CTcsVKHx';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage, // Agora funciona perfeito na Web, iOS e Android!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});