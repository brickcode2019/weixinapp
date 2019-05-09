// components/searchBox/searchBox.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    saveWords: function (e) {
      var that = this;
      that.setData({
        keyWords: e.detail.value
      })
    },
    goSearch: function () {
      var that = this;
      wx.navigateTo({
        url: '../videoList/videoList?keywords=' + that.data.keyWords,
        success: function () {
          that.setData({
            keyWords: '',
          })
        }
      });
    },
  }
})
