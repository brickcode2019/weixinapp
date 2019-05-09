// compnonents/imageSwiper/imageSwiper.js
Component({
  properties: {
    imgList: Array,
    sHeight: String,
  },
  data: {
    imgList: [],
    sHeight: '',
  },
  attached() {
    this.dataInit();
  },
  methods: {
    dataInit() {
      let that = this;
      let imgList = that.properties.imgList;
      let sHeight = that.properties.sHeight;

      // console.log(imgList,sHeight);

      that.setData({
        imgList: imgList,
        sHeight: sHeight
      })
    }
  }
})