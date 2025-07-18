const bcrypt = require('bcryptjs');

console.log('🔧 Gerando hash para admin...');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 12);

console.log('✅ Hash gerado:', hash);
console.log('✅Teste de validação:', bcrypt.compareSync(password, hash));

console.log('📝 Execute este comando SQL no seu banco:');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@lunexa.com';`);
console.log('\n🔑 Credenciais do admin:');
console.log('Email: admin@lunexa.com');
console.log('Senha: admin123'); 