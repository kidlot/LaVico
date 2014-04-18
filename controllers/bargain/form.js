var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/bargain/form.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed._id){

            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
                console.log(doc)
            }))
        }

        //shops
        middleware.request( "Shops",
            {perPage:1000},
            this.hold(function(err,doc){
                nut.model.shops = JSON.parse(doc)
            }));


        this.step(function(){
            nut.model._id = seed._id
            nut.model.doc = doc
        })

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


        jQuery("#colors").tagsManager({
            hiddenTagListName: 'colorsVal'
        });
        jQuery("#sizes").tagsManager({
            hiddenTagListName: 'sizesVal'
        });


        $.each($("#colors").attr("dbValue").split(","),function(i,o){
            $("#colors").tagsManager('pushTag',o);
        })

        $.each($("#sizes").attr("dbValue").split(","),function(i,o){
            $("#sizes").tagsManager('pushTag',o);
        })

        $.each($("#mapsValue").val().split(","),function(i,o){
            $('#maps option').each(function(ii,oo){
                if(o == $(oo).val()){
                    $(oo).attr('selected',"selected");
                }
            })
        })
    }

    , actions: {

        save: {

            process: function(seed,nut)
            {

                nut.view.disable() ;

                var postData = JSON.parse(seed.postData);

                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }

                postData.startDate = new Date(postData.startDate + " 00:00:00").getTime()
                postData.stopDate = new Date(postData.stopDate + " 23:59:59").getTime()
                if(seed._id){

                    helper.db.coll("lavico/bargain").update({_id:helper.db.id(seed._id)},{$set:postData},this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                    }));
                }else{
                    postData.createData = new Date().getTime()
                    helper.db.coll("lavico/bargain").insert(postData,this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                    }));
                }

                nut.message("保存成功",null,'success') ;
            }
        }

        , remove: {

            process: function(seed,nut)
            {
                var res = {}

                if(seed._id){

                    helper.db.coll("lavico/bargain").remove({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                        res = {err:0}
                    }));
                }else{

                    res = {err:1,msg:"没有ID"}
                }

                this.step(function(){
                    nut.disable();
                    var data = JSON.stringify(res);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }
        }

        , deal:{
            process: function(seed,nut){

//                middleware.request( "Coupon/FetchCoupon",
//                    {openid:seed.wxid,otherPromId:"111",PROMOTION_CODE:seed.promotionsCode,qty:seed.price,point:0},
//                    this.hold(function(err,doc){
//                }));

                var bargain = {price:seed.price,productID:seed.productID,name:seed.name,createDate:new Date().getTime(),stat:true}
                helper.db.coll("welab/customers").update({wechatid : seed.wxid}, {$addToSet:{bargain:bargain}},this.hold(function(err,doc){
                    if(err ){
                        throw err;
                    }
                })) ;

                _log(seed.wxid,"侃价",{price:seed.price,productID:seed.productID,step:3,stat:true})
                this.step(function(){
                    nut.disable();
                    var data = JSON.stringify({err:0});
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }
        }
        , giveup:{
            process: function(seed,nut){

                var bargain = {price:seed.price,productID:seed.productID,name:seed.name,createDate:new Date().getTime(),stat:false}
                helper.db.coll("welab/customers").update({wechatid : seed.wxid}, {$addToSet:{bargain:bargain}},this.hold(function(err,doc){
                    if(err ){
                        throw err;
                    }
                })) ;


                _log(seed.wxid,"侃价",{price:seed.price,productID:seed.productID,step:3,stat:false})
                this.step(function(){
                    nut.disable();
                    var data = JSON.stringify({err:0});
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }
        }

        , bargain: {

            process: function(seed,nut){

                var res = {}

                then = this

                var _write = function(res){
                    nut.disable();
                    var data = JSON.stringify(res);
                    then.res.writeHead(200, { 'Content-Type': 'application/json' });
                    then.res.write(data);
                    then.res.end();
                    return;
                }

                if(!seed._id){
                    _write({err:1,msg:"没有_ID"})
                    return;
                }

                if(!seed.wxid){
                    _write({err:1,msg:"没有wxid"})
                    return;
                }


                // step
                if(!this.req.session._bargain_step){
                    this.req.session._bargain_step = 1;
                }

                // repeat
                this.step(function(){

                    helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,wxid:seed.wxid,action:"侃价成交"}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                        if(doc.length > 0){
                            _write({err:1,msg:"您已经成交过此商品，不能再出价了。"})
                            this.terminate()
                        }
                        return;
                    }))
                })

                // timeout
                this.step(function(){

                    helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,wxid:seed.wxid,action:"侃价","data.step":2}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                        if(doc.length > 0){
                            var timeout = 60 * 10 * 1000

                            if( doc[0].createTime + timeout > new Date().getTime()){

                                _write({err:1,msg:"休息休息，10分钟后才能再侃价"})
                                this.terminate()
                            }
                        }
                        return;
                    }))
                })


                // max
                this.step(function(){
                    helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,wxid:seed.wxid,action:"侃价","data.step":3,"data.stat":true}).count(this.hold(function(err,num){

                        helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                            if(num >= _doc.surplus){
                                _write({err:1,msg:"此商品已销售完毕，请选其它商品。"})
                                this.terminate()
                            }
                        }))
                    }))
                })

                this.step(function(){

                    helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                        if(doc){

                            _log(seed.wxid,"侃价",{step:parseInt(this.req.session._bargain_step),price:seed.price,productID:seed._id,bargain:_bargain(seed.price,doc.minPrice)})

                            if(this.req.session._bargain_step == 1){

                                res = {err:0,step:1,doc:_bargain(seed.price,doc.minPrice)}
                                this.req.session._bargain_step = 2;

                            }else if(this.req.session._bargain_step == 2){

                                res = {err:0,step:2,doc:_bargain(seed.price,doc.minPrice)}
                                this.req.session._bargain_step = 1;
                            }


                        }else{
                            res = {err:1,msg:"_ID不存在"}
                        }
                    }))
                })

                this.step(function(){
                    _write(res);
                })
            }
        }
    }
}


function _bargain(price,minPrice){
    return price < parseInt(minPrice) ? "low" : "high";
}



function _log(wxid,action,data){
    helper.db.coll("lavico/user/logs").insert({createTime:new Date().getTime(),wxid:wxid,action:action,data:data}, function(err, doc){
        if(err)console.log(err)
    })
}