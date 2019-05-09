// pages/classroom/classroom.js
// 倒计时
function grouponcountdown(that, deadline, param) {
  var groupons = that.data.group_list;
  groupons[param].deadline = dateformat(deadline);
  if (deadline <= 0) {
    groupons[param].deadline = "已结束"
  }
  that.setData({
    group_list: groupons
  });
  deadline = (deadline / 1000 - 1) * 1000;
  setTimeout(function () {
    grouponcountdown(that, deadline, param);
  }, 1000)
}
// 时间格式化输出，每1s都会调用一次
function dateformat(micro_second) {
  // 总秒数
  var second = Math.floor(micro_second / 1000);
  // 天数
  var day = Math.floor(second / 3600 / 24);
  // 小时
  var hr = Math.floor(second / 3600 % 24);
  var hrStr = hr.toString();
  if (hrStr.length == 1) hrStr = '0' + hrStr;
  // 分钟
  var min = Math.floor(second / 60 % 60);
  var minStr = min.toString();
  if (minStr.length == 1) minStr = '0' + minStr;
  // 秒
  var sec = Math.floor(second % 60);
  var secStr = sec.toString();
  if (secStr.length == 1) secStr = '0' + secStr;
  if (day <= 1) {
    return "剩 " + hrStr + ":" + minStr + ":" + secStr;
  } else {
    return "剩 " + day + " 天 " + hrStr + ":" + minStr + ":" + secStr;
  }
}
const app = getApp();
Page({
  data: {
    course_id: '',
    title: '',
    autoplay: true,
    interval: 5000,
    duration: 500,
    banners: [],//轮播数组
    token: app.globalData.token,//用户token
    bannerPic: '',
    desc: '',
    sales: '',
    group_sales: '',//团购人数
    group_price: '',//团购价格
    group_people: '',//成团人数
    group_id: '',//团购ID
    group_list: [],//团购列表
    price: '',
    teacher: '',
    active_time: '',
    countDownTime: '',//课程倒计时
    status: '',
    people: '',
    total_period: '',
    category: '',
    windowHeight: '',
    windowWidth: '',
    openConsult: false,
    hasBuy: false,//是否已购买该课程
    classTraitList: ['直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款', '直播授课', '随时退款'],
    audit: '',//审核开关，0为审核完成展示购买按钮；1为审核中隐藏购买按钮
  },
  //分享页面 
  onShareAppMessage: function () {
    var that = this;
    return app.share(
      '/pages/classroom/classroom?id=' + that.data.course_id + '&shareToken=' + that.data.token
    );
  },
  openExtend: function () {
    var that = this;
    that.setData({
      openExtend: true,
    });
    console.log(that.data.openExtend);
  },
  openExpertExtend: function () {
    var that = this;
    that.setData({
      openExpertExtend: true,
    });
  },
  closeExtend: function () {
    var that = this;
    that.setData({
      openExtend: false,
    });
  },
  closeExpertExtend: function () {
    var that = this;
    that.setData({
      openExpertExtend: false,
    });
  },
  onShow: function (e) {
    var that = this;
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          token: app.globalData.token,
        });
      }
    });
    that.checkBuy(that.data.course_id, that.data.token);
  },
  onLoad: function (option) {
    var that = this;
    // app.loading();
    var id = option.id;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          autoHeight: ((res.windowWidth) / 16) * 9
        });
      }
    });
    that.setData({
      course_id: id,
    });
    that.getBanners();
    that.get_info();
    that.getAuditInfo();
  },
  // 获取课程信息
  get_info: function () {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + 'course/detail?course_id=' + that.data.course_id,
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        wx.hideToast();
        console.log(res.data);
        var code = res.data.code;
        if (code == 0) {
          wx.setNavigationBarTitle({
            title: res.data.data.name
          })
          that.setData({
            bannerPic: res.data.data.cover,
            title: res.data.data.name,
            desc: res.data.data.desc,
            sales: res.data.data.sales,
            group_sales: res.data.data.group_sales,
            group_price: res.data.data.group_price,
            group_people: res.data.data.group_people,
            price: res.data.data.price,
            teacher: res.data.data.teacher,
            active_time: app.formatTime(res.data.data.active_time, 'Y-M-D h:m:s'),
            status: res.data.data.status,
            people: res.data.data.people,
            total_period: res.data.data.total_period,
            category: res.data.data.category,
          });
          that.countDown(res.data.data.active_time);
          let endTimeList = [];
          var list = res.data.data.group_list;
          for(var i = 0; i < list.length ; i++){
            var deadline = list[i].deadline * 1000 - Date.parse(new Date());
            list[i].deadline = deadline;
          };
          that.setData({
            group_list: list
          });
          var data = that.data.group_list;
          for (var i = 0; i < data.length; i++) {
            grouponcountdown(that, data[i].deadline, i)
          }
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
  // 获取轮播图片
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
        console.log(res.data.code);
        var code = res.data.code;
        if (code == 0) {
          var list = res.data.data;
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
  // 开启咨询页面
  openConsult:function(){
    console.log(111);
    var that = this;
    var token = that.data.token;
    if (token == '' || token == undefined || token == null) {
      that.setData({
        openConsult: true,
      });
      wx.navigateTo({
        url: '../consult/consult?id=' + that.data.course_id,
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
        success: function (res) {
          wx.hideToast();
        },
        complete: function () {// complete
          wx.hideToast();
        }
      })
    }
  },
  // 获取GroupId
  getGroupId: function () {
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
        console.log(res.data);
        if (res.data.code == '0') {
          app.globalData.group_id = res.data.data.group_id;
          that.setData({
            group_id: res.data.data.group_id,//拼团ID
          }, function () {
            wx.navigateTo({
              url: '../paySuccess/paySuccess?id=' + that.data.course_id + '&group_id=' + res.data.data.group_id,
            });
          });
        } else {
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
  goPaySuccess: function(){
    wx.navigateTo({
      url: '../paySuccess/paySuccess?id=' + this.data.course_id,
    })
  },
  goGroupSuccess: function () {
    wx.navigateTo({
      url: '../paySuccess/paySuccess?id=' + this.data.course_id + '&group_id=1',
    })
  },
  // 校验是否购买该课程
  checkBuy: function(course_id, token){
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
      success: function(res){
        console.log(res.data.code);
        if(res.data.code == '700'){
          that.setData({
            hasBuy: true
          });
        } else if(res.data.code == '0'){
          that.setData({
            hasBuy: false
          });
        } else {
          console.log(res.data.code);
        }
      }
    })
  },
  // 单独购买
  goPay: function () {
    console.log(222);
    var that = this;
    app.loading();
    if (that.data.token == 0 || that.data.token == undefined || that.data.token == null){
      wx.showModal({
        title: '提示',
        content: '您还没有登录哦~',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.redirectTo({
              url: '../login/login',
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
          is_group: '1',
          share_token: shareToken
        },
        success: function (res) {
          if(res.data.code == '700'){
            app.alert('您已购买过该课程，可前往官网学习！')
          } else if (res.data.code == '0') {
            var obj = res.data.data;
            wx.requestPayment({
              timeStamp: obj.timeStamp,
              nonceStr: obj.nonceStr,
              package: obj.package,
              signType: 'MD5',
              paySign: obj.paySign,
              success(res){
                wx.navigateTo({
                  url: '../paySuccess/paySuccess?id=' + id,
                })
              },
              complete(res){
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
  // 单独开团
  goGroup: function () {
    var that = this;
    console.log(333);
    app.loading();
    if (that.data.token == 0 || that.data.token == undefined || that.data.token == null){
      wx.showModal({
        title: '提示',
        content: '您还没有登录哦~',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.redirectTo({
              url: '../login/login',
            })
          } else if (res.cancel) {
            console.log('用户点击取消');
            wx.switchTab({
              url: '../index/index',
            })
          }
        }
      })
    }else{
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
  // 参团购买
  goGroupPay: function (e) {
    var that = this;
    console.log(444);
    app.loading();
    var group_id = e.currentTarget.dataset.id;
    console.log(group_id);
    if (that.data.token == 0 || that.data.token == undefined || that.data.token == null) {
      wx.showModal({
        title: '提示',
        content: '您还没有登录哦~',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            wx.redirectTo({
              url: '../login/login',
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
          is_group: '1',
          group_id: group_id,
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
  // 倒计时
  countDown: function (times) {
    var that = this;
    var timer = null;
    var now = Date.parse(new Date());
    var times = (times * 1000 - now) / 1000;
    timer = setInterval(function () {
      var day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值
      if (times > 0) {
        day = Math.floor(times / (60 * 60 * 24));
        hour = Math.floor(times / (60 * 60)) - (day * 24);
        minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      //
      var date = day + " 天 " + hour + " 时 " + minute + " 分 " + second + " 秒";
      that.setData({
        countDownTime: date
      })
      times--;
    }, 1000);
    if (times <= 0) {
      clearInterval(timer);
    }
  },
  // 获取审核开关
  getAuditInfo: function () {
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
})
