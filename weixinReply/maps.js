var wechatapi = require("welab/lib/wechat-api.js");
var aSteps = require("../lib/aSteps.js");
var middleware = require('lavico/lib/middleware.js');
var Steps = require("opencomb/node_modules/ocsteps");

exports.load = function () {

    wechatapi.registerReply(9,function(msg,req,res,next){


        if(msg.EventKey === "shop"){
            console.log("门店查询开始!!!");
            var lat=msg.Location_X;
            var lng=msg.Location_Y;

            var docJson;
            var jsonData={};
            var storeDistance=[];
            var storeList=[];
            var replyArr=[];

            Steps(
                function(){
                    jsonData.perPage=1000;
                    jsonData.pageNum=1;
                    //接口返回的doc都是字符串
                    middleware.request('Shops',jsonData,
                        this.hold(function(err,doc){

                            if(err) throw err;
                            docJson=JSON.parse(doc);
                            //return docJson;//注意字符串和对象格式
                        })
                    )
                },
                //计算两点之间距离
                function(){
                    if(docJson){
                        for(var i=0;i<docJson.list.length;i++){
                            if(docJson.list[i].LOG!=null && docJson.list[i].LAT!=null){
                                var kgmeter=getGreatCircleDistance(lng,lat,docJson.list[i].LOG,docJson.list[i].LAT)/1000;
                                docJson.list[i].distance=changeTwoDecimal(kgmeter)
                                storeDistance.push(changeTwoDecimal(kgmeter))
                            }
                        }
                        storeDistance=storeDistance.sort(function(a,b){return a>b?1:-1});
                    }
                },

                function(){
                    try{
                        for(var i=0;i<storeDistance.length;i++){
                            for(var j=0;j<docJson.list.length;j++){
                                if(storeDistance[i]==docJson.list[j].distance){
                                    storeList.push(docJson.list[j]);
                                }
                            }
                        }
                    }catch(e){
                        if(e) throw e;
                    }
                },

                function(){
                    for(var i=0;i<storeList.length;i++){
                        reply={};
                        reply.title=storeList[i].NAME+"店距离:"+storeList[i].distance+"公里";
                        reply.description=storeList[i].ADDR;
                        if(storeList[i].PICURL==null)
                            reply.picurl="http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png";
                        else
                            reply.picurl=storeList[i].PICURL;

                        reply.url="http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE="+storeList[i].CODE+"1";
                        if(i<10)
                            replyArr.push(reply);
                    }
                },
                function(){
                    console.log(JSON.stringify(replyArr));
                    console.log(res);
                    res.reply(replyArr);
                }
            )()
        }else{
            next()
        }
    })

//
//    wechatapi.registerReply(9,function(msg,req,res,next){
//        console.log("msg.MsgType:"+msg.MsgType);
//        console.log("msg.Event:"+msg.Event);
//        if(msg.MsgType=="event" && msg.Event=="LOCATION" || msg.Content=="hb"){
//            helper.db.coll("lavico/locationPosition").insert(msg);
//
//        }
//    })

    wechatapi.makeQueue();
};


var EARTH_RADIUS = 6378137.0;    //单位M
var PI = Math.PI;

function getRad(d){
    return d*PI/180.0;
}

//两点之间的距离
function getGreatCircleDistance(lng1,lat1,lng2,lat2)
{
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);

    var dy = radLat1 - radLat2;	//a
    var dx = getRad(lng1) - getRad(lng2);	//b

    var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(dy/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(dx/2),2)));
    s = s*EARTH_RADIUS;
    s = Math.round(s*10000)/10000.0;

    return s;
}

function changeTwoDecimal(floatvar)
{
    var f_x = parseFloat(floatvar);
    if (isNaN(f_x))
    {
        alert('function:changeTwoDecimal->parameter error');
        return false;
    }
    var f_x = Math.round(floatvar*100)/100;
    return f_x;
}
