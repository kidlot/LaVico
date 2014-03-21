/**
 * Created by David Xu on 3/14/2014.
 * 会员 - 我的会员卡 - 积分明细
 * 进入页面调用接口获取属于该用户的积分信息，含每笔明细，年度数据前台计算
 * controllers/member/card_member/points/index.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:null,
    view:'lavico/templates/member/card_member/points/index.html',
    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID

        var member_ID  = '9121535';//海澜会员ID
        var _this = this;
        nut.model.wxid = wxid ;
        nut.model.member_ID = member_ID;


        //接口处理-个人积分接口
        this.step(function(){
            middleware.request( "/lavico.middleware/Points",{

                'MEMBER_ID':member_ID

            },_this.hold(function(err,doc){

                nut.model.doc = doc;
                var dataJson = eval('('+doc+')');
                console.log(dataJson);

                nut.model.remaining = dataJson.remaining;//当前积分
                nut.model.level = dataJson.level;//当前会员卡类型

                nut.model.log = dataJson.log;//当前会员的积分记录
                return dataJson;
            }));
        });

//
//        this.step(function(dataJson){
//
//            //记录用户动作
//            helper.db.coll("lavico/user/logs").insert(
//                {
//                    'createTime':new Date().getTime(),
//                    'wxid':seed.wxid,
//                    'member_ID':member_ID,
//                    'action':"查看专属礼券",
//                    'response':dataJson
//                },
//                function(err, doc){
//                    console.log(doc);
//                }
//            );
//        });



    },
    viewIn:function(){
        //先判断是否存在微信ID参数
        var wxid = $('#wxid').val();
        if(wxid =='undefined'){
            alert('请登陆微信后，查看本页面');
            jQuery('.ocview').hide();
        }
        /*返回的个人积分的dataJson
         {
             "remaining":699,
             "level":01,
             "log":
             [
                 {"value":"-10","time":"2014-03-18 13:52:42.0","memo":""},
                 {"value":"281","time":"2014-03-18 14:30:20.0","memo":""},
                 {"value":"398","time":"2014-03-18 09:48:20.0","memo":"审核会员申请时自动插入"},
                 {"value":"318","time":"2014-03-18 11:33:59.0","memo":""},
                 {"value":"-318","time":"2014-03-18 13:06:24.0","memo":""},
                 {"value":"10","time":"2014-03-18 22:16:38.0","memo":""},
                 {"value":"20","time":"2014-03-18 22:25:24.0","memo":""}
             ]
         }
         或
         {"error":"指定的会员不存在"}
         */

    }
}