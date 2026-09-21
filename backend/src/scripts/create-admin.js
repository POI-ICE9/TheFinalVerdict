require('dotenv').config();
const { sequelize, User, Realm } = require('../src/models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = process.env.ADMIN_EMAIL;
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('❌ ADMIN_EMAIL e ADMIN_PASSWORD richiesti nel .env');
      process.exit(1);
    }

    const [admin, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        username,
        password_hash: await bcrypt.hash(password, 10),
        role: 'founder',
        status: 'active',
        email_verified: true
      }
    });

    if (!created) {
      await admin.update({ role: 'founder', status: 'active' });
      console.log('⚠️  Admin già esistente, aggiornato');
    } else {
      console.log('✅ Admin creato');
    }

    // Crea i regni
    const realms = await Realm.findAll({ where: { user_id: admin.id } });
    if (realms.length === 0) {
      await Realm.bulkCreate([
        { user_id: admin.id, realm_type: 'inferno', custom_name: 'Il Mio Inferno' },
        { user_id: admin.id, realm_type: 'purgatorio', custom_name: 'Il Mio Purgatorio' },
        { user_id: admin.id, realm_type: 'paradiso', custom_name: 'Il Mio Paradiso' }
      ]);
      console.log('✅ Regni admin creati');
    }

    console.log('\n🎉 Admin Founder pronto!');
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}`);
    console.log(`   Ruolo: founder`);
    
    process.exit(0);
  } catch (error) {
    console.error(' Errore:', error);
    process.exit(1);
  }
};

createAdmin();