var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite')(__dirname);
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

// 設置模板目錄
app.set('views', path.join(__dirname, 'views'));
// 設置板模引擎為 ejs
app.set('view engine', 'ejs');

// 設置靜態文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session middleware
app.use(session({
  name: config.session.key,// 設置 cookie 中保存 session id 的字段名稱
  secret: config.session.secret,// 透過設置  secret 來計算 hash 值並且放在 cookie 中，使產生的 signedCookie 防篡改
  resave: true,// 强制更新 session
  saveUninitialized: false,// 設置为 false，强制建立一個 session，即使用戶未登入
  cookie: {
    maxAge: config.session.maxAge// 設立一個時間 時間過後cookie 中的session id 自動刪除 
  },
  store: new MongoStore({// 將 session 存到 mongodb
    url: config.mongodb// mongodb 地址
  })
}));
// flash middleware 用來顯示通知 
app.use(flash());
// 處理表單和文件上傳的middleware 
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),// 上傳的文件目錄
  keepExtensions: true
}));

// 設置板模的變數
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加板模的三個變數
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

// 正常請求日誌
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));
// 路由
routes(app);
// 錯誤請求的blog

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

// error page
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  });
});

if (module.parent) {
  module.exports = app;
} else {
 
  app.listen(config.port, function () {
    console.log(`${pkg.name} listening on port ${config.port}`);
  });
}
