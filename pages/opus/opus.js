// pages/opus/opus.js
var app = getApp();
Page({
  data: {
    token: app.globalData.token,//用户token
    title: '',
    id: '',
    opusInfo: '',
    windowHeight: '',
    windowWidth: '',
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
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          token: app.globalData.token,
        });
      }
    })
  },
  // 分享
  onShareAppMessage: function () {
    var that = this;
    return app.share(
      '/pages/index/index?shareToken=' + that.data.token,
    );
  },
  onLoad: function (option) {
    var that = this;
    var title = option.title;
    var id = option.id;
    wx.setNavigationBarTitle({
      title: title
    });
    that.setData({
      title: title,
      id: id
    });
    app.loading();
    that.loadList();
  },
  loadList: function () {
    var that = this;
    app.loading();
    wx.request({
      url: app.globalData.baseUrl + 'production/detail?production_id=' + that.data.id,
      header: {
        'Authorization': 'Bearer ' + that.data.token,
        'content-type': 'application/json',
        'channel': '2',
        'organ': '000001'
      },
      success: function (res) {
        console.log(res.data);
        var code = res.data.code;
        if(code == 0){
          that.setData({
            opusInfo: res.data.data
          });
        } else {
          app.alert(res.data.msg);
        }
        that.data.loading = false;
      },
      complete: function () {// complete
        wx.hideToast();
      }
    })
  },
})