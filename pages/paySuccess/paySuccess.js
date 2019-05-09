// pages/paySuccess/paySuccess.js
const app = getApp();
Page({
  data: {
    token: app.globalData.token,//用户token
    course_id: '',//课程ID
    group_id: app.globalData.group_id,//团购ID
    bannerPic: '',
    title: '',
    desc: '',
    up_time: '',
    teacher: '',
    buy_award: '',//购买课程获得的金币
    classTraitList: ['直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款']
  },
  onShow: function(){
    var that = this;
    that.setData({
      token: app.globalData.token,
    });
    that.getClassInfo();
  },
  onLoad: function (option) {
    var that = this;
    that.setData({
      course_id: option.id
    });
    if (option.group_id != '' && option.group_id != 'undefined' && option.group_id != null){
      that.setData({
        group_id: option.group_id
      })
    }
  },
  getClassInfo: function(){
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'course/detail?course_id=' + that.data.course_id,
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        //获取页面栈
        var pages = getCurrentPages();
        if (pages.length > 1) {
          var prePage = pages[pages.length - 2];
          prePage.checkBuy(prePage.data.course_id, prePage.data.token);
        }
        wx.hideToast();
        var code = res.data.code;
        if (code == 0) {
          that.setData({
            bannerPic: res.data.data.cover,
            desc: res.data.data.desc,
            title: res.data.data.name,
            teacher: res.data.data.teacher,
            up_time: app.formatTime(res.data.data.up_time, 'Y-M-D h:m:s'),
            buy_award: res.data.data.buy_award
          });
        } else {
          app.alert(res.data.msg);
        }
      },
      complete: function () {// complete
        // console.log(that.data.token);
        wx.hideToast();
      }
    });
  },
  onShareAppMessage: function () {
    var that = this;
    if (that.data.group_id != '' && that.data.group_id != 'undefined' && that.data.group_id != null){
      return app.share(
        '/pages/extension/extension?course_id=' + that.data.id + '&group_id=' + that.data.group_id + '&shareToken=' + that.data.token,
      )
    } else {
      return app.share(
        '/pages/extension/extension?course_id=' + that.data.id + '&shareToken=' + that.data.token,
      );
    }
  },
})