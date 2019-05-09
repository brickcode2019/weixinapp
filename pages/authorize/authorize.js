//authorize.js
//获取应用实例
const app = getApp()
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    getUserInfoFail: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    address: '',
  },
  //事件处理函数
  onShow: function () {
    this.login();
  },
  onLoad: function (option) {
    if (option.address != 'undefined' && option.address != '' && option.address != null) {
      var address = decodeURIComponent(option.address);
    } else {
      var address = 'open-class';
    }
    this.setData({
      address: address,
    })
    if (app.globalData.userInfo != '' && app.globalData.userInfo != 'undefined' && app.globalData.userInfo != null) {
      console.log(app.globalData.userInfo);
      console.log(1)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      console.log(2)
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log(12)
        console.log(res);
        app.globalData.userInfo = res.userInfo;
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      console.log(3)
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          console.log(11111);
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        },
        fail: res => {
          console.log(4);
          this.setData({
            getUserInfoFail: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(5);
    console.log(e)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo;
      wx.setStorageSync('brickcode_userInfo', e.detail.userInfo);
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      });
      //平台登录
      if (this.data.address != '' && this.data.address != 'undefined' && this.data.address != null) {
        if (this.data.address == 'extension') {
          //获取页面栈
          var pages = getCurrentPages();
          if (pages.length > 1) {
            var prePage = pages[pages.length - 2];
            prePage.getAuditInfo();
            prePage.getBuyList();
            if (prePage.data.group_id != '' && prePage.data.group_id != 'undefined' && prePage.data.group_id != null) {
              prePage.getGroupInfo();
            } else {
              prePage.getCourseInfo();
            }
          }
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.switchTab({
            url: '../index/index',
          });
        }
      }
    } else {
      this.openSetting();
    }
  },
  login: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code;
        console.log(code);
        wx.getUserInfo({
          success: function (res) {
            console.log(7);
            app.globalData.userInfo = res.userInfo
            that.setData({
              getUserInfoFail: false,
              userInfo: res.userInfo,
              hasUserInfo: true
            });
          },
          fail: function (res) {
            console.log(8);
            console.log(res);
            that.setData({
              getUserInfoFail: true
            })
          }
        })
      }
    })
  },
  //跳转设置页面授权
  openSetting: function () {
    var that = this
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          console.log(9);
          //尝试再次登录
          that.login()
        }
      })
    } else {
      console.log(10);
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用哦~ 错过授权页面的处理方法：删除小程序->重新搜索进入->点击授权按钮'
      })
    }
  }
})