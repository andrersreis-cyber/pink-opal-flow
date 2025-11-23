// Script temporário para criar usuário admin
// Execute com: node scripts/create-admin.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uyffrwuerhwrpkyiydvd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requer service_role key

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não definida');
  console.log('\nPara criar o admin, execute:');
  console.log('1. Vá para Supabase Dashboard > Project Settings > API');
  console.log('2. Copie a "service_role" key (secret)');
  console.log('3. Execute: SUPABASE_SERVICE_ROLE_KEY=sua_key node scripts/create-admin.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('🔐 Criando usuário admin...\n');
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@pinkopal.dev',
      password: 'PinkOpal2024!',
      email_confirm: true,
      user_metadata: {
        nome: 'Liz Martins',
        role: 'admin'
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('\n📧 Email:', data.user.email);
    console.log('🔑 Senha: PinkOpal2024!');
    console.log('👤 Nome: Liz Martins');
    console.log('🎭 Role: admin');
    console.log('\n🔗 UUID:', data.user.id);
    
    // Verificar se profile foi criado
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.log('\n⚠️  Profile não foi criado automaticamente. Criando manualmente...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: 'admin@pinkopal.dev',
          nome: 'Liz Martins',
          role: 'admin',
          ativo: true
        });

      if (insertError) {
        console.error('❌ Erro ao criar profile:', insertError.message);
      } else {
        console.log('✅ Profile criado manualmente!');
      }
    } else {
      console.log('\n✅ Profile criado automaticamente pelo trigger!');
      console.log('📋 Profile:', profile);
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

createAdmin();

