// pages/login/login.js
var interval = null; //倒计时函数
var app = getApp(); //调用App
let Mcaptcha = require('../../utils/mcaptcha.js');
Page({
  data: {
    date: '请选择日期',
    fun_id: 2,
    time: '获取验证码', //倒计时 
    currentTime: 61,
    phone: '',
    num: '',//生成的验证码
    saveCode: '',//本地验证码
    loginCode: '',//用户授权码
    phoneCode: '',//短信验证码
    address: 'open-class',//默认进入登录的地址
  },
  // 本地验证码
  onReady: function () {
    var that = this;
    var num = that.getRanNum();
    that.setData({
      num: num.toLowerCase()
    })
    new Mcaptcha({
      el: 'canvas',
      width: 110,//对图形的宽高进行控制
      height: 40,
      code: num//生成的验证码
    });
  },
  getRanNum: function () {
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var pwd = '';
    for (var i = 0; i < 4; i++) {
      if (Math.random() < 48) {
        pwd += chars.charAt(Math.random() * 48 - 1);
      }
    }
    return pwd;
  },
  // 缓存手机号码
  mobileInput: function (e) {
    var that = this;
    that.setData({
      phone: e.detail.value
    });
  },
  // 缓存本地验证码
  saveCode: function(e){
    var that = this;
    that.setData({
      saveCode: e.detail.value
    },()=>{
      console.log(that.data.saveCode);
    })
  },
  // 缓存手机验证码
  savePhoneCode: function(e) {
    var that = this;
    that.setData({
      phoneCode: e.detail.value
    })
  },
  // 校验本地验证码
  checkCode: function(saveCode){
    var that = this;
    if (saveCode != that.data.num || saveCode == '' || saveCode == 'undefined' || saveCode == null) {
      app.alert("请输入正确的验证码！")
      return false;
    } else {
      return true;
    }
  },
  // 判断是否为手机号
  isPhoneAvailable: function (phone) {
    var that = this;
    var phone = that.data.phone;
    var myreg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(phone)) {
      app.alert("请输入正确的手机号！")
      return false;
    } else {
      return true;
    }
  },
  // 校验验证码不为空
  checkPhoneCode: function (phoneCode) {
    var that = this;
    var phoneCode = phoneCode;
    if (phoneCode == '' || phoneCode == 'undefined' || phoneCode == null) {
      app.alert("请输入手机验证码！")
      return false;
    } else {
      return true;
    }
  },
  getCode: function (options) {
    var that = this;
    var currentTime = that.data.currentTime
    console.log(that.isPhoneAvailable());
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
  submit: function(){
    var that = this;
    var phone = that.data.phone;
    var saveCode = that.data.saveCode;
    var phoneCode = that.data.phoneCode;
    var shareToken = (wx.getStorage('brickcode_shareToken') != 'undefined') ? wx.getStorage('brickcode_shareToken') : '';
    console.log(that.data.loginCode, phoneCode, phone);
    if (that.isPhoneAvailable(phone) && that.checkCode(saveCode) && that.checkPhoneCode(phoneCode)){
      wx.request({
        url: app.globalData.baseUrl + 'login',
        header: {
          'content-type': 'application/json',
          "channel": '2',
          'organ': '000001'
        },
        method: 'post',
        data: {
          'phone': phone,
          'sms_code': phoneCode,
          'code': app.globalData.loginCode,
          'shareToken': shareToken
        },
        success: function (res) {
          if (res.data.code == 0) {
            console.log(res.data);
            wx.setStorage({
              key: 'brickcode_role',
              data: res.data.data.role,
            });
            wx.setStorage({
              key: 'brickcode_token',
              data: res.data.data.token,
              success: function () {
                app.globalData.token = res.data.data.token;
                if (that.data.address != '' && that.data.address != 'undefined' && that.data.address != null){
                  if(that.data.address == 'extension'){
                    wx.navigateBack({
                      delta: 1
                    })
                  } else {
                    wx.switchTab({
                      url: '../index/index',
                    });
                  }
                }
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
  onLoad: function (option){
    var that = this;
    if (option.address != 'undefined' && option.address != '' && option.address != null) {
      var address = decodeURIComponent(option.address);
    } else {
      var address = 'open-class';
    }
    that.setData({
      address: address,
    }, () => {
      console.log(that.data.address);
      wx.getStorage({
        key: "loginCode",
        success: res => {
          console.log(res.data);
          that.data.loginCode = res.data
        },
        fail: res => {
          console.log(res)
        },
        complete: res => {
          console.log(res)
        }
      })
    });
  },
})