// components/tabBar/tabBar.js
Component({
  properties: {//必填，目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
    tabList: Array,
    currentNum: String,
  },
  data: {
    currentTab: '', // 预设当前tab的值
    tabList: [],    // tab切换列表
    course_id: '',  // 课程ID
    course_name: '',// 课程名称
  },
  attached() {
    this.dataInit();
  },
  methods: {
    // 初始化组件数据
    dataInit() {
      let that = this;
      let list = that.properties.tabList;
      let cur = that.properties.currentNum;

      if (list.length > 0 && list.length <= 3) {
        that.setData({
          tabList: list
        });
      } else {
        var tabLists = []
        for (var i = 0; i < 3; i++) {
          tabLists.push(list[i]);
        }
        that.setData({
          tabList: tabLists
        })
      }

      // console.log(this.data.tabList, this.data.currentTab);
    },
    // 点击标题切换当前页时改变样式
    swichNav: function (e) {
      var that = this;
      var cur = e.currentTarget.dataset.current;
      var name = e.currentTarget.dataset.title;
      if (that.data.currentTab == cur) {
        return false;
      } else {
        that.setData({
          currentTab: cur,
          course_id: cur,
          course_name: name
        })
      }
    },
    goClassRoom:function(e){
      var that = this;
      wx.navigateTo({
        url: '../classroom/classroom?id=' + that.data.course_id + '&title=' + that.data.course_name,
      })
    }
  }
})
