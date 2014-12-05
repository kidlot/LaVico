var wechatapi = require("welab/lib/wechat-api.js");
var aSteps = require("../lib/aSteps.js");
var middleware = require('lavico/lib/middleware.js');
var Steps = require("opencomb/node_modules/ocsteps");

exports.load = function () {

    wechatapi.registerReply(9,function(msg,req,res,next){
        var docJson;
        var jsonData={};
        var storeDistance=[];
        var storeList=[];
        var replyArr=[];
        //手动发送地址
        var lat,lng;
        console.log("msg.MsgType:"+msg.MsgType);
        if(msg.MsgType=="location"){
            console.log("********record location*********");
            Steps(
                function(){
                    lat=msg.Location_X;
                    lng=msg.Location_Y;
                },

                function(){
                    postData={"location":[msg.Location_X,msg.Location_Y]};
                    helper.db.coll("welab/customers").update({"wechatid":msg.FromUserName}, {$set:postData},
                        {multi: false},function(err,doc){
                            if(err)throw err;
                            console.log("*******change position record*******");
                        });
                },

                function(){
                    jsonData.perPage=1000;
                    jsonData.pageNum=1;
                    //接口返回的doc都是字符串
                    middleware.request('Shops',jsonData,
                        this.hold(function(err,doc){
                            if(err) throw err;
                            console.log("******Shops info come back*********");
                            docJson=JSON.parse(doc);
                            console.log(docJson)
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
                            reply.picurl="http://wx.lavicouomo.com/lavico/public/images/lavico_default.png";
                        else{
                            reply.picurl=storeList[i].PICURL;
                        }
                        var newCODE=(storeList[i].CODE).replace(/\s/g,'');
                        var city;
                        if(storeList[i].CITY!=null){
                            city = encodeURIComponent(storeList[i].CITY+"市")
                        }else{
                            city="null";
                        }
                            //reply.url='http://wx.lavicouomo.com/lavico/store/searchByCity:show?CODE='+newCODE+'&wxid='+msg.FromUserName;
                            reply.url='http://wx.lavicouomo.com/lavico/store/searchByCity:show?CODE='+newCODE+'&wxid='+msg.FromUserName+'&city='+city;

                        if(i<10)
                            replyArr.push(reply);
                    }
                },
                function(){
                    res.reply(replyArr);

                }
            )()

        }else{
            next();
        }
    })
    //上报地理位置(进入服务号时)
    wechatapi.registerReply(9,function(msg,req,res,next){
        if(msg.MsgType=="event" && msg.Event=="LOCATION"){
            console.log("******get user position******");
            postData={"location":[msg.Latitude,msg.Longitude]};
            helper.db.coll("welab/customers").update({"wechatid":msg.FromUserName}, {$set:postData},
                {upsert: true},function(err,doc){
                    if(err)throw err;
                    console.log("doc",doc)
                    if(doc){
                        console.log("*******update db*******");
                    }else{
                        console.log("***********error************")
                    }
                });
            helper.db.coll("welab/location").insert({"wechatid":msg.FromUserName,"lat":msg.Latitude,"lng":msg.Longitude,"createTime":new Date().getTime()},function(err,doc){

            })
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write('');
            res.end();
            //next();
        }else{
            next();
        }
    })

    wechatapi.registerReply(9,function(msg,req,res,next){
        //点击“附近门店”
        if(msg.EventKey == "shop" && msg.Event=="CLICK"){
            console.log("*******shop search start********");
            var lat,lng;

            var docJson;
            var jsonData={};
            var storeDistance=[];
            var storeList=[];
            var replyArr=[];

            Steps(
                function(){
                    helper.db.coll("welab/customers").findOne({"wechatid":msg.FromUserName},function(err,doc){
                        if(err) throw err;
                        if(doc){
                            if(doc.location){
                                lat=doc.location[0];
                                lng=doc.location[1];
                                console.log("lat:"+lat);
                                console.log("lng:"+lng);
                            }else{
                                res.reply('请按以下步骤发送您的位置来查看离您最近的\r\nLaVico朗维高门店：\r\n1.点击左下角小键盘按钮切换到输入模式。\r\n2.点击右侧“+”号按钮。\r\n3.点击位置按钮。');
                            }
                        }
                    })}
            )()

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
                                var kgmeter=getGreatCircleDistance(lng,lat,docJson.list[i].LOG,docJson.list[i].LAT)/1000
                                //if(kgmeter<100) {
                                    docJson.list[i].distance = changeTwoDecimal(kgmeter)
                                    storeDistance.push(changeTwoDecimal(kgmeter))
                                //}
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
                            reply.picurl="http://wx.lavicouomo.com/lavico/public/images/lavico_default.png";
                        else{
                            reply.picurl=storeList[i].PICURL;
                        }
                        var newCODE2=(storeList[i].CODE).replace(/\s/g,'');
                        var city;
                        if(storeList[i].CITY!=null){
                            city = encodeURIComponent(storeList[i].CITY+"市")
                        }else{
                            city="null";
                        }
                            //reply.url="http://wx.lavicouomo.com/lavico/store/searchByCity:show?CODE="+newCODE2+"&wxid="+msg.FromUserName;
                            reply.url="http://wx.lavicouomo.com/lavico/store/searchByCity:show?CODE="+newCODE2+"&wxid="+msg.FromUserName+'&city='+city;

                        if(i<10)
                            replyArr.push(reply);
                    }
                },
                function(){
                    res.reply(replyArr);
                }
            )()

        }else{
            next();
        }
    })

    wechatapi.makeQueue();

    wechatapi.registerReply(14,function(msg,req,res,next){

        if(msg.MsgType=="text" && msg.Content=="wz"){
            var replyarr;
            var list="无";
            Steps(
                function(){
                    helper.db.coll("welab/location").find({"wechatid":msg.FromUserName}).sort({"createTime":-1}).toArray(this.hold(function(err,doc){
                        if(err) throw err;
                        if(doc){
                            list = doc[0]
                        }
                    }))
                },
                function(){
                    if(list){
                        res.reply("您最后一次获取坐标的记录:\r 微信ID:"+list.wechatid+"\r\n坐标:"+list.lat+","+list.lng+"\r\n获取时间:\r"+formatTime(list.createTime))
                    }
                }
            )()
        }else{
            next();
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
        console.log('parameter error');
        return false;
    }
    var f_x = Math.round(floatvar*100)/100;
    return f_x;
}

function   formatTime(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=(now.getMonth()+1>9)?(now.getMonth()+1):('0'+(now.getMonth()+1));
    var   date=(now.getDate()>9)?now.getDate():('0'+now.getDate());
    var   hour=(now.getHours()>9)?now.getHours():('0'+now.getHours());
    var   minute=(now.getMinutes()>9)?now.getMinutes():('0'+now.getMinutes());
    var   second=(now.getSeconds()>9)?now.getSeconds():('0'+now.getSeconds());
    return   year+"-"+month+"-"+date+"\r"+hour+ ":"+minute+":"+second;
}
