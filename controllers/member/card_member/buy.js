/**
 * Created by David Xu on 3/14/2014.
 * 会员 - 我的会员卡 - 消费记录
 * controllers/member/card_member/buy.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {
    layout:'lavico/member/layout',
    view:'lavico/templates/member/card_member/buy.html',
    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        var memberID;//用户的会员号码
        var total;////记录消费记录的条数
        var returnData;//中间件返回的原始数据
        var info = 'return_data_true';
        var log;//详细记录
        var userSumPoints = 0;//用户消费总积分
        var newLogArr = [];//前端页面显示的记录
        var newLogSumArr = [];//消费积分小结
        var yearMonthArr = [];//保存年月
        var getSumPoints = 0;//用户获得到的积分

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
                            memberID =  doc.HaiLanMemberInfo.memberID;
                        }else{
                            memberID = 'undefined';
                        }
                    }));

                }
        });

        //接口处理-个人积分接口
        this.step(function(){

            if(memberID == "undefined"){

                //缺少微信ID参数，强制中断
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"memberid_not_found"}');
                this.res.end();
                this.terminate();

            }else{

                nut.model.wxid = wxid ;
                nut.model.memberID = memberID;
                middleware.request( "Member/Spending/"+memberID,{"perPage":10000,"pageNum":1},this.hold(function(err,doc){

                    returnData = JSON.parse(doc);

                    if(returnData.hasOwnProperty('total')){
                        total = returnData.total;
                    }else{
                        info = 'total_no_valid';
                    }

                    if(returnData.hasOwnProperty('log')){
                        log = returnData.log;
                    }else{
                        info = 'log_no_valid';
                    }
                    //console.log(log);
                    /*
                    *  { AMT: 1690,
                     date: 1398268800000,
                     POINT: 1690,
                     SHOP_NAME: '江阴华联',
                     PRODUCT_NAME: '朗维高(-)',
                     GOODSNO: 'YM0102',
                     row_number: 36 },
                    * */
                }));
            }

        });

        this.step(function(){
            console.log(info);
            if(info == 'return_data_true'){
                for(var _i = 0;_i<log.length;_i++){
                    var _tmpLog = log[_i];

                    /*时间加工*/
                    var _time = new Date(_tmpLog.date);//消费时间，_tmpLog.date单位为毫秒级

                    var _formatTime = formatDate(_time);//格式化后的时间
                    var _year = _time.getFullYear();
                    var _month = _time.getMonth()+ 1;


                    console.log(_formatTime);

                    var _point = _tmpLog.POINT > 0 ? ('+'+_tmpLog.POINT): _tmpLog.POINT;
                    userSumPoints = eval(userSumPoints + _point);//用户消费总积分
                    var _shopName = _tmpLog.SHOP_NAME;
                    var _productName = _tmpLog.PRODUCT_NAME;



                    /*拼装消费记录列表*/
                    var _perLogData = {
                        'MEMO' : _productName,
                        'timestamp': _tmpLog.date,
                        'value' : _point,//积分
                        'time'  : _formatTime,
                        'year':_year,
                        'month':_month,
                        'yearmonth':_year+'-'+_month,
                        'type':'data'
                    };
                    newLogArr.push(_perLogData);

                    /*提取日期列表*/
                    var _yearMonthData = _year+'-'+_month;
                    if(!contains(yearMonthArr,_yearMonthData)){
                        yearMonthArr.push(_yearMonthData);
                    }


                }
                console.log(newLogArr);
                console.log(yearMonthArr);
            }

        });

        this.step(function(){
            //合并数据，输出最终数据结果
            for(var _i=0;_i<yearMonthArr.length;_i++){

                var _tmpGetSumPoints = 0;

                for(var _j=0;_j<newLogArr.length;_j++){
                    console.log(newLogArr[_j]);
                    if(yearMonthArr[_i] == newLogArr[_j].yearmonth){
                        _tmpGetSumPoints = _tmpGetSumPoints + newLogArr[_j].value;
                    }
                }

                var _tmpSumLog = {
                    'yearmonth':yearMonthArr[_i],
                    'value':_tmpGetSumPoints,
                    'type':'sum'
                };
                if(_i == 0){
                    _tmpSumLog.rank = 1;
                    _tmpSumLog.class = 'title2';
                }else{
                    _tmpSumLog.rank = _i + 1;
                    _tmpSumLog.class = 'title3';
                }

                newLogSumArr.push(_tmpSumLog);

            }

            /*
            * @newLogSumArr 小结数组
            * @newLogArr 消费明细
            * */

            for(var _i=0; _i< newLogArr.length; _i++){
                if(newLogSumArr.length > 0){
                    if(newLogArr[_i].yearmonth == newLogSumArr[0].yearmonth){
                        newLogSumArr[0].time = newLogArr[_i].time;
                        newLogArr.splice(_i,0,newLogSumArr[0]);
                        newLogSumArr.shift();//删除已合并的元素
                    }
                }

            }

            console.log(newLogArr);

            nut.model.log = newLogArr;
            nut.model.info = "return_data_true";
            nut.model.remaining = userSumPoints;//用户消费获得的积分

        });
    },
    viewIn:function(){}
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