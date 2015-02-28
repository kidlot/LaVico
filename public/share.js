$.getJSON('http://wx.lavicouomo.com/welab/api/jssdk', function(data) {
    wx.config(data);
    wx.ready(function(){
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
            title: shareTitle, // 分享标题
            link: replaceWxid(location.href) + "fromWelab=timeline", // 分享链接
            imgUrl: shareIcon, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                $.ajax({
                    url:'/lavico/log',
                    type:'POST',
                    data:{
                        'wxid':getWxid(),
                        'url':location.href,
                        'replyid':getReplyID(),
                        'action' : "share.timeline"
                    },
                    success:function(data){

                    },
                    error:function(msg){
                    }
                });
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
        //分享给朋友
        wx.onMenuShareAppMessage({
            title: shareTitle, // 分享标题
            desc: shareContent, // 分享描述
            link: replaceWxid(location.href) + "fromWelab=friend", // 分享链接
            imgUrl: shareIcon, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
                $.ajax({
                    url:'/lavico/log',
                    type:'POST',
                    data:{
                        'wxid':getWxid(),
                        'url':location.href,
                        'replyid':getReplyID(),
                        'action' : "share.friend"
                    },
                    success:function(data){

                    },
                    error:function(msg){
                    }
                });
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });
    });
    wx.error(function(res){
        console.log(res)
    });
});