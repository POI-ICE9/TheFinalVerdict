const sequelize = require('../config/database');
const User = require('./User');
const Soul = require('./Soul');
const Realm = require('./Realm');
const UserSoul = require('./UserSoul');
const Comment = require('./Comment');
const Vote = require('./Vote');
const Friendship = require('./Friendship');
const Message = require('./Message');
const Notification = require('./Notification');
const Ticket = require('./Ticket');
const TicketMessage = require('./TicketMessage');
const TicketTemplate = require('./TicketTemplate');
const Report = require('./Report');
const Permission = require('./Permission');
const StaffLog = require('./StaffLog');
const Setting = require('./Setting');
const Announcement = require('./Announcement');
const Blacklist = require('./Blacklist');
const Achievement = require('./Achievement');
const UserAchievement = require('./UserAchievement');

// Associations
User.hasMany(Realm, { foreignKey: 'user_id', as: 'realms' });
Realm.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(UserSoul, { foreignKey: 'user_id', as: 'userSouls' });
UserSoul.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Soul.hasMany(UserSoul, { foreignKey: 'soul_id', as: 'userSouls' });
UserSoul.belongsTo(Soul, { foreignKey: 'soul_id', as: 'soul' });

Realm.hasMany(UserSoul, { foreignKey: 'realm_id', as: 'userSouls' });
UserSoul.belongsTo(Realm, { foreignKey: 'realm_id', as: 'realm' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

UserSoul.hasMany(Comment, { foreignKey: 'user_soul_id', as: 'comments' });
Comment.belongsTo(UserSoul, { foreignKey: 'user_soul_id', as: 'userSoul' });

UserSoul.hasMany(Vote, { foreignKey: 'user_soul_id', as: 'votes' });
Vote.belongsTo(UserSoul, { foreignKey: 'user_soul_id', as: 'userSoul' });

User.hasMany(Vote, { foreignKey: 'user_id', as: 'votes' });
Vote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Friendship, { foreignKey: 'user_id', as: 'friendships' });
Friendship.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Friendship.belongsTo(User, { foreignKey: 'friend_id', as: 'friend' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Ticket, { foreignKey: 'user_id', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

Ticket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });
TicketMessage.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });

User.hasMany(TicketMessage, { foreignKey: 'sender_id', as: 'ticketMessages' });
TicketMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(TicketTemplate, { foreignKey: 'created_by', as: 'templates' });
TicketTemplate.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reported_user_id', as: 'reportedUser' });
Report.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

User.hasMany(StaffLog, { foreignKey: 'staff_id', as: 'staffLogs' });
StaffLog.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

User.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });
Announcement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(Blacklist, { foreignKey: 'added_by', as: 'blacklistEntries' });
Blacklist.belongsTo(User, { foreignKey: 'added_by', as: 'addedBy' });

User.hasMany(UserAchievement, { foreignKey: 'user_id', as: 'achievements' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Achievement.hasMany(UserAchievement, { foreignKey: 'achievement_id', as: 'userAchievements' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id', as: 'achievement' });

module.exports = {
  sequelize,
  User,
  Soul,
  Realm,
  UserSoul,
  Comment,
  Vote,
  Friendship,
  Message,
  Notification,
  Ticket,
  TicketMessage,
  TicketTemplate,
  Report,
  Permission,
  StaffLog,
  Setting,
  Announcement,
  Blacklist,
  Achievement,
  UserAchievement
};