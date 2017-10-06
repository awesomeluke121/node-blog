var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 註冊
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// POST /signup 用戶註冊
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var gender = req.fields.gender;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var password = req.fields.password;
  var repassword = req.fields.repassword;

  // 校正
  try {
    if (!(name.length >= 4 && name.length <= 10)) {
      throw new Error('帳號請在4-10字元');
    }
    if (['m', 'f', 'x'].indexOf(gender) === -1) {
      throw new Error('性别只能是 m、f 或 x');
    }
    if (!(bio.length >= 1 && bio.length <= 30)) {
      throw new Error('個人簡介請在30字內');
    }
    if (!req.files.avatar.name) {
      throw new Error('缺大頭貼喔！');
    }
    if (password.length < 6) {
      throw new Error('密碼至少要六個字');
    }
    if (password !== repassword) {
      throw new Error('很抱歉你的兩次密碼輸入不同');
    }
  } catch (e) {
    // 註冊失敗
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/signup');
  }

  // 明文密碼加密
  password = sha1(password);

  //待寫入資料庫的用戶訊息 
  var user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  };
  // 把用戶的資料寫入mongodb
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb之後的值，包含 _id
      user = result.ops[0];
      // 將用戶訊息存入 session
      delete user.password;
      req.session.user = user;
      // 寫入 flash
      req.flash('success', '註冊成功');
      // 跳转到首页
      res.redirect('/posts');
    })
    .catch(function (e) {
      // 註冊失敗
      fs.unlink(req.files.avatar.path);
      // 用戶名重複跳回註冊頁不是主頁
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用戶已存在');
        return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;
