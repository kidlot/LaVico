/**
 * Created by David Xu on 3/14/2014.
 * 会员 - 我的会员卡 - 积分明细
 * 进入页面调用接口获取属于该用户的积分信息，含每笔明细，年度数据前台计算
 * controllers/member/card_member/points/index.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/card_member/points/index.html',
    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        var member_id;
        var total;
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
                middleware.request( "Point/"+member_id,{},this.hold(function(err,doc){

                    var dataJson = JSON.parse(doc);
                    if(dataJson.hasOwnProperty('point')){
                        //当前积分
                        if(parseInt(dataJson.point) === 0){

                            nut.model.remaining = 0;
                            //this.terminate();

                        }else if(parseInt(dataJson.point) < 0){
                            nut.model.remaining = dataJson.point;
                        }else{
                            nut.model.remaining = '+' + dataJson.point;
                        }

                        nut.model.info = 'return_data_true';

                    }else if(dataJson.hasOwnProperty('error')){

                        nut.model.info = 'return_data_error';
                        this.res.end();

                    }else{
                        nut.model.info = 'network_error';

                        this.res.end();
                    }

                }));
            }

        });

        this.step(function(){
                middleware.request( "Point/Log/"+member_id,{
                    'pageNum':1,
                    'perPage':100000
                },this.hold(function(err,doc){

                    var dataJson = JSON.parse(doc);
                    console.log(dataJson);

                    if(parseInt(dataJson.total) == 0){
                        total = 0;
                    }
                }));
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
                    var _time = formatDate(new Date(dataJson.log[i].time));//消费时间
                    var _year = (new Date(dataJson.log[i].time)).getFullYear();
                    var _month = (new Date(dataJson.log[i].time)).getMonth()+ 1;
                    var _value = (dataJson.log[i].value < 0) ? dataJson.log[i].value: ('+'+dataJson.log[i].value);
                    var _source = String(dataJson.log[i].source);

                    if(_source == '01'){
                        _MEMO = '用户消费';
                    }else if(_source == '02'){
                        _MEMO = dataJson.log[i].MEMO;
                    }else if(_source == '03'){
                        _MEMO = '客服调整积分';
                    }else{
                        _MEMO = '';
                    }

                    var _json = {
                        'MEMO' : _MEMO,
                        'timestamp': dataJson.log[i].time,
                        'value' : _value,
                        'time'  : _time,
                        'source' : _source,
                        'meta' : dataJson.log[i].MEMO,
                        'year':_year,
                        'month':_month,
                        'yearmonth':_year+'-'+_month,
                        'type':'data'
                    };
                    newLog.push(_json);

                }
                var _yearMonthLog = new Array();//标记年月，保存记录

                var _temp = newLog[0].yearmonth;
                var _i = 0;

                /*手机年月*/
                for(var i=0; i < newLog.length; i++){

                    if(i == 0){
                        _yearMonthLog.push(newLog[i].yearmonth);
                    }else{
                        if(!contains(_yearMonthLog,newLog[i].yearmonth)){
                            _yearMonthLog.push(newLog[i].yearmonth);
                        }
                    }
                }

                /*数组排序*/
                newLog.sort(function(a,b){return a['timestamp']<b['timestamp']?1:-1});

                /*产生数据*/
                var yearMonthLog = new Array();
                var _sumGetPoint = 0;//获得积分总计
                var _sumUsedPoint = 0;//使用积分总计
                for(var i=0; i < _yearMonthLog.length; i++){

                    for(var j=0; j < newLog.length; j++){
                        if(_yearMonthLog[i] == newLog[j].yearmonth){
                            var _int = parseInt(newLog[j].value);
                            //console.log('_int:'+_int);
                            if(_int > 0 ){
                                _sumGetPoint = _sumGetPoint + _int;
                            }else{
                                _sumUsedPoint = _sumUsedPoint + _int;
                            }
                        }
                    }

                    var _json = {
                        'time':_yearMonthLog[i],
                        'sumGetPoint':_sumGetPoint,
                        'sumUsedPoint':-_sumUsedPoint,
                        'type':'sum'
                    };
                    yearMonthLog.push(_json);

                    _sumGetPoint = 0;
                    _sumUsedPoint = 0;
                }

                /*合并两个数组*/
                for(var i=0; i< newLog.length; i++){
                    if(i==0){
                        //console.log('yearMonthLog[0].time:'+yearMonthLog[0].time);
                        //console.log('newLog[i].yearmonth:'+newLog[i].yearmonth);
                        if(yearMonthLog[0].time == newLog[i].yearmonth){
                            yearMonthLog[0].rank = 1;//表明它是第一行，因为第一行小计和其他小计，样式不一样。
                            yearMonthLog[0].class = 'title2';
                            yearMonthLog[0].time = newLog[0].time;
                            newLog.splice(i,0,yearMonthLog[0]);
                            console.log(yearMonthLog[0]);
                            yearMonthLog.shift();//删除已合并的元素
                        }
                    }else{
                        if(yearMonthLog.length > 0){
                            //console.log('yearMonthLog[0].time:'+yearMonthLog[0].time);
                            //console.log('newLog['+i+'].yearmonth:'+newLog[i].yearmonth);
                            if(yearMonthLog[0].time == newLog[i].yearmonth){
                                yearMonthLog[0].class = 'title3';
                                yearMonthLog[0].time = newLog[i].time;
                                newLog.splice(i,0,yearMonthLog[0]);
                                yearMonthLog.shift();//删除已合并的元素
                            }
                        }
                    }
                }

                nut.model.dataJson = JSON.stringify(dataJson);
                nut.model.log = newLog;//当前会员的积分记录

            }));
        });


    },
    viewIn:function(){


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
function contains(arr, obj) {
    var i = arr.length;
    while(i--){
        if(arr[i] == obj){
            return true;
        }
    }
    return false;
}

