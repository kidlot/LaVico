/**
 * Created by A on 5/5/14.
 * LAYOUT
 */
module.exports = {
    layout: null,
    view: "lavico/templates/layout.html",
    process: function (seed, nut) {

    },
    viewIn:function(){


        // 自动提取分享内容。
        //// 侃价
        if(location.pathname == "/lavico/bargain/kv" || location.pathname == "/lavico/bargain/list"){
            shareTitle = "我要侃价";
            shareContent = "侃价是门技术更是门艺术，既要有吃定你不放弃的决心，更要练就三寸不烂的嘴上功夫。生活中的你也是侃价达人吗？马上参与朗维高“我要侃价”活动，点击“立即侃价”，输入你心目中的理想价位，给力优惠，惊喜无限！";
            shareIcon = location.origin + jQuery(".coupon-banner").find("img").attr("src");
        }
        if(location.pathname == "/lavico/bargain/list"){
            shareTitle = "我要侃价";
            shareContent = "侃价是门技术更是门艺术，既要有吃定你不放弃的决心，更要练就三寸不烂的嘴上功夫。生活中的你也是侃价达人吗？马上参与朗维高“我要侃价”活动，点击“立即侃价”，输入你心目中的理想价位，给力优惠，惊喜无限！";
            shareIcon = location.origin + jQuery(".elite_list_lw:eq(0)").find("img").attr("src");
        }
        //// 精英
        if(location.pathname == "/lavico/lookbook/detail"){

            var pan = jQuery("#wrap").find(".elite_list_lw").eq(0)
            shareTitle = "精英搭配";
            shareContent = pan.find(".elite_details").text();
            shareIcon = location.origin + ( pan.find("img").attr("src") )
        }
        //// 产品
        if(location.pathname == "/lavico/lookbook/product"){
            shareTitle = "精英搭配";
            shareContent = jQuery("#article").find("h3").text();
            shareIcon = location.origin + ( JSON.parse(jQuery("#jsonPage").text())[myScroll.currPageX].pic )
        }

        //// 优惠券
        if(location.pathname == "/lavico/activity/shake"){
            shareTitle = "来张优惠券"
            shareContent = "朗维高“来张优惠券”不止是摇出各种额度的优惠券那么简单，还有意想不到的专属礼遇特别奉献。就像潘多拉的魔盒充满着不可获知的惊喜！";
            shareIcon = location.origin + jQuery(".coupon-banner").find("img").attr("src");
        }

        //// 优惠券
        if(location.pathname == "/lavico/activity/shake02"){
            shareTitle = "来张优惠券"
            shareContent = "朗维高“来张优惠券”不止是摇出各种额度的优惠券那么简单，还有意想不到的专属礼遇特别奉献。就像潘多拉的魔盒充满着不可获知的惊喜！";
            shareIcon = location.origin + jQuery(".coupon-banner").find("img").attr("src");
        }

        //// 优惠券
        if(location.pathname == "/lavico/activity/shake03"){
            shareTitle = "来张优惠券"
            shareContent = "朗维高“来张优惠券”不止是摇出各种额度的优惠券那么简单，还有意想不到的专属礼遇特别奉献。就像潘多拉的魔盒充满着不可获知的惊喜！";
            shareIcon = location.origin + jQuery(".coupon-banner").find("img").attr("src");
        }


        shareTitle = jQuery("#shareTitle").val() || shareTitle;
        shareIcon = jQuery("#shareIcon").val() || shareIcon;


        // 浏览统计
        var fromWelab = location.search.match(/fromWelab=(.*)$/);
        if(fromWelab){

            // 好友浏览数
            $.ajax({
                url:'/lavico/log',
                type:'POST',
                data:{
                    'wxid':$("#wxid").val() || getWxid(),
                    'url':location.href,
                    'replyid':getReplyID(),
                    'action' : "view."+location.search.match(/fromWelab=(.*)$/)[1].split("&")[0]
                },
                success:function(data){

                },
                error:function(msg){
                    console.log(msg);
                }
            });
        }else{

            // 浏览数
            $.ajax({
                url:'/lavico/log',
                type:'POST',
                data:{
                    'wxid':$("#wxid").val() || getWxid(),
                    'url':location.href,
                    'replyid':getReplyID(),
                    'action' : "view"
                },
                success:function(data){

                },
                error:function(msg){
                    console.log(msg);
                }
            });
        }



    }
}