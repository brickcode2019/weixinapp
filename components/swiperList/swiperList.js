// components/swiperList/swiperList.js
Component({
  properties: {
    'buyList': Array,
  },
  data: {
    buyList: [],
  },
  methods: {
    onLoad() {
      this.dataInit();
      console.log(this.data.buyList);
    },
    dataInit() {
      let list = this.properties.buyLists;
      this.setData({
        buyList: list
      })
    },
  }
})
