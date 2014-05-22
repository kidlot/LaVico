/**
 * Created by David Xu on 5/15/14.
 * 兑换记录（积分兑换礼品的记录）
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/card_member/points/redeem/record.html',
    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        var member_id;
        var total = 0;
        var remaining = 0;//用户积分
        var count;
        var dataArr;//用户兑换信息
        var yearMonthLog = [];
        var yearMonthArr = [];

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



        this.step(function(){

            if(member_id == "undefined"){
                //缺少微信ID参数，强制中断

                //直接跳转
                this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wxid});
                this.res.end();

                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"memberid_not_found"}');
                this.res.end();
                this.terminate();

            }else{

                nut.model.wxid = wxid ;
                console.log('wxid:'+wxid);
                nut.model.member_ID = member_id;
                console.log('member_id:'+member_id);

            }

        });

        this.step(function(){

            console.log(member_id);
            helper.db.coll("lavico/exchangeRecord").find({memberId:member_id.toString()}).toArray(this.hold(function(err,doc){
                dataArr = doc;
            }));
        });

        this.step(function(){

            count = dataArr.length;


            if(dataArr.length < 1){

                remaining = 0;
                nut.model.remaining = 0;
                nut.model.total = 0;

            }else{

                dataArr.sort(function(a,b){return a['createDate']<b['createDate']?1:-1});//排序

                remaining = 1;
                nut.model.remaining = 1;
                for(var _i=0;_i<count;_i++){

                    if(dataArr[_i].hasOwnProperty('needScore')){

                        total = total + parseInt(dataArr[_i].needScore);
                        dataArr[_i].formatTime = formatDate(new Date(dataArr[_i].createDate));
                        dataArr[_i].year = new Date(dataArr[_i].createDate).getFullYear();
                        dataArr[_i].month = new Date(dataArr[_i].createDate).getMonth() + 1;
                        dataArr[_i].day = new Date(dataArr[_i].createDate).getDate();
                        dataArr[_i].yearmonth = dataArr[_i].year+'-'+dataArr[_i].month;
                        dataArr[_i].type = 'data';

                    }


                }
                nut.model.total = total;
            }
        });



            this.step(function(){

                //console.log(dataArr);
                var _yearMonth = [];

                for(var _i=0; _i < dataArr.length; _i++){

                    _yearMonth = dataArr[_i].yearmonth;


                    if(_i == 0){

                        yearMonthLog.push(_yearMonth);

                    }else{
                        if(!contains(yearMonthLog,_yearMonth)){

                            yearMonthLog.push(_yearMonth);
                        }
                    }
                }

            });
            this.step(function(){

                for(var _i=0; _i < yearMonthLog.length; _i++){

                    var _year = yearMonthLog[_i].split('-')[0];
                    var _month = yearMonthLog[_i].split('-')[1];
                    var _type = 'sum';
                    var _formatTime = _year+'年'+_month+'月';
                    var _yearmonth = yearMonthLog[_i];
                    var _json = {
                        'year':_year,
                        'month':_month,
                        'formatTime':_formatTime,
                        'yearmonth':_yearmonth,
                        'type':_type
                    };
                    yearMonthArr.push(_json);
                }
            });



            this.step(function(){

                console.log(dataArr);
                /*合并两个数组*/
                console.log(yearMonthArr);
                var resultArr = [];
                for(var i=0; i< dataArr.length; i++){

                    console.log(dataArr[i]);
                        if(i ==0){
                            if(dataArr[i].yearmonth == yearMonthArr[0].yearmonth){
                                yearMonthArr[0].rank = i +1;
                                yearMonthArr[0].class = 'title2';
                                dataArr.splice(i,0,yearMonthArr[0]);
                                yearMonthArr.shift();

                            }
                        }else{
                            if(yearMonthArr.length > 0){
                                if(dataArr[i].yearmonth == yearMonthArr[0].yearmonth){
                                    yearMonthArr[0].rank = i +1;
                                    yearMonthArr[0].class = 'title3';

                                    dataArr.splice(i,0,yearMonthArr[0]);
                                    yearMonthArr.shift();//删除已合并的元素
                                }
                            }
                        }

                }
            });

            this.step(function(){
                console.log(dataArr);
                nut.model.log = dataArr;

            });



    },
    viewIn:function(){
        $('#loading').hide();//隐藏加载框
        var wxid = $('wxid').val();
        /*兑换产品的链接*/
        $('.reddem').click(function(){
            var _reddem_id = $(this).attr('id');
            window.location.href = '/lavico/reedem/reedemdetail?_id='+_reddem_id+'&wxid='+wxid;
        });
    }

}

function   formatDate(now){
    var   year=now.getFullYear();
    var   month=now.getMonth()+1;
    var   date=now.getDate();
    var   hour=now.getHours();
    var   minute=now.getMinutes();
    var   second=now.getSeconds();
    return   year+"年"+month+"月";
}
function   formatTime(now){
    var   year=now.getFullYear();
    var   month=now.getMonth()+1;
    var   date=now.getDate();
    var   hour=now.getHours();
    var   minute=now.getMinutes();
    var   second=now.getSeconds();
    return   year+"年"+month+"月"+date+"日 "+hour+":"+minute+':'+second;
}
function contains(arr, obj) {
    var i = arr.length;
    while(i--){
        if(arr[i] == obj){
            return true;
        }
    }
    return false;
}