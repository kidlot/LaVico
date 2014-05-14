var wechatapi = require("welab/lib/wechat-api.js");
var aSteps = require("../lib/aSteps.js");
var middleware = require('lavico/lib/middleware.js');
var Steps = require("opencomb/node_modules/ocsteps");

exports.load = function () {

    wechatapi.registerReply(9,function(msg,req,res,next){

        if(msg.MsgType=="location"){
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
                            console.log("所有门店返回123")
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
/*
                    replyArr=[
                        {
                            "title": "上海东方商厦有限公司店距离:2.35公里",
                            "description": "上海市曹溪北路8号东方商厦3楼男装部朗维高专柜",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL11L     1"
                        },
                        {
                            "title": "上海新世界店距离:7.67公里",
                            "description": "上海市南京西路2-88号上海新世界4楼精品柜朗维高",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL11M     1"
                        },
                        {
                            "title": "上海八佰伴店距离:9.67公里",
                            "description": "上海市浦东张扬路501号",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL111     1"
                        },
                        {
                            "title": "HARRODS LTD店距离:11966.38公里",
                            "description": null,
                            "picurl": "1",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=H0001     1"
                        },
                        {
                            "title": "镇江百盛店距离:12969.69公里",
                            "description": "镇江市中山东路214号3楼",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL127     1"
                        },
                        {
                            "title": "南京金鹰店距离:12969.69公里",
                            "description": "南京市汉中路89号金鹰国际购物中心4F ",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL12E     1"
                        },
                        {
                            "title": "上海金鹰店距离:12969.69公里",
                            "description": "上海市陕西北路278号5楼朗维高专柜",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL101     1"
                        }
                        ,
                        {
                            "title": "上海友谊店距离:12969.69公里",
                            "description": "上海长寿路1188号2楼",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL011     1"
                        },
                        {
                            "title": "上海友谊店距离:12969.69公里",
                            "description": "上海长寿路1188号2楼",
                            "picurl": "http://test.welab.lavicouomo.com/lavico/public/images/lavico_default.png",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=HL011     1"
                        },
                        {
                            "title": "HARRODS LTD店距离:11966.38公里",
                            "description": null,
                            "picurl": "1",
                            "url": "http://test.welab.lavicouomo.com/lavico/store/searchByCity:show?CODE=H0001     1"
                        }

                    ]
*/
                    res.reply(replyArr);
                }
            )()
        }else{
            next()
        }
    })
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
