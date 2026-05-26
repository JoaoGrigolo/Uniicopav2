import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ayervfasdkclxtpzscnk.supabase.co';
const supabaseKey = 'sb_publishable_CPx22ZvkWWCoMsrnsoaBBA_CTcsVKHx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = `test.unicopa+${Date.now()}@gmail.com`;
  const password = 'Testpass123!';

  console.log('Criando usuário:', email);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error('Erro ao criar usuário:', error.message || error);
    process.exit(1);
  }
  console.log('SignUp retornou:', data);
  console.log('OBS: pode ser necessário confirmar e-mail dependendo das configurações do projeto Supabase.');
}

run();
