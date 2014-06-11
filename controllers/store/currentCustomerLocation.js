var middleware = require('../../lib/middleware.js');
module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/store/storeGo.html",
    process:function(seed,nut){
        //接口读取门店列表(设置1000代表每页条数，即一次性全部返回)

        nut.model.wxid = seed.wxid ? seed.wxid : 'undefined';
        console.log("wxid:"+seed.wxid);

        //从数据库获取坐标
        this.step(function(){
             if(seed.wxid!="" && seed.wxid!="underfined"){
                 helper.db.coll("welab/customers").findOne({"wechatid":seed.wxid},this.hold(function(err,doc) {
                         if (err) throw err;
                         if (doc) {
                             if (doc.location) {

                                 //exists
                                 nut.model.locationLat = doc.location[0];
                                 nut.model.locationLng = doc.location[1];
                             } else {

                                 //121.475538,31.236071
                                 nut.model.locationLat = "31.236071";
                                 nut.model.locationLng = "121.475538";
                             }
                         } else {

                             nut.model.locationLat = "31.236071";
                             nut.model.locationLng = "121.475538";
                         }
                     })
                 )
             }
        })

    },
   actions:{
        show: {
//            layout:null,
//            view:null,
            layout:"lavico/layout",
            view:"lavico/templates/store/store_num2.html",
            process: function (seed, nut){
                nut.model.wxid = seed.wxid ? seed.wxid : 'undefined';
                        this.step(function () {
                            var jsonData = {}
                            jsonData.perPage = 1000;
                            jsonData.pageNum = 1;
                            //接口返回的doc都是字符串
                            middleware.request('Shops', jsonData,
                                this.hold(function (err, doc) {

                                    if (err) throw err;
                                    return JSON.parse(doc);//注意字符串和对象格式
                                })
                            )
                        })

                   var list1 = [];
            this.step(function (doc) {

                var cityName = (seed.cityName).replace("市",'');


                for (var i = 0; i < doc.list.length; i++) {
                    if (doc.list[i].CITY == cityName) {
                        var newCODE = (doc.list[i].CODE).replace(/\s/g, '');
                        doc.list[i].CODE = newCODE;
                        if(doc.list[i].ACT){
                            if(doc.list[i].ACT.length>10){
                                var act = doc.list[i].ACT.replace(/<[\/]*br[^>]*>/img, "")
                                doc.list[i].ACT = act.substr(0,30)+"......";
                                console.log("sa:"+act)
                            }
                        }
                        list1.push(doc.list[i]);

                    }
                }

                console.log("list1")
                console.log(list1);
                if(list1.length>0){
                    nut.model.cityName=seed.cityName;
                    nut.model.city_docs = list1;
                    nut.model.currentCityName = seed.city;
                }else{
                    nut.view.disable();
                    nut.write("<script>window.onload=function(){window.popupStyle2.on('很抱歉，本城市没有LaVico品牌专柜，请选择其他城市查询',function(event){location.href='javascript:history.back()'})}</script>");
                }
            })

        }


        }
    }

}
