//如果跳頁失敗顯示為登入重回登入面

module.exports = {
  checkLogin: function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登錄'); 
      return res.redirect('/signin');
    }
    next();
  },

  checkNotLogin: function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登入，轉頁中'); 
      return res.redirect('back');//返回前一個頁面
    }
    next();
  }
};
