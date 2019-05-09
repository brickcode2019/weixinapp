// pages/extension/extension.js
const app = getApp();
Page({
  data: {
    course_id: 1,//推广页的课程ID
    group_id: app.globalData.group_id,//拼团ID
    shareToken: app.globalData.shareToken,//分享者token
    buyLists: [],//拼团成功列表
    token: app.globalData.token,//用户token
    hasBuy: false,//是否已购买该课程
    isPlay: false,//是否播放视频
    commanderPic: '',//开团人头像
    commander: '',//开团人用户名
    coursePic: '',//课程缩略图
    courseTitle: '',//课程名
    coursePrice: '',//课程原价
    courseGroupPrice: '',//课程拼团价
    avatar_list: '',//参与拼团用户列表
    people: '',//剩余拼团名额
    audit: '',//审核开关，0为审核完成展示购买按钮；1为审核中隐藏购买按钮
  },
  onShow: function() {
    var that = this;
    that.getBuyList();
    var token = (app.globalData.token != '' && app.globalData.token != 'undefined' && app.globalData.token != null) ? app.globalData.token : 0;
    var group_id = (app.globalData.group_id != '' && app.globalData.group_id != 'undefined' && app.globalData.group_id != null) ? app.globalData.group_id : '';
    that.setData({
      token: token
    });
    if (that.data.course_id && that.data.token) {
      that.checkBuy(that.data.course_id, that.data.token);
    }
    if ((token != '' && token != 'undefined' && token != null) && (group_id != '' && group_id != 'undefined' && group_id != null)){
      that.getGroupInfo();
    }
  },
  onLoad: function(options) {
    let that = this;
    let course_id = decodeURIComponent(options.course_id);
    let group_id = decodeURIComponent(options.group_id);
    // 推广课程ID判断
    if (course_id != '' && course_id != 'undefined' && course_id != null){
      that.setData({
        course_id: course_id
      })
    } else {
      that.setData({
        course_id: 1
      })
    }
    // 拼团ID判断
    if (group_id != '' && group_id != 'undefined' && group_id != null) {
      that.setData({
        group_id: group_id
      })
    } else {
      that.setData({
        group_id: ''
      })
    }
    // 判断是否授权
    if (app.globalData.userInfo == '' || app.globalData.userInfo == 'undefined' || app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../authorize/authorize?address=extension',
      })
    } else {
      that.getAuditInfo();
      that.getBuyList();
      if (group_id != '' && group_id != 'undefined' && group_id != null) {
        that.getGroupInfo();
      } else {
        that.getCourseInfo();
      }
    }
  },
  playVideo: function() {
    this.setData({
      isPlay: true
    })
  },
  hideVideo: function() {
    this.setData({
      isPlay: false
    })
  },
  //分享页面 
  onShareAppMessage: function() {
    var that = this;
    if (that.data.group_id != '' && that.data.group_id != 'undefined' && that.data.group_id != null) {
      return app.share(
        '/pages/extension/extension?course_id=' + that.data.id + '&group_id=' + that.data.group_id + '&shareToken=' + that.data.token,
      )
    } else {
      return app.share(
        '/pages/extension/extension?course_id=' + that.data.course_id + '&shareToken=' + that.data.token,
      );
    }
  },
  // 校验该课程是否购买
  checkBuy: function(course_id, token) {
    var that = this;
    var token = token;
    var course_id = course_id;
    wx.request({
      url: app.globalData.baseUrl + 'course/check_buy?course_id=' + course_id + '&token=' + token,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        if (res.data.code == '700') {
          that.setData({
            hasBuy: true
          });
        } else if (res.data.code == '0') {
          that.setData({
            hasBuy: false
          });
        } else {
          console.log(res.data.code);
        }
      }
    })
  },
  // 获取底部跑马灯列表
  getBuyList:function() {
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'group/list',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      data: {
        course_id: that.data.course_id
      },
      success: function (res) {
        if (res.data.code == '0') {
          var list = res.data.data;
          that.setData({
            buyLists: list
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
  // 获取课程信息
  getCourseInfo: function() {
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'course/detail',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      data: {
        course_id: that.data.course_id
      },
      success: function (res) {
        that.setData({
          coursePrice: res.data.data.price,//课程原价
          courseGroupPrice: res.data.data.group_price,//课程拼团价
        })
      },
      complete: function () {// complete
        wx.hideToast();
      }
    })
  },
  // 获取拼团及课程信息
  getGroupInfo: function() {
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'group/detail',
      method: 'get',
      header: {
        'Authorization': 'Bearer ' + that.data.token,
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      data: {
        group_id: that.data.group_id
      },
      success: function(res) {
        that.setData({
          commanderPic: res.data.data.avatar,//开团人头像
          commander: res.data.data.username,//开团人用户名
          coursePic: res.data.data.cover,//课程缩略图
          courseTitle: res.data.data.name,//课程名
          coursePrice: res.data.data.price,//课程原价
          courseGroupPrice: res.data.data.group_price,//课程拼团价
          avatar_list: res.data.data.avatar_list,//参与拼团用户列表
          people: res.data.data.people,//拼团剩余人数
        })
      },
      complete: function(res) {// complete
        app.alert(res.data.msg);
        wx.hideToast();
      }
    })
  },
  // 获取审核开关
  getAuditInfo: function() {
    var that = this;
    app.loading();
    var appid = app.globalData.appid;
    var organ = '000001';
    var channel = '2';
    wx.request({
      url: app.globalData.baseUrl + 'wx/audit/get',
      method: 'get',
      header: {
        'content-type': 'application/json',
        'channel': channel,
        'organ': organ
      },
      data: {
        appid: appid
      },
      success: function (res) {
        if (res.data.code == '0') {
          that.setData({
            audit: res.data.data.audit
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
  // 获取GroupId
  getGroupId: function() {
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'group/id/get',
      method: 'get',
      header: {
        'Authorization': 'Bearer ' + that.data.token,
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      data: {
        course_id: that.data.course_id
      },
      success: function (res) {
        if (res.data.code == '0') {
          app.globalData.group_id = res.data.data.group_id;
          that.setData({
            group_id: res.data.data.group_id,//拼团ID
          }, function () {
            wx.navigateTo({
              url: '../paySuccess/paySuccess?id=' + that.data.course_id + '&group_id=' + res.data.data.group_id,
            });
          });
        }else{
          that.setData({
            group_id: ''
          })
        }
      },
      complete: function () {// complete
        wx.hideToast();
      }
    })
  },
  // 单独购买
  goPay: function() {
    var that = this;
    if (that.data.token == 0 || that.data.token == 'undefined' || that.data.token == null) {
      wx.showModal({
        title: '提示',
        content: '您还没有登录哦~',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.navigateTo({
              url: '../login/login?address=extension',
            })
          } else if (res.cancel) {
            console.log('用户点击取消');
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      })
    } else {
      app.loading();
      var id = that.data.course_id;
      var shareToken = that.data.shareToken;
      wx.request({
        url: app.globalData.baseUrl + 'wxpay/unifiedorder',
        method: 'post',
        header: {
          'Authorization': 'Bearer ' + that.data.token,
          'content-type': 'application/json',
          'channel': '2',
          'organ': '000001'
        },
        data: {
          course_id: id,
          is_group: '1',
          share_token: shareToken
        },
        success: function(res) {
          if (res.data.code == '700') {
            app.alert('您已购买过该课程，可前往官网学习！')
          } else if (res.data.code == '0') {
            var obj = res.data.data;
            wx.requestPayment({
              timeStamp: obj.timeStamp,
              nonceStr: obj.nonceStr,
              package: obj.package,
              signType: 'MD5',
              paySign: obj.paySign,
              success(res) {
                wx.navigateTo({
                  url: '../paySuccess/paySuccess?id=' + id,
                })
              },
              complete(res) {
                wx.hideToast()
              }
            });
          } else {
            app.alert(res.data.msg);
          }
        },
        complete: function () {// complete
          wx.hideToast();
        }
      })
    }
  },
  // 底部拼团购买
  goGroup: function() {
    var that = this;
    app.loading();
    if (that.data.token == 0 || that.data.token == 'undefined' || that.data.token == null) {
      wx.showModal({
        title: '提示',
        content: '您还没有登录哦~',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.navigateTo({
              url: '../login/login?address=extension',
            })
          } else if (res.cancel) {
            console.log('用户点击取消');
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      })
    } else {
      var id = that.data.course_id;
      var shareToken = that.data.shareToken;
      wx.request({
        url: app.globalData.baseUrl + 'wxpay/unifiedorder',
        method: 'post',
        header: {
          'Authorization': 'Bearer ' + that.data.token,
          'content-type': 'application/json',
          'channel': '2',
          'organ': '000001'
        },
        data: {
          course_id: id,
          is_group: '0',
          share_token: shareToken
        },
        success: function(res) {
          if (res.data.code == '700') {
            app.alert('您已购买过该课程，可前往官网学习！')
          } else if (res.data.code == '0') {
            var obj = res.data.data;
            wx.requestPayment({
              timeStamp: obj.timeStamp,
              nonceStr: obj.nonceStr,
              package: obj.package,
              signType: 'MD5',
              paySign: obj.paySign,
              success(res) {
                that.getGroupId();
              },
              complete(res) {
                wx.hideToast()
              }
            });
          } else {
            app.alert(res.data.msg);
          }
        },
        complete: function () {// complete
          wx.hideToast();
        }
      })
    }
  },
  // 加入拼团功能
  goGroupPay: function () {
    var that = this;
    app.loading();
    var group_id = that.data.group_id;
    if (that.data.token == 0 || that.data.token == undefined || that.data.token == null) {
      wx.showModal({
        title: '提示',
        content: '您还没有登录哦~',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.navigateTo({
              url: '../login/login?address=extension',
            })
          } else if (res.cancel) {
            console.log('用户点击取消');
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      })
    } else {
      var id = that.data.course_id;
      var shareToken = that.data.shareToken;
      console.log(id);
      wx.request({
        url: app.globalData.baseUrl + 'wxpay/unifiedorder',
        method: 'post',
        header: {
          'Authorization': 'Bearer ' + that.data.token,
          'content-type': 'application/json',
          'channel': '2',
          'organ': '000001'
        },
        data: {
          course_id: id,
          group_id: group_id,
          is_group: '0',
          share_token: shareToken
        },
        success: function (res) {
          if (res.data.code == '700') {
            app.alert('您已购买过该课程，可前往官网学习！')
          } else if (res.data.code == '0') {
            var obj = res.data.data;
            wx.requestPayment({
              timeStamp: obj.timeStamp,
              nonceStr: obj.nonceStr,
              package: obj.package,
              signType: 'MD5',
              paySign: obj.paySign,
              success(res) {
                that.getGroupId();
              },
              complete(res) {
                wx.hideToast()
              }
            });
          } else {
            app.alert(res.data.msg);
          }
        },
        complete: function () {// complete
          wx.hideToast();
        }
      })
    }
  },
  // 挂起咨询页面
  openConsult: function() {
    var that = this;
    var token = that.data.token;
    if (token == '' || token == undefined || token == null) {
      wx.navigateTo({
        url: '../consult/consult?id=' + that.data.course_id + '&address=extension',
      })
    } else {
      app.alert("感谢您的垂询，我们的工作人员会尽快和您联系~");
      wx.request({
        url: app.globalData.baseUrl + 'course/consult?course_id=' + that.data.course_id,
        method: 'get',
        header: {
          'Authorization': 'Bearer ' + that.data.token,
          'content-type': 'application/json',
          'channel': '2',
          'organ': '000001'
        },
        success: function(res) {
          wx.hideToast();
        },
        complete: function() {// complete
          wx.hideToast();
        }
      })
    }
  },
})