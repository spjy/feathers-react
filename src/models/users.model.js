// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient');
  const users = new mongooseClient.Schema({
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String
    },
    session: {
      server: {
        type: String,
        ref: 'Server',
        index: true,
      },
      department: {
        type: String,
        ref: 'Community.departments',
        index: true,
      },
      callsign: {
        type: String,
        maxlength: 0,
      },
      subdepartment: {
        type: Number,
        default: 0,
      },
      connected: {
        type: Date,
        default: Date.now,
      },
    },

  }, {
    timestamps: true
  });

  return mongooseClient.model('users', users);
};
