module.exports = {
    layout: null,
    view: "lavico/templates/demo.html",
    process: function(seed,nut){

    },
    viewIn:function(){
        alert(shareTitle)
        jQuery.getJSON('http://wx.lavicouomo.com/welab/api/jssdk', function (data) {
            wx.config(data);
            var title = "lavico测试！！！_分享标题";
            var decs = "lavico测试！！！_分享描述";
            var link = "http://www.baidu.com"
            var imgurl = "http://g.hiphotos.baidu.com/album/crop%3D107%2C2%2C731%2C303%3Bh%3D240/sign=42681c5d1bd8bc3ed2475c8abfba9629/c9fcc3cec3fdfc03bcac4adfd63f8794a5c22684.jpg";
            wx.ready(function () {
                //隐藏右上角菜单接口
                //wx.hideOptionMenu();

                // 要隐藏的菜单项，所有menu项见附录3
                wx.hideMenuItems({
                    menuList: [
                        'menuItem:copyUrl',
                        'menuItem:favorite',
                        'menuItem:openWithQQBrowser',
                        'menuItem:openWithSafari'
                    ]
                });
                //分享到朋友圈
                wx.onMenuShareTimeline({
                    title: title, // 分享标题
                    link: link, // 分享链接
                    imgUrl: imgurl, // 分享图标
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
                //分享给朋友
                wx.onMenuShareAppMessage({
                    title: title, // 分享标题
                    desc: decs, // 分享描述
                    link: link, // 分享链接
                    imgUrl: imgurl, // 分享图标
                    type: '', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () {
                        // 用户确认分享后执行的回调函数
                    },
                    cancel: function () {
                        // 用户取消分享后执行的回调函数
                    }
                });
            });
            wx.error(function (res) {
                console.log(res)
            });
        });
    }
}