var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登入頁
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signin');
});

// POST /signin 帳號登錄
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var password = req.fields.password;

  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        req.flash('error', '找不到該用戶');
        return res.redirect('back');
      }
      // 檢查密碼
      if (sha1(password) !== user.password) {
        req.flash('error', '帳號或密碼錯誤');
        return res.redirect('back');
      }
      req.flash('success', '登錄成功');
      // 把用戶訊息傳入 session
      delete user.password;
      req.session.user = user;
      // 跳主頁
      res.redirect('/posts');
    })
    .catch(next);
});

module.exports = router;
