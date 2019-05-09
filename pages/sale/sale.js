// pages/sale/sale.js
var app = getApp();
Page({
  data:{
    windowHeight: "",
    windowWidth: "",
    saleInfo: '',//销售基本信息
    openSaleExtend: false,//是否展示展开按钮
    openExtend: false,
    classLists: [],//销售推荐课程
  },
  onLoad: function(option){
    var that = this;
    var shareToken = option.shareToken;
    that.getSaleInfo(shareToken);
  },
  // 获取销售人员信息
  getSaleInfo: function (shareToken) {
    var that = this;
    var shareToken = shareToken;
    wx.request({
      url: app.globalData.baseUrl + 'user/info',
      header: {
        'Authorization': 'Bearer ' + shareToken,
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
})
