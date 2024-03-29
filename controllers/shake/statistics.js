/**
 * 摇一摇统计页面
 * URL：/lavico/shake/statistics?_id=536c72da6c637d35587c87b9
 * by David.xu
 * */

module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/shake/info.html"

    , process: function(seed,nut)
    {

        nut.model._id = seed._id;//活动ID
        var then = this
        var docs = {};

        var real_count = 0;
        var real_total = 0;
        var count = 0;
        var total = 0;
        this.step(function(){
            var count = 0;
            helper.db.coll("lavico/shake").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                docs = _doc;//获取摇一摇活动信息
                //docs._id.toString()活动唯一标识
                helper.db.coll("welab/customers").find({"shake.aid":docs._id.toString()}).toArray(then.hold(function(err,_doc2){
                    docs.sumFavorites = _doc2.length;//用户表里的摇一摇记录
                    console.log('-------------------------');
                    console.log(_doc2);
                    console.log(_doc2.length);
                    console.log('-------------------------');

                    for(var i=0;i<_doc2.length;i++){
                      for(var j=0;j<_doc2[i].shake.length;j++){
                       if(_doc2[i].shake[j].aid == docs._id.toString()){
                          real_count++;//中奖次数
                        }                        
                      }
                    }
                }))           
            }))        
        })
        
        this.step(function(){
            helper.db.coll("lavico/shake/logs").aggregate(
                        [
                          {$match:{
                              aid:seed._id
                            }
                          },
                          {$group:{
                            _id:'$uid',
                            total:{$sum:1}
                            }
                          }
                        ]
                        ,this.hold(function(err,doc){
                          docs.total = doc.length;
                          console.log('+++++++++++++++++++');
                          console.log('real_count:');
                          console.log(doc);
                          console.log('+++++++++++++++++++');

                            for(var i=0;i<doc.length;i++){
                                real_total += doc[i].total;
                            }
                          }
                        ))
        })

        this.step(function(){
            docs.reality_chance = Math.round(real_count/real_total*100);//真实中奖概率
            var _sum = 0;
            for(var _i=0;_i<docs.lottery.length;_i++){
                _sum+=parseInt(docs.lottery[_i].lottery_chance);
            }
            docs.lottery_chance = _sum;//中奖概率
            docs.real_count = real_count;//总共中奖多少次
            docs.real_total = real_total;//总共参加多少次

            nut.model.doc = docs
            console.log(docs);
        })



        this.step(function(){

            var dTime = new Date()
            if(dTime.getMonth()<=2){
                var _start_y = dTime.getFullYear() -1;
                var _start_m = dTime.getMonth() + 12 -2;
                var _start_ym = _start_y + "-" + _start_m;//默认三个月内的数据

            }else{
                var _start_ym = dTime.getFullYear() + "-" + (dTime.getMonth()-2);//默认三个月内的数据
            }
            var _end_ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1);//默认三个月内的数据

            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_start_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_end_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,unwind:"shake",_id:nut.model._id};
            console.log({startDate:nut.model.startDate,stopDate:nut.model.stopDate,unwind:"shake",_id:nut.model._id});

        })
    }
    , children: {

        userList: "lavico/shake/userList.js"

    }
    , viewIn : function(){
        $.searchInitConditions([
            {field:'realname',title:'姓名',type:'text'}
            , {field:'gender',title:'性别',type:'gender'}
            , {field:'birthday',title:'年龄',type:'birthday'}
            , {field:'email',title:'电子邮件',type:'text'}
            , {field:'mobile',title:'移动电话',type:'text'}
            , {field:'registerTime',title:'注册时间',type:'date'}
            , {field:'followTime',title:'关注时间',type:'date'}
            , {field:'tags',title:'标签',type:'text'}
            , {field:'nickname',title:'昵称',type:'text'}
            , {field:'city',title:'城市',type:'text'}
            , {field:'profession',title:'行业',type:'text'}
            , {field:'source',title:'关注来源',type:'value'}
            , {field:'HaiLanMemberInfo.action',title:'绑定',type:'member'}
            , {field:'HaiLanMemberInfo.type',title:'会员卡',type:'membertype'}
            , {field:'isFollow',title:'关注',type:'follow'}
            , {field:'isRegister',title:'注册',type:'register'}
        ]) ;

        $('#startDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        });

        $('#stopDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        });


//        jQuery("#tags").tagsManager({
//            prefilled: str,
//            hiddenTagListName: 'tagsVal'
//        });
        $("#exportssd").attr("href","/lavico/shake/userList:exports?unwind=shake&_id="+$('#_id').val())
    }


}