/**
 * Created by David Xu on 7/28/14.
 */
module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/bargain/categorys/statisticsCat.html"

    , process: function(seed,nut)
    {
        if(seed._id){

            nut.model._id = seed._id;
            var then = this
            var docs;//当前分类所属的侃价
            var categoryInfo;
            var pvAll = 0;//活动参与人次
            var pv = 0;//活动参与人数
            var uv = 0;//活动成交人次
            var uvLonely = 0;//活动成交人此
            var wechatArr = [];
            var min ;//活动最低成交价格
            var max ;//活动最高成交价格
            nut.model.categoryName = false;
            nut.model.startDate = '';
            nut.model.stopDate = '';
            this.step(function(){
                helper.db.coll("lavico/bargain/categorys").find({_id:helper.db.id(seed._id)}).toArray(this.hold(function(err,_doc){

                    categoryInfo = _doc[0];
                    nut.model.categoryName = categoryInfo.title;//侃价分类名称

                }));

                helper.db.coll("lavico/bargain").find({categoryId:seed._id}).toArray(this.hold(function(err,_doc){

                    docs = _doc;//当前分类所属的侃价
                    //console.log(docs);
                }));
            });

            this.step(function(){
                if(docs&&docs.length>0){

                    for(var i=0;i<docs.length;i++){
                        var product = docs[i];
                        var productID = ''+product._id;
                        //参与人次:
                        (function(i){
                            console.log({action:"侃价","data.step":4,'data.productID':productID});

                            helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,'data.productID':productID}).toArray(then.hold(function(err,_doc){
                                if(_doc&&_doc.length>0){
                                    docs[i].pvAll = _doc.length
                                }else{
                                    docs[i].pvAll = 0
                                }
                            }));
//                            helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":1,'data.productID':productID}).count(then.hold(function(err,doc){
//                                console.log("doc",doc)
//                                docs[i].pvAll = doc.length || 0
//                            }))

//
//                            helper.db.coll("lavico/user/logs").aggregate([
//                                {$match:{action:"侃价","data.step":4,'data.productID':productID}},
//                                {$group:{_id:"$wxid"}}
//                            ],
//                                then.hold(function(err,doc){
//                                    docs[i].pvAll = doc.length || 0
//                                })
//                            )
                        })(i);
                        //参与人数:
                        (function(i){
                            console.log({action:"侃价","data.step":4,'data.productID':productID});
                            helper.db.coll("lavico/user/logs").aggregate([
                                {$match:{action:"侃价","data.step":4,'data.productID':productID}},
                                {$group:{_id:"$wxid"}}
                            ],
                                then.hold(function(err,doc){
                                    docs[i].pv = doc.length || 0
                                })
                            )
                        })(i);

                        //成交人数:
                        (function(i){
                            helper.db.coll("lavico/user/logs").aggregate([
                                {$match:{action:"侃价","data.step":4,"data.stat":true,'data.productID':productID}},
                                {$group:{_id:"$memberID"}}
                            ],
                                then.hold(function(err,doc){
                                    docs[i].uv = doc.length || 0;
                                    for(var j=0;j<doc.length;j++){
                                        wechatArr.push(doc[j]._id);
                                    }
                                })
                            )
                        })(i);

                        //最低成交价
                        (function(i){
                            helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,"data.stat":true,'data.productID':productID}).sort({"data.price":1}).limit(1).toArray(then.hold(function(err,doc){
                                docs[i].min = doc && doc[0] ? doc[0].data.price : 0

                            })
                            )
                        })(i);

                        //最高成交价
                        (function(i){
                            helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,"data.stat":true,'data.productID':productID}).sort({"data.price":-1}).limit(1).toArray(then.hold(function(err,doc){
                                docs[i].max = doc && doc[0] ? doc[0].data.price : 0;
                                if(docs[i].max == 0){
                                    docs[i].max = docs[i].min;
                                }
                            })
                            )
                        })(i);

                    }
                }
            });

            this.step(function(){
                if(docs&&docs.length>0){

                    for(var i=0;i<docs.length;i++){
                        var product = docs[i];
                        var productID = product._id;
                        pvAll += docs[i].pvAll;
                        pv += docs[i].pv;
                        uv += docs[i].uv;
                        if(i == 0){
                            min = docs[i].min;
                            max = docs[i].max;
                        }else{
                            if(min > docs[i].min){
                                min = docs[i].min;
                            }
                            if(max < docs[i].max){
                                max = docs[i].max;
                            }
                        }
                    }
                }
            });

            this.step(function(){

                nut.model.doc = docs;
                nut.model.pvAll = pvAll;//活动参与人次
                nut.model.pv = pv;//活动参与人数
                nut.model.uv = uv;//活动成交人次
                uvLonely = wechatArr.uniq().length;//活动成交人数
                nut.model.uvLonely = uvLonely;
                nut.model.min = min;//活动最低成交价格
                nut.model.max = max;//活动最高成交价格
                console.log(wechatArr);
                //this.terminate();

            });



        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }


        this.step(function(){


            var dTime = new Date()
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)
            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,_id:seed._id,unwind:"bargain"};
        })


    }
    , children: {

        userList: "lavico/bargain/categorys/userListCat.js"

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

        $("#exportssd").attr("href","/lavico/bargain/categorys/userListCat:exports?_id="+$("#_id").val()+"&unwind=bargain&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%97%B6%E9%97%B4%22%7D")
    }


}

Array.prototype.uniq = function() {
    //去除重复元素
    var temp = {}, len = this.length;

    for(var i=0; i < len; i++)  {
        if(typeof temp[this[i]] == "undefined") {
            temp[this[i]] = 1;
        }
    }
    this.length = 0;
    len = 0;
    for(var i in temp) {
        this[len++] = i;
    }
    return this;
}