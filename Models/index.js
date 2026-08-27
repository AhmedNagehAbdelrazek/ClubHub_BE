const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// Manually import all models
const User = require('./user.js');
const Club = require('./Club.js');
const Court = require('./Court.js');
const Sport = require('./Sport.js');
const ClubSport = require('./ClubSport.js');
const CourtSupportedSport = require('./CourtSupportedSport.js');
const Membership = require('./Membership.js');
const CourtBooking = require('./CourtBooking.js');
const Match = require('./Match.js');
const MatchRegistration = require('./MatchRegistration.js');
const Training = require('./Training.js');
const TrainingRegistration = require('./TrainingRegistration.js');
const Event = require('./Event.js');
const EventParticipant = require('./EventParticipant.js');
const Notification = require('./Notification.js');
const NotificationRecipient = require('./NotificationRecipient.js');
const PointsLedger = require('./PointsLedger.js');
const Redemption = require('./Redemption.js');
const Reward = require('./Reward.js');
const PlayerRating = require('./PlayerRating.js');
const ExternalLink = require('./ExternalLink.js');
const StaticPage = require('./StaticPage.js');
const Survey = require('./Survey.js');
const SurveyQuestion = require('./SurveyQuestion.js');
const SurveyResponse = require('./SurveyResponse.js');
const FAQ = require('./FAQ.js');
const PrivateQuestion = require('./PrivateQuestion.js');

// User associations
User.hasMany(Membership, { foreignKey: 'user_id', as: 'memberships' });
User.hasMany(MatchRegistration, { foreignKey: 'user_id', as: 'matchRegistrations' });
User.hasMany(TrainingRegistration, { foreignKey: 'user_id', as: 'trainingRegistrations' });
User.hasMany(EventParticipant, { foreignKey: 'user_id', as: 'eventParticipations' });
User.hasMany(PlayerRating, { foreignKey: 'player_id', as: 'receivedRatings' });
User.hasMany(PlayerRating, { foreignKey: 'rated_by', as: 'givenRatings' });
User.hasMany(PointsLedger, { foreignKey: 'user_id', as: 'pointsLedger' });
User.hasMany(Redemption, { foreignKey: 'user_id', as: 'redemptions' });
User.hasMany(NotificationRecipient, { foreignKey: 'user_id', as: 'notificationRecipients' });

// Club associations
Club.hasMany(Court, { foreignKey: 'club_id', as: 'courts' });
Club.hasMany(Membership, { foreignKey: 'club_id', as: 'memberships' });
Club.hasMany(ClubSport, { foreignKey: 'club_id', as: 'clubSports' });
Club.hasMany(Event, { foreignKey: 'club_id', as: 'events' });
Club.hasMany(Notification, { foreignKey: 'club_id', as: 'notifications' });
Club.hasMany(PointsLedger, { foreignKey: 'club_id', as: 'pointsLedger' });
Club.hasMany(Reward, { foreignKey: 'club_id', as: 'rewards' });
Club.hasMany(StaticPage, { foreignKey: 'club_id', as: 'staticPages' });
Club.hasMany(ExternalLink, { foreignKey: 'club_id', as: 'externalLinks' });
Club.hasMany(Survey, { foreignKey: 'club_id', as: 'surveys' });
Club.hasMany(FAQ, { foreignKey: 'club_id', as: 'faqs' });
Club.hasMany(PrivateQuestion, { foreignKey: 'club_id', as: 'privateQuestions' });
Club.belongsToMany(Sport, { through: ClubSport, foreignKey: 'club_id', otherKey: 'sport_id', as: 'sports' });
Sport.belongsToMany(Club, { through: ClubSport, foreignKey: 'sport_id', otherKey: 'club_id', as: 'clubs' });

// Court associations
Court.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Court.belongsToMany(Sport, {
  through: CourtSupportedSport,
  foreignKey: 'court_id',
  otherKey: 'sport_id',
  as: 'sports',
});
Court.hasMany(Match, { foreignKey: 'court_id', as: 'matches' });
Court.hasMany(Training, { foreignKey: 'court_id', as: 'trainings' });
Court.hasMany(Event, { foreignKey: 'court_id', as: 'events' });

// Sport associations
Sport.hasMany(ClubSport, { foreignKey: 'sport_id', as: 'clubSports' });
Sport.hasMany(CourtSupportedSport, { foreignKey: 'sport_id', as: 'courtSupportedSports' });
Sport.belongsToMany(Court, {
  through: CourtSupportedSport,
  foreignKey: 'sport_id',
  otherKey: 'court_id',
  as: 'courts',
});
Sport.hasMany(Match, { foreignKey: 'sport_id', as: 'matches' });

// ClubSport associations
ClubSport.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
ClubSport.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });

// CourtSupportedSport associations
CourtSupportedSport.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });
CourtSupportedSport.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });

// Membership associations
Membership.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Membership.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Membership.belongsTo(User, { foreignKey: 'decision_by', as: 'decidedBy' });

// Match associations
Match.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Match.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });
Match.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Match.hasMany(MatchRegistration, { foreignKey: 'match_id', as: 'registrations' });
Match.hasMany(PlayerRating, { foreignKey: 'match_id', as: 'ratings' });

// Court booking associations
CourtBooking.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
CourtBooking.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });
CourtBooking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
CourtBooking.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Club.hasMany(CourtBooking, { foreignKey: 'club_id', as: 'bookings' });
Court.hasMany(CourtBooking, { foreignKey: 'court_id', as: 'bookings' });
User.hasMany(CourtBooking, { foreignKey: 'user_id', as: 'courtBookings' });

// MatchRegistration associations
MatchRegistration.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
MatchRegistration.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Training associations
Training.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Training.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });
Training.belongsTo(Sport, { foreignKey: 'sport_id', as: 'sport' });
Training.belongsTo(User, { foreignKey: 'trainer_user_id', as: 'trainer' });
Training.hasMany(TrainingRegistration, { foreignKey: 'training_id', as: 'registrations' });

// TrainingRegistration associations
TrainingRegistration.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });
TrainingRegistration.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Event associations
Event.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Event.belongsTo(Court, { foreignKey: 'court_id', as: 'court' });
Event.hasMany(EventParticipant, { foreignKey: 'event_id', as: 'participants' });

// EventParticipant associations
EventParticipant.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });
EventParticipant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Notification associations
Notification.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Notification.hasMany(NotificationRecipient, { foreignKey: 'notification_id', as: 'recipients' });

// NotificationRecipient associations
NotificationRecipient.belongsTo(Notification, { foreignKey: 'notification_id', as: 'notification' });
NotificationRecipient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// PointsLedger associations
PointsLedger.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PointsLedger.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

// Redemption associations
Redemption.belongsTo(Reward, { foreignKey: 'reward_id', as: 'reward' });
Redemption.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Redemption.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Redemption.belongsTo(User, { foreignKey: 'decided_by', as: 'decider' });

// Reward associations
Reward.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Reward.hasMany(Redemption, { foreignKey: 'reward_id', as: 'redemptions' });

// PlayerRating associations
PlayerRating.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
PlayerRating.belongsTo(Match, { foreignKey: 'match_id', as: 'match' });
PlayerRating.belongsTo(User, { foreignKey: 'player_id', as: 'player' });
PlayerRating.belongsTo(User, { foreignKey: 'rated_by', as: 'rater' });

// ExternalLink associations
ExternalLink.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

// StaticPage associations
StaticPage.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

// Survey associations
Survey.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
Survey.hasMany(SurveyQuestion, { foreignKey: 'survey_id', as: 'questions' });
Survey.hasMany(SurveyResponse, { foreignKey: 'survey_id', as: 'responses' });

// SurveyQuestion associations
SurveyQuestion.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });
SurveyQuestion.hasMany(SurveyResponse, { foreignKey: 'question_id', as: 'responses' });

// SurveyResponse associations
SurveyResponse.belongsTo(Survey, { foreignKey: 'survey_id', as: 'survey' });
SurveyResponse.belongsTo(SurveyQuestion, { foreignKey: 'question_id', as: 'question' });
SurveyResponse.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// FAQ associations
FAQ.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

// PrivateQuestion associations
PrivateQuestion.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });
PrivateQuestion.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PrivateQuestion.belongsTo(User, { foreignKey: 'answered_by', as: 'answerer' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Club,
  Court,
  Sport,
  ClubSport,
  CourtSupportedSport,
  Membership,
  CourtBooking,
  Match,
  MatchRegistration,
  Training,
  TrainingRegistration,
  Event,
  EventParticipant,
  Notification,
  NotificationRecipient,
  PointsLedger,
  Redemption,
  Reward,
  PlayerRating,
  ExternalLink,
  StaticPage,
  Survey,
  SurveyQuestion,
  SurveyResponse,
  FAQ,
  PrivateQuestion,
};
