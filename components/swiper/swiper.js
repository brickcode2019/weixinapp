// components/swiper/swiper.js
//导入js
var util = require('../../utils/util.js');
var move = require('move.js');
Component({
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
    prev: function(){
      arr.push(arr[0]);
      arr.shift();
      for (var i = 0; i < aLi.length; i++) {
        var oImg = aLi[i].getElementsByTagName('image')[0];

        aLi[i].style.zIndex = arr[i][2];
        move.startMove(aLi[i], {
          left: arr[i][0],
          top: arr[i][1],
          opacity: arr[i][4]
        });
        move.startMove(oImg, {
          width: arr[i][3]
        });
      }
    },
    next: function(){
      arr.unshift(arr[arr.length - 1]);
      arr.pop();
      for (var i = 0; i < aLi.length; i++) {
        var oImg = aLi[i].getElementsByTagName('image')[0];

        aLi[i].style.zIndex = arr[i][2];
        movestartMove(aLi[i], {
          left: arr[i][0],
          top: arr[i][1],
          opacity: arr[i][4]
        });
        movestartMove(oImg, {
          width: arr[i][3]
        });
      }
    },
    getStyle: function(obj, name) {
      if(obj.currentStyle) {
        return obj.currentStyle[name];
      } else {
        return getComputedStyle(obj, false)[name];
      }
    },
    getByClass: function(oParent, sClass) {
      var aResult = [];
      var aEle = oParent.getElementsByTagName('*');

      for(var i = 0; i<aEle.length; i++) {
        if (aEle[i].className == sClass) {
          aResult.push(aEle[i]);
        }
      }
      return aResult;
		}
  }
})
