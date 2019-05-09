// pages/opusList/opusList.js
var app = getApp();
Page({
  data: {
    id: '',
    windowHeight: '',
    windowWidth: '',
    token: app.globalData.token,//用户token
    role: '',//当前用户角色  1为学员 2为销售
    saleInfo: '',//销售基本信息
    openSaleExtend: false,//是否展示展开按钮
    openExtend: false,
    classLists: [],//销售推荐课程
  },
  //上拉加载更多
  pullUpLoad: function () {
    var that = this;
    console.log(that.data.hasnext);
    if (that.data.hasnext > 0 && !that.data.loading) {
      that.data.loading = true;
      that.data.page++;
      app.loading();
      that.loadList();
    }
  },
  onShow: function (e) {
    var that = this;
    that.setData({
      role: app.globalData.role,
      token: app.globalData.token,
    })
    var token = app.globalData.token;
    if (token == '' || token == 'undefined' || token == null) {
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
    } else if (app.globalData.role == '5') {
      that.getSaleInfo();
    } else {
      that.loadList();
    }
  },
  //分享页面 
  onShareAppMessage: function () {
    var that = this;
    return app.share(
      '/pages/index/index?shareToken=' + that.data.token,
    );
  },
  onLoad: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
        });
      }
    })
  },
  loadList: function () {
    var that = this;
    app.loading();
    var opusLists = that.data.opusLists;
    wx.request({
      url: app.globalData.baseUrl + 'production/list',
      method: 'get',
      header: {
        'Authorization': 'Bearer ' + that.data.token,
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        var code = res.data.code;
        if(code == 0){
          that.setData({
            opusLists:res.data.data,
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

  // 获取销售人员信息
  getSaleInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.baseUrl + 'user/info',
      header: {
        'Authorization': 'Bearer ' + that.data.token,
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        var code = res.data.code;
        if (code == '0') {
          var saleInfo = res.data.data;
          var classLists = saleInfo.courses;
          console.log(saleInfo);
          that.setData({
            saleInfo: saleInfo,
            classLists: classLists,
          })
        }
      }
    })
  },
  openSaleExtend: function () {
    var that = this;
    that.setData({
      openExtend: true,
      openSaleExtend: true
    });
  },
  closeSaleExtend: function () {
    var that = this;
    that.setData({
      openExtend: false,
      openSaleExtend: false
    });
  },
  goClassroom: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title
    wx.navigateTo({
      url: '../classroom/classroom?id=' + id + '&title=' + title
    })
  },
  //分享页面 
  onShareAppMessage: function () {
    var that = this;
    if (app.globalData.role == '5') {
      return app.share(
        '/pages/sale/sale?shareToken=' + that.data.token,
      );
    } else {
      return app.share(
        '/pages/opusList/opusList?shareToken=' + that.data.token,
      );
    }
  },
})