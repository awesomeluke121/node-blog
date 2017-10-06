var User = require('../lib/mongo').User;

module.exports = {
  // 註冊一個新用戶
  create: function create(user) {
    return User.create(user).exec();
  },

  // 透過用戶獲得訊息
  getUserByName: function getUserByName(name) {
    return User
      .findOne({ name: name })
      .addCreatedAt()
      .exec();
  }
};
