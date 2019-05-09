// components/newUser/newUser.js
var interval = null; //倒计时函数
var app = getApp(); //调用App
Component({
  properties: {

  },
  data: {
    array: ['--请选择--','一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    time: '获取验证码', //倒计时 
    currentTime: 61,
    phone: '',//手机号
    children_name: '',//孩子姓名
    grade: 0,//年级
    phoneCode: '',//验证码
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 缓存手机号码
    mobileInput: function (e) {
      var that = this;
      that.setData({
        phone: e.detail.value
      });
    },
    // 缓存验证码
    codeInput: function (e) {
      var that = this;
      that.setData({
        phoneCode: e.detail.value
      });
    },
    // 缓存孩子姓名
    nameInput: function (e) {
      var that = this;
      that.setData({
        children_name: e.detail.value
      });
    },
    // 缓存孩子年级
    bindPickerChange: function(e){
      var that = this;
      that.setData({
        grade: e.detail.value
      })
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
    // 校验验证码不为空
    checkPhoneCode: function(phoneCode){
      var that = this;
      var phoneCode = phoneCode;
      if(phoneCode == '' || phoneCode == undefined || phoneCode == null){
        app.alert("请输入正确的验证码！")
        return false;
      } else {
        return true;
      }
    },
    // 校验年级不为空
    checkGrade: function(grade){
      var that = this;
      var grade = grade;
      if (grade == '' || grade == undefined || grade == null || grade == 0) {
        app.alert("请选择孩子所在年级")
        return false;
      } else {
        return true;
      }
    },
    // 校验孩子姓名不为空
    checkName: function (children_name) {
      var that = this;
      var children_name = children_name;
      if (children_name == '' || children_name == undefined || children_name == null) {
        app.alert("请输入孩子姓名")
        return false;
      } else {
        return true;
      }
    },
    getCode: function () {
      var that = this;
      var currentTime = that.data.currentTime
      interval = setInterval(function () {
        currentTime--;
        that.setData({
          disabled: true,
          time: '重新获取 ' + currentTime + ' S'
        })
        if (currentTime <= 0) {
          clearInterval(interval);
          that.setData({
            time: '重新获取',
            currentTime: 61,
            disabled: false
          })
        }
      }, 1000)
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
          success: function(res){
            if (res.data.code != '0') {
              app.alert(res.data.msg);
            } else {
              console.log(res.data);
            }
          }
        })
      }
    },
    onShow: function(){
      this.triggerEvent("action");
    },
    submit: function(){
      var that = this;
      var phone = that.data.phone;
      var phoneCode = that.data.phoneCode;
      var grade = that.data.grade;
      var children_name = that.data.children_name;
      var shareToken = (wx.getStorage('brickcode_shareToken') != undefined) ? wx.getStorage('brickcode_shareToken') : '';
      if (that.isPhoneAvailable(phone) && that.checkPhoneCode(phoneCode) && that.checkName(children_name) && that.checkGrade(grade)) {
        wx.request({
          url: app.globalData.baseUrl + 'customer/consult',
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
            'children_name': children_name,
            'grade': grade,
            'shareToken': shareToken
          },
          success: function (res) {
            if (res.data.code == '0') {
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
                    content: '您已成功领取，请前往官网查看。您的账号为' + phone + ', 默认密码为' + phone.substr(5, 6) + ', 请妥善保管',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {
                        console.log('用户点击确定');
                        that.onShow();
                      }
                    }
                  })
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
    }
  }
})
