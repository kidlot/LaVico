var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/bargain/form.html"

    , process: function(seed,nut)
    {
        nut.model.type = seed.type ? seed.type : 0;
        nut.model.host = this.req.headers.host;
        var doc = {};
        var promotions;

        if(seed._id){

            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                if(err) throw err;
                if(_doc){
                    _doc.description = decodeURIComponent(_doc.description);
                }
                doc = _doc || {}
            }))
        };
        var catslist = [];
        helper.db.coll("lavico/bargain/categorys").find({}).sort({createTime:-1}).toArray(this.hold(function(err,docs){
            if(err) throw  err;
            if(docs){
                catslist = docs || {};
                nut.model.catslist = catslist;
                console.log(catslist);
            }
        }));

        this.step(function(){
            //shops
            middleware.request( "Shops",
                {perPage:1000},
                this.hold(function(err,doc){
                    nut.model.shops = JSON.parse(doc)
                }));

            //getPromotions by David.xu 2014-06-23
            middleware.request('Coupon/Promotions', {
                perPage: 1000,
                pageNum: 1
            }, this.hold(function (err, doc) {
                doc = doc.replace(/[\n\r\t]/, '');
                var doc_json = eval('(' + doc + ')');
                if (doc_json && doc_json.list) {
                    promotions = doc_json.list;
                } else {
                    promotions = {};
                }
            }))
        });
        this.step(function(){
            nut.model.promotions = promotions;
            nut.model._id = seed._id
            nut.model.doc = doc
            nut.model.maps =JSON.stringify(doc.maps);
        });



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
        //流程设置
        $('input[name="parm"]').change(function (){
            var _parm  = $('input[name="parm"]:checked').val();
            if(_parm=='02'||_parm=='03'){
                $('#deductionIntegral').val(0).attr("readonly","readonly");
            }else{
                $('#deductionIntegral').removeAttr("readonly");
            }

        });

        //保存
        window.save = function(){

            var aFormInput = {}
            var _inputCheck = true;
            $(".postData").each(function(i,o){
                if(! $(o).val()){
                    _inputCheck = false;
                    $.globalMessenger().post({
                        message: $(o).parent().prev().text() + " 不能为空！",
                        type: 'error',
                        showCloseButton: true})
                }
                aFormInput[$(o).attr("id")] = $(o).val()
            })
            var maplist=[];

            $('#maps_two option').each(function () {
                var $option = $(this);
                maplist.push($option.val())
            });
            aFormInput['maps'] = maplist;

            aFormInput['pic'] = $("#showPic").attr("src")
            aFormInput['pic_big'] = getBigPicList()

            if($("input[name='colorsVal']").val()) aFormInput['colors'] = $("input[name='colorsVal']").val().split(",")
            if($("input[name='sizesVal']").val()) aFormInput['sizes'] = $("input[name='sizesVal']").val().split(",")

            /*David.xu添加最高价格at2014-06-19*/
            var _minPrice = parseInt($('#minPrice').val());//最低价格
            var _maxPrice = parseInt($('#maxPrice').val());//最高价格
            var _price = parseInt($('#price').val());//市场零售价

            if(!(_minPrice <= _maxPrice && _maxPrice <= _price)){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "最高价格必须大于等于最低价格，小于等于市场零售价！",
                    type: 'error',
                    showCloseButton: true})
            }
            var startDate = $('#startDate').val();//开始时间
            var stopDate = $('#stopDate').val();//结束时间
            if(startDate>stopDate){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "开始时间不能大于结束时间！",
                    type: 'error',
                    showCloseButton: true})
            }

            /*David.xu添加最高价格at2014-06-19*/
            aFormInput['categoryId'] = $("#categoryId").val();
            /*David.xu添加最高价格at2014-08-26*/
            aFormInput['parm'] = $('input[name="parm"]:checked').val();

            //alert($("#categoryId").val());
            console.log(aFormInput);

            if(_inputCheck){
                var oLinkOptions = {} ;
                oLinkOptions.data = [{name:'postData',value:JSON.stringify(aFormInput)},{name:'_id',value:$("#_id").val()}];
                oLinkOptions.type = "POST";
                oLinkOptions.url = "/lavico/bargain/form:save";
                $.request(oLinkOptions,function(err,nut){
                    //if(err) throw err ;
                    nut.msgqueue.popup() ;
                    $.controller("/lavico/bargain/index",null,"lazy");
                }) ;
            }
        }

        //显示数据库已保存的门店
        window.load = function (){
            var maplist=[];
            $('#maps option').each(function () {
                var $option = $(this);
                var map={};
                map.text = $option.html();
                map.value = $option.val();
                maplist.push(map);
            });
            if(maplist&&maplist.length>0&&maps&&maps.length>0){
                for(var i=0;i<maplist.length;i++){
                    for(var j=0;j<maps.length;j++){
                        if($.trim(maplist[i].value) == $.trim(maps[j])){
                            $("#maps_two").append("<OPTION VALUE="+maplist[i].value+">"+maplist[i].text+"</OPTION>");
                        }
                    }
                }
            }

        }
        window.load();

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

                if(postData.surplus){
                    postData.surplus = parseInt(postData.surplus)
                }
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

        // 成功
        , deal:{
            process: function(seed,nut){

                var bargain;
                var then = this;
                /*
                此次修改，由于活动券被发放完，
                此时，无法获取，系统却提示获取成功
                by David.xu at 2014-06-23
                */
                var fetchCouponStatus = true;
                var _memo;
                //用户获取优惠券的成功与否状态，默认为可以获取,by David.xu at 2014-06-23
                var parm;//活动流程设置
                //david.xu parm:01 先注册后游戏(必须关注且注册)（前置）
                //david.xu parm:02 先游戏后注册(必须关注)（后置）
                //david.xu parm:03 先游戏后不提示注册（不要求关注和注册）

                this.step(function(){

                    // 获得砍价信息
                    helper.db.coll("lavico/bargain").findOne({_id : helper.db.id(seed._id)},this.hold(function(err,doc){
                        if(err ){
                            console.log(err)
                        }
                        bargain = doc || {};
                        parm = bargain.parm || '01';
                        return bargain;
                    })) ;
                })



                this.step(function(bargain){

                    // 差价
                    var qty = parseInt(bargain.price) - parseInt(seed.price);
                    var _memo = bargain.activityName || '我要侃价';

                    var _req;
                    if(parm =='02'||parm =='03'){
                        _req = {
                            openid: seed.wxid,
                            otherPromId: seed.promotionsCode,
                            PROMOTION_CODE: seed.promotionsCode,
                            qty: qty,
                            parm: '02',
                            point: 0,
                            memo:_memo};
                    }else{
                        _req = {
                            openid: seed.wxid,
                            otherPromId: seed.promotionsCode,
                            PROMOTION_CODE: seed.promotionsCode,
                            qty: qty,
                            parm: '01',
                            point: 0,
                            memo:_memo};
                    }

                    // 获得券
                    middleware.request("Coupon/FetchCoupon",
                        _req,
                        this.hold(function (err, doc) {
                            var doc = JSON.parse(doc);
                            if(doc&&doc.success&&doc.success==true){
                                fetchCouponStatus =  true;
                            }else{
                                fetchCouponStatus =  false;
                            }

                            if(fetchCouponStatus == true){

                                //当获取优惠券成功的时候再记录

                                // 更新用户表中的记录。用于统计
                                var bargain = {price:parseInt(seed.price),_id:seed.productID,name:seed.name,createDate:new Date().getTime(),stat:true}
                                helper.db.coll("welab/customers").update({wechatid : seed.wxid}, {$addToSet:{bargain:bargain}},{upsert:true},this.hold(function(err,doc){
                                    if(err ){
                                        console.log(err)
                                    }
                                })) ;

                                // 更新用户记录表
                                _log(seed.wxid,seed.memberID,"侃价",{price:parseInt(seed.price),productID:seed.productID,step:4,stat:true})

                                // 更新侃价
                                helper.db.coll("lavico/bargain").update({_id : helper.db.id(seed._id)}, {$inc:{surplus:-1}},this.hold(function(err,doc){
                                    if(err ){
                                        console.log(err)
                                    }
                                })) ;

                                var TagJson = {};
                                TagJson.memberId = seed.memberID;
                                TagJson.tag = "我要侃价"+"-"+seed.name;
                                middleware.request("Tag/Add", TagJson, this.hold(function (err, doc) {
                                    if (err) throw err;
                                    console.log("tag record:" + doc);
                                }))
                                helper.db.coll("welab/customers").update({"wechatid" : seed.wxid}, {$addToSet:{tags:TagJson.tag}},this.hold(function(err,doc){
                                    if(err ){
                                        throw err;
                                    }
                                }));
                                this.req.session._bargain_step = 1;

                            }
                            console.log(doc)
                        }));


                });

                // 减少积分
                this.step(function(){
                    //fetchCouponStatus 获取券的是否成功
                    if(parm == '01' && fetchCouponStatus == true && bargain.deductionIntegral && bargain.deductionIntegral!="" && bargain.deductionIntegral > 0){
                        var qty = "-"+bargain.deductionIntegral;
                        middleware.request("Point/Change",
                            {memberId: seed.memberID, qty:qty, memo:_memo},
                            this.hold(function (err, doc) {
                                if(err){
                                    console.log(err)
                                    console.log(doc)
                                }
                                return bargain
                            }));
                    }
                })



                this.step(function(){
                    nut.disable();
                    if(fetchCouponStatus == true){
                        var data = JSON.stringify({err:0});
                    }else{
                        var data = JSON.stringify({err:1,msg:'coupons_were_over'});
                    }
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })

            }
        }
        , giveup:{
            process: function(seed,nut){

                var bargain = {price:parseInt(seed.price),_id:seed.productID,name:seed.name,createDate:new Date().getTime(),stat:false}
                helper.db.coll("welab/customers").update({wechatid : seed.wxid}, {$addToSet:{bargain:bargain}},{upsert:true},this.hold(function(err,doc){
                    if(err ){
                        throw err;
                    }
                })) ;


                _log(seed.wxid,seed.memberID,"侃价",{price:parseInt(seed.price),productID:seed.productID,step:4,stat:false})
                this.req.session._bargain_step = 1;
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

                if(!seed.wxid||seed.wxid=="{wxid}"){
                    _write({err:1,msg:"没有wxid"})
                    return;
                }


                // step
                if(!this.req.session._bargain_step){
                    this.req.session._bargain_step = 1;
                }

                // repeat
                this.step(function(){

                    helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:seed.memberID,action:"侃价成交"}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                        if(doc.length > 0){
                            _write({err:1,msg:"您已经成交过此商品，不能再出价了。"})
                            this.terminate()
                        }
                        return;
                    }))
                })

                // timeout
                this.step(function(){

                    helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:seed.memberID,action:"侃价","data.step":3}).sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                        if(doc.length > 0){
                            var timeout = 60 * 3 * 1000

                            if( doc[0].createTime + timeout > new Date().getTime()){

                                _write({err:1,msg:"休息休息，3分钟后才能再侃价"})
                                this.terminate()
                            }
                        }
                        return;
                    }))
                })


                // max
                this.step(function(){
                    helper.db.coll("lavico/user/logs").find({"data.productID":seed._id,memberID:seed.memberID,action:"侃价","data.step":4,"data.stat":true}).count(this.hold(function(err,num){

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

                            _log(seed.wxid,seed.memberID,"侃价",{step:parseInt(this.req.session._bargain_step),price:parseInt(seed.price),productID:seed._id,bargain:_bargain(seed.price,doc.minPrice)})

                            if(this.req.session._bargain_step == 1){

                                res = {err:0,step:1,doc:_bargain(seed.price,doc.minPrice)}
                                this.req.session._bargain_step = 2;

                            }else if(this.req.session._bargain_step == 2){

                                res = {err:0,step:2,doc:_bargain(seed.price,doc.minPrice)}
                                this.req.session._bargain_step = 3;
                            }else if(this.req.session._bargain_step == 3){

                                res = {err:0,step:3,doc:_bargain(seed.price,doc.minPrice)}
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


function _log(wxid,memberID,action,data){
    helper.db.coll("lavico/user/logs").insert({createTime:new Date().getTime(),wxid:wxid,memberID:parseInt(memberID),action:action,data:data}, function(err, doc){
        if(err)console.log(err)
    })
}