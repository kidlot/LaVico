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
            var pv = 0;//活动参与人数
            var uv = 0;//活动成交人数
            var min = 0;//活动最低成交价格
            var max = 0;//活动最高成交价格
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
                        var productID = product._id;

                        //参与人数:
                        (function(i,then){
                            helper.db.coll("lavico/user/logs").aggregate([
                                {$match:{action:"侃价","data.step":4,'data.productID':productID}},
                                {$group:{_id:"$wxid"}}
                            ],
                                then.hold(function(err,doc){
                                    docs[i].pv = doc.length || 0
                                })
                            )
                        })(i,this);

                        //成交人数:
                        (function(i,then){
                            helper.db.coll("lavico/user/logs").aggregate([
                                {$match:{action:"侃价","data.step":4,"data.stat":true,'data.productID':productID}},
                                {$group:{_id:"$wxid"}}
                            ],
                                then.hold(function(err,doc){
                                    docs[i].uv = doc.length || 0
                                })
                            )
                        })(i,this);

                        //最低成交价
                        (function(i,then){
                            helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,"data.stat":true,'data.productID':productID}).sort({"data.price":1}).limit(1).toArray(then.hold(function(err,doc){
                                docs[i].min = doc && doc[0] ? doc[0].data.price : 0

                            })
                            )
                        })(i,this);

                        //最高成交价
                        (function(i,then){
                            helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,"data.stat":true,'data.productID':seed._id}).sort({"data.price":-1}).limit(1).toArray(then.hold(function(err,doc){
                                docs[i].max = doc && doc[0] ? doc[0].data.price : 0
                            })
                            )
                        })(i,this);

                    }
                }
            });

            this.step(function(){
                if(docs&&docs.length>0){

                    for(var i=0;i<docs.length;i++){
                        var product = docs[i];
                        var productID = product._id;
                        pv + =
                        console.log(product);
                    }
                }
            });

            this.step(function(){

                nut.model.doc = docs;
                nut.model.pv = pv;//活动参与人数
                nut.model.uv = uv;//活动成交人数
                nut.model.min = min;//活动最低成交价格
                nut.model.max = max;//活动最高成交价格


            })





        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }


    }
    , children: {

        //userList: "lavico/bargain/userList.js"

    }
    , viewIn : function(){
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
    }


}