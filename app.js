//app.js
var utils = require('./utils/util')
App({
  onLaunch: function (option) {
    // 登录
    if (option.query.shareToken != 'undefined') {
      this.globalData.shareToken = option.query.shareToken;
      wx.setStorageSync('brickcode_shareToken', option.query.shareToken);
    }
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.setStorage({
          key: "loginCode",
          data: res.code,
          success: res => {
            console.log(res)
          },
          fail: res => {
            console.log(res)
          },
          complete: res => {
          },
        });
        wx.getStorage({
            key: "loginCode",
            success: res => {
              console.log(res.data);

              this.globalData.loginCode = res.data;
            },
            fail: res => {
              console.log(res)
            },
            complete: res => {
            }
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onLoad: function(){
    app.userInfoReadyCallback = res => {
      console.log('userInfoReadyCallback: ', res);
      console.log('获取用户信息成功');
      this.setData({
        userInfo: res
      })
    };
  },
  share: function (path, success = '', fail = '', title = '', imageUrl = '') {
    var option = {};
    var that = this;
    option.path = path;
    option.success = function (res) {
      console.log('分享信息')
      console.log(res)
      // 获取转发详细信息
      if (res.shareTickets != 'undefined' && res.shareTickets[0] != 'undefined' && that.globalData.user != 'undefined') {//存在用户信息
        that.getShareInfo(res.shareTickets[0], path);
      } else if (that.globalData.user != 'undefined') {//存在用户信息
        that.saveshare(path);
      }
      //执行成功函数
      if (typeof (success) == 'function') {
        success(res);
      }
    };
    if (typeof (fail) == 'function') {
      option.fail = fail;
    }
    if (imageUrl == '') {
      option.imageUrl = imageUrl;
    }
    option.title = title == '' ? that.globalData.appname : title;
    return option;
  },
  //获取转发详情
  getShareInfo: function (ticket, action) {
    var that = this;
    wx.getShareInfo({
      shareTicket: ticket,
      success(res) {
        var encrypt = res.encryptedData
        var iv = res.iv
        wx.request({
          url: that.globalData.baseUrl + 'wx/share',
          data: {
            encrypt: encrypt,
            iv: iv,
            sessionKey: that.globalData.userOpen.session_key
          },
          success: function (res) {
            var data = JSON.parse(res.data.trim());
            that.globalData.openGid = data.openGId;
            if (typeof (action) == 'string') {//保存分享记录
              that.saveshare(action);
            } else if (typeof (action) == 'function') {//判断回调函数
              action();
            }
          }
        })
      },
      fail() { },
      complete() { }
    });
  },
  //保存转发信息
  saveshare: function (path) {
    var that = this;
    wx.request({
      url: that.globalData.baseUrl + 'wx/share?path=' + encodeURIComponent(path) + '&shareToken=' + that.globalData.token,
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {}
    });
  },
  // 加载
  loading: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
  },
  // 弹框
  alert(content) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false
    })
    return this
  },
  globalData: {
    token: wx.getStorageSync('brickcode_token') ? wx.getStorageSync('brickcode_token') : '',//用户token
    role: wx.getStorageSync('brickcode_role') ? wx.getStorageSync('brickcode_role') : '',//用户角色 1为学员 2为用户
    userInfo: wx.getStorageSync('brickcode_userInfo') ? wx.getStorageSync('brickcode_userInfo') : null,//用户信息
    shareToken: '',//用户接受分享token
    group_id: '',//用户拼团成功后的Group_id
    loginCode: '',//用户登录成功后返回的code，用于向后台传输从而产生完整的用户
    baseUrl:'https://api.brickcode.com.cn/',//原始路径
    appname: '贝壳在线编程',//小程序名字
    appid: 'wx68dc0b99b1e9a7a9', //填写微信小程序appid
    secret: '7cea247606315d870d145193dfdd37d8' //填写微信小程序secret
  },

  // 小程序动画通用JS
  // 渐入，渐出实现
  show: function (that, param, opacity) {
    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 3000,
      timingFunction: 'ease',
    });
    //var animation = this.animation
    animation.opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },

  // 滑动渐入渐出
  slideupshow: function (that, param, px, opacity) {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.translateY(px).opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },

  // 向右滑动渐入渐出
  sliderightshow: function (that, param, px, opacity) {
    var animation = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease',
    });
    animation.translateX(px).opacity(opacity).step()
    //将param转换为key
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    //设置动画
    that.setData(json)
  },

  //数据转化
  formatNumber: function(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  /**
   * 时间戳转化为年 月 日 时 分 秒
   * number: 传入时间戳
   * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
  */
  formatTime: function(number, format) {
    var that = this;
    var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
    var returnArr = [];
    var date = new Date(number * 1000);
    returnArr.push(date.getFullYear());
    returnArr.push(that.formatNumber(date.getMonth() + 1));
    returnArr.push(that.formatNumber(date.getDate()));
    returnArr.push(that.formatNumber(date.getHours()));
    returnArr.push(that.formatNumber(date.getMinutes()));
    returnArr.push(that.formatNumber(date.getSeconds()));
    for(var i in returnArr)
    {
      format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
  },
})