// pages/consult/consult.js
var interval = null; //倒计时函数
const app = getApp(); //调用App
Page({
  data: {
    ischecked: true,
    time: '获取验证码', //倒计时 
    currentTime: 61,
    phone: '',
    code: '',
    course_id: '',
    address: '',
  },
  onLoad: function (option) {
    var that = this;
    var id = option.id;
    console.log(id,option.address);
    if (option.address != 'undefined' && option.address != '' && option.address != null) {
      var address = decodeURIComponent(option.address);
    } else {
      var address = 'open-class';
    }
    that.setData({
      address: address,
      course_id: id
    })
  },
  // 缓存手机号码
  mobileInput: function (e) {
    var that = this;
    console.log(e.detail.value);
    that.setData({
      phone: e.detail.value
    });
  },
  // 缓存验证码
  codeInput: function (e) {
    var that = this;
    console.log(e.detail.value);
    that.setData({
      code: e.detail.value
    });
  },
  // 判断是否为手机号
  isPhoneAvailable: function (phone) {
    var that = this;
    var phone = phone;
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(phone)) {
      app.alert("请输入正确的手机号！")
      return false;
    } else {
      return true;
    }
  },
  // 校验是否输入验证码
  isCodeAvailable: function (code) {
    var that = this;
    var code = code;
    if (code == '' || code == 'undefined' || code == null) {
      app.alert("请输入验证码！")
      return false;
    } else {
      return true;
    }
  },
  // 校验是否同意用户协议
  isAgree: function (ischecked) {
    var that = this;
    var ischecked = ischecked;
    if (!ischecked) {
      app.alert("您还没有同意协议！")
      return false;
    } else {
      return true;
    }
  },
  getCode: function (options) {
    var that = this;
    var currentTime = that.data.currentTime;
    console.log(that.isPhoneAvailable(that.data.phone));
    interval = setInterval(function () {
      currentTime--;
      that.setData({
        disabled: true,
        time: '重新获取 ' + currentTime + ' S'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '重新获取',
          currentTime: 61,
          disabled: false
        })
      }
    }, 1000);
  },
  getVerificationCode() {
    var that = this;
    var phone = that.data.phone;
    if (that.isPhoneAvailable(phone)) {
      that.getCode();
      wx.request({
        url: app.globalData.baseUrl + 'get_sms',
        header: {
          'content-type': 'application/json',
          "channel": '2',
          'organ': '000001'
        },
        method: 'post',
        data: {
          'phone': phone,
        },
        success: function (res) {
          if (res.data.code != '0') {
            app.alert(res.data.msg);
          } else {
            console.log(res.data);
          }
        }
      })
    }
  },
  // 同意用户协议
  agreeMent: function (e) {
    var that = this;
    that.data.ischecked = !that.data.ischecked

  },
  // 提交咨询信息
  submitEvent: function () {
    var that = this;
    var code = that.data.code;
    var phone = that.data.phone;
    var ischecked = that.data.ischecked;
    var course_id = that.data.course_id;
    var shareToken = (wx.getStorage('brickcode_shareToken') != 'undefined') ? wx.getStorage('brickcode_shareToken') : '';
    console.log(app.globalData.loginCode);
    if (that.isPhoneAvailable(phone) && that.isCodeAvailable(code) && that.isAgree(ischecked)) {
      wx.request({
        url: app.globalData.baseUrl + 'customer/consult',
        header: {
          'content-type': 'application/json',
          'channel': '2',
          'organ': '000001'
        },
        method: 'post',
        data: {
          'phone': phone,
          'sms_code': code,
          'course_id': course_id,
          'code': app.globalData.loginCode,
          'shareToken': shareToken
        },
        success: function (res) {
          console.log(res.data.code);
          var code = res.data.code;
          if (code == 0) {
            wx.setStorage({
              key: 'brickcode_role',
              data: res.data.data.role,
            });
            wx.setStorage({
              key: 'brickcode_token',
              data: res.data.data.token,
              success: function () {
                app.globalData.token = res.data.data.token;
                wx.showModal({
                  title: '温馨提示',
                  content: '尊敬的用户，感谢您的垂询！如想了解更多精彩内容，可前往官网查询。您的账号为' + phone + ',默认密码为' + phone.substr(5, 6) + ',请妥善保管',
                  showCancel: false,
                  success: function (res) {
                    if (that.data.address != '' && that.data.address != 'undefined' && that.data.address != null) {
                      if (that.data.address == 'extension') {
                        wx.navigateBack({
                          delta: 1
                        })
                      } else {
                        wx.navigateBack({
                          delta: 2
                        })
                      }
                    }
                  }
                });
              }
            });
          } else {
            app.alert(res.data.msg);
          }
        },
        complete: function (res) {
          console.log(res.data.code);
        }
      })
    }
  },
})