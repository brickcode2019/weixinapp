// pages/open-class/open-class.js
var app = getApp();
Page({
  data: {
    listTitle: '',
    imgUrls: [],//轮播图
    autoplay: true,
    interval: 5000,
    duration: 500,
    banners: [],//轮播数组
    windowHeight: "",
    windowWidth: "",
    openClassId: '',
    page: 1,
    token: app.globalData.token,//用户token
    videos: [],//公开课列表
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
      that.loadList(app.globalData.baseUrl + 'course/public');
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
      that.getBanners();
      that.loadList(app.globalData.baseUrl + 'course/public');
    }
  },
  //分享页面 
  onShareAppMessage: function () {
    var that = this;
    if (app.globalData.role == '5'){
      return app.share(
        '/pages/sale/sale?shareToken=' + that.data.token,
      );
    } else {
      return app.share(
        '/pages/open-class/open-class?shareToken=' + that.data.token,
      );
    }
  },
  goClassroom: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title
    wx.navigateTo({
      url: '../classroom/classroom?id=' + id + '&title=' + title
    })
  },
  onLoad: function (option) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          role: app.globalData.role,
          token: app.globalData.token,
        });
      }
    });
  },
  // 获取视频列表
  loadList: function (url) {
    var that = this;
    app.loading();
    var videos = that.data.videos;
    wx.request({
      url: url,
      header: {
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        console.log(res.data);
        var code = res.data.code;
        if(code == 0){
          var list = res.data.data;
          if (list.length <= 0) {
            that.data.hasnext = 0;
          } else {
            that.setData({
              videos: list,
            });
          }
          that.data.loading = false;
        }else{
          app.alert(res.data.msg);
        }
      },
      complete: function () {// complete
        wx.hideToast();
      }
    })
  },
  //获取轮播图片
  getBanners: function() {
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
  // 获取销售人员信息
  getSaleInfo: function(){
    var that = this;
    console.log(that.data.token);
    wx.request({
      url: app.globalData.baseUrl + 'user/info',
      header: {
        'Authorization': 'Bearer ' + that.data.token,
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function(res){
        var code = res.data.code;
        if(code == '0'){
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
})