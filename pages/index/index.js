//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    autoplay: true,
    interval: 5000,
    duration: 200,
    banners: [],//轮播数组
    token: app.globalData.token,//用户token
    userInfo: {},//用户信息
    windowHeight: '',
    windowWidth: '',
    tabLists: '',//tab切换列表
    hasUserInfo: false,
    getUserInfoFail: false,
    current_number: '',//默认展示的页签ID
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onShow: function (e) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          token: app.globalData.token,
        });
      }
    })
  },
  onLoad: function () {
    var that = this;
    console.log(app.globalData.userInfo);
    console.log(app.globalData.role);
    if (app.globalData.userInfo == '' || app.globalData.userInfo == 'undefined' || app.globalData.userInfo == null) {
      console.log(1);
      wx.redirectTo({
        url: '../authorize/authorize',
      })
    } else {
      console.log(3);
      that.getBanners();
      that.getTabList();
    }
  },
  //获取轮播图片
  getBanners() {
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'banner/get',
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        var code = res.data.code;
        if (code == 0) {
          var list = res.data.data;

          console.log(list)
          that.setData({
            banners: list
          })
        } else {
          app.alert(res.data.msg);
        }
      },
      complete: function () {// complete
        wx.hideToast();
      }
    })
  },
  // 获取tab列表
  getTabList: function(){
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'course/recommend',
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        var code = res.data.code;
        if (code == 0) {
          var list = res.data.data;
          console.log(list);
          console.log(list[0].course_id);
          that.setData({
            tabLists: list,
            current_number: list[0].course_id
          })
        } else {
          app.alert(res.data.msg);
        }
      },
      complete: function () {// complete
        wx.hideToast();
      }
    })
  },
  // 分享
  onShareAppMessage: function () {
    var that = this;
    return app.share(
      '/pages/index/index?shareToken=' + that.data.token,
    );
  },
})
