var marked = require('marked');
var Comment = require('../lib/mongo').Comment;

// 將 comment 的 content 從markdown 轉乘 html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content);
      return comment;
    });
  }
});

module.exports = {
  // 創建一個新留言
  create: function create(comment) {
    return Comment.create(comment).exec();
  },

  // 透過用戶id和留言id 刪除一個留言 
  delCommentById: function delCommentById(commentId, author) {
    return Comment.remove({ author: author, _id: commentId }).exec();
  },

  // 透過文章id 刪除下面留言 
  delCommentsByPostId: function delCommentsByPostId(postId) {
    return Comment.remove({ postId: postId }).exec();
  },

  // 透過文章id 獲得該文章下所有留言 按留言創建時間升序排列
  getComments: function getComments(postId) {
    return Comment
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },

  // 透過文章 id 獲得該文下留言數 
  getCommentsCount: function getCommentsCount(postId) {
    return Comment.count({ postId: postId }).exec();
  }
};
