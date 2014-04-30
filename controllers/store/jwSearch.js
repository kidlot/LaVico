var middleware = require('../../lib/middleware.js');
module.exports={
    layout: null,
    view:"lavico/templates/store/jwSearch.html",
    process:function(seed,nut){
        //获取用户的位置
        var lng;//经度
        var lat;//纬度
        this.step(function(){
            lng=seed.lng;
            lat=seed.lat;
        })

        var docJson;
        this.step(function(){
            var jsonData={}
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
        })

        var storeDistance=[];
        this.step(function(){
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
        })
        var storeList=[];
        this.step(function(){
            try{
            for(var i=0;i<storeDistance.length;i++){
                for(var j=0;j<docJson.list.length;j++){
                    if(storeDistance[i]==docJson.list[j].distance){
                        storeList.push(docJson.list[j]);
                    }
                }
            }

            for(var i=0;i<storeList.length;i++){
                console.log(storeList[i]);
            }
            }catch(e){
                if(e) throw e;
            }
        })

    }
}

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