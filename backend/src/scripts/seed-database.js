require('dotenv').config();
const { sequelize, Soul, Setting, Achievement, Permission } = require('../src/models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Settings di default
    const defaultSettings = [
      { key: 'platform_name', value: 'TheFinalVerdict', category: 'general' },
      { key: 'max_souls_per_user', value: '50', category: 'limits' },
      { key: 'min_motivation_length', value: '50', category: 'limits' },
      { key: 'max_motivation_length', value: '5000', category: 'limits' },
      { key: 'contests_enabled', value: 'true', category: 'features' },
      { key: 'forum_enabled', value: 'true', category: 'features' },
      { key: 'leaderboard_enabled', value: 'true', category: 'features' },
      { key: 'messages_enabled', value: 'true', category: 'features' },
      { key: 'push_notifications_enabled', value: 'true', category: 'features' },
      { key: 'gamification_enabled', value: 'true', category: 'features' },
      { key: 'sla_urgent_hours', value: '1', category: 'tickets' },
      { key: 'sla_high_hours', value: '4', category: 'tickets' },
      { key: 'sla_medium_hours', value: '24', category: 'tickets' },
      { key: 'sla_low_hours', value: '72', category: 'tickets' }
    ];

    for (const setting of defaultSettings) {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }
    console.log('✅ Settings seeded');

    // Achievement di esempio
    const achievements = [
      { name: 'Primo Giudizio', description: 'Giudica la tua prima anima', icon: '⚖️', requirement_type: 'souls_judged', requirement_value: 1, xp_reward: 50 },
      { name: 'Giudice Esperto', description: 'Giudica 50 anime', icon: '👨‍⚖️', requirement_type: 'souls_judged', requirement_value: 50, xp_reward: 500 },
      { name: 'Demiurgo', description: 'Giudica 500 anime', icon: '', requirement_type: 'souls_judged', requirement_value: 500, xp_reward: 2000 },
      { name: 'Livello 10', description: 'Raggiungi il livello 10', icon: '🏆', requirement_type: 'level', requirement_value: 10, xp_reward: 1000 }
    ];

    for (const ach of achievements) {
      await Achievement.findOrCreate({
        where: { name: ach.name },
        defaults: ach
      });
    }
    console.log('✅ Achievements seeded');

    // Permissions
    const permissions = [
      { name: 'manage_users', description: 'Gestire utenti', category: 'users' },
      { name: 'ban_users', description: 'Bannare utenti', category: 'users' },
      { name: 'moderate_content', description: 'Moderare contenuti', category: 'moderation' },
      { name: 'manage_tickets', description: 'Gestire ticket', category: 'tickets' },
      { name: 'manage_staff', description: 'Gestire staff', category: 'staff' },
      { name: 'manage_settings', description: 'Gestire impostazioni', category: 'settings' },
      { name: 'view_analytics', description: 'Vedere analytics', category: 'analytics' },
      { name: 'manage_souls', description: 'Gestire database anime', category: 'souls' }
    ];

    for (const perm of permissions) {
      await Permission.findOrCreate({
        where: { name: perm.name },
        defaults: perm
      });
    }
    console.log('✅ Permissions seeded');

    // Anime di esempio
    const sampleSouls = [
      { name: 'Giulio Cesare', slug: 'giulio-cesare', category: 'historical', epoch: 'Antica Roma', nationality: 'Romana', biography: 'Dittatore romano', status: 'approved' },
      { name: 'Cleopatra', slug: 'cleopatra', category: 'historical', epoch: 'Antico Egitto', nationality: 'Egizia', biography: 'Ultima regina tolemaica', status: 'approved' },
      { name: 'Leonardo da Vinci', slug: 'leonardo-da-vinci', category: 'historical', epoch: 'Rinascimento', nationality: 'Italiana', biography: 'Genio universale', status: 'approved' },
      { name: 'Napoleone Bonaparte', slug: 'napoleone-bonaparte', category: 'historical', epoch: 'XIX Secolo', nationality: 'Francese', biography: 'Imperatore dei Francesi', status: 'approved' },
      { name: 'Marie Curie', slug: 'marie-curie', category: 'historical', epoch: 'XIX-XX Secolo', nationality: 'Polacca/Francese', biography: 'Pioniera della radioattività', status: 'approved' },
      { name: 'Albert Einstein', slug: 'albert-einstein', category: 'historical', epoch: 'XX Secolo', nationality: 'Tedesca/Statunitense', biography: 'Fisico teorico', status: 'approved' },
      { name: 'Dart Fener', slug: 'dart-fener', category: 'fictional', epoch: 'XX Secolo', nationality: '-', biography: 'Signore dei Sith', status: 'approved' },
      { name: 'Harry Potter', slug: 'harry-potter', category: 'fictional', epoch: 'XX Secolo', nationality: 'Britannica', biography: 'Il ragazzo che è sopravvissuto', status: 'approved' }
    ];

    for (const soul of sampleSouls) {
      await Soul.findOrCreate({
        where: { slug: soul.slug },
        defaults: { ...soul, approved_at: new Date() }
      });
    }
    console.log('✅ Sample souls seeded');

    console.log('\n🎉 Database seeding completato!');
    process.exit(0);
  } catch (error) {
    console.error(' Errore seeding:', error);
    process.exit(1);
  }
};

seedDatabase();