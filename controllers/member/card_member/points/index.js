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
        var member_id;
        this.step(function(){


            if(wxid == 'undefined'){
                //缺少微信ID参数，强制中断
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }else{

                helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                    if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID ){
                        member_id =  doc.HaiLanMemberInfo.memberID;
                    }else{
                        member_id = 'undefined';
                    }
                }));

            }

        });

        //接口处理-个人积分接口
        this.step(function(){

            if(member_id == "undefined"){
                //缺少微信ID参数，强制中断
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"memberid_not_found"}');
                this.res.end();
                this.terminate();
            }else{
                nut.model.wxid = wxid ;
                nut.model.member_ID = member_id;
                middleware.request( "Point/"+member_id,{
                    'pageNum':1,
                    'perPage':100000

                },this.hold(function(err,doc){

                    var dataJson = JSON.parse(doc)


                    //当前积分
                    if(parseInt(dataJson.point) < 0){
                        nut.model.remaining = dataJson.point;
                    }else{
                        nut.model.remaining = '+' + dataJson.point;
                    }


                }));
            }

        });

      this.step(function(){
            middleware.request( "Point/Log/"+member_id,{
                'pageNum':1,
                'perPage':100000
            },this.hold(function(err,doc){

                var newLog = new Array();
                var dataJson = JSON.parse(doc);

                for(var i=0; i<dataJson.log.length; i++){

                    var _temp = dataJson.log[i];
                    var _time = formatDate( new Date(dataJson.log[i].time));//消费时间
                    var _value = (dataJson.log[i].value < 0) ? dataJson.log[i].value: ('+'+dataJson.log[i].value);
                    var _MEMO = dataJson.log[i].MEMO;

                    var _json = {
                        'MEMO' : _MEMO,
                        'value' : _value,
                        'time'  : _time,
                        'source' : dataJson.log[i].source
                    };
                    newLog.push(_json);

                }

                nut.model.log = newLog;//当前会员的积分记录
               
            }));
        });


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

function   formatDate(now){
    var   year=now.getFullYear();
    var   month=now.getMonth()+1;
    var   date=now.getDate();
    var   hour=now.getHours();
    var   minute=now.getMinutes();
    var   second=now.getSeconds();
    return   year+"-"+month+"-"+date+"   "+hour+":"+minute+":"+second;
}