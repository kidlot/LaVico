module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/lookbook/statistics.html"

    , process: function(seed,nut)
    {

        if(seed._id){

            nut.model._id = seed._id
            var then = this
            var docs;


            var dTime = new Date()
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)

            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)

            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){

                docs = _doc
                for(var i=0;i<docs.page.length;i++){

                    for(var ii=0;ii<docs.page[i].product.length;ii++){

                        (function(i,ii){

                            helper.db.coll("welab/customers").aggregate(
                                [
                                    { '$unwind': '$lookbook' },
                                    { '$match': {
                                        'lookbook._id': seed._id,
                                        'lookbook.createDate':{$gt:startTimeStamp, $lt:endTimeStamp},
                                        'lookbook.productID':docs.page[i].product[ii]._id
                                    } }
                                ]
                                ,then.hold(function(err,custdoc){
                                    if(err) console.log(err) ;

                                    docs.page[i].product[ii].sumFavorites = custdoc.length

                                })
                            );

                        })(i,ii)
                    }
                }
            }))



            this.step(function(){

                nut.model.doc = docs
            })


        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }

        this.step(function(){

            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,_id:seed._id,unwind:"lookbook"};
        })


    }
    , children: {

        userList: "lavico/lookbook/userList.js"

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

//
//        jQuery("#tags").tagsManager({
//            prefilled: str,
//            hiddenTagListName: 'tagsVal'
//        });

        $("#exportssd").attr("href","/lavico/lookbook/userList:exports?_id="+$("#_id").val()+"&unwind=lookbook&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%94%B6%E8%97%8F%E6%97%B6%E9%97%B4%22%7D")
    }

    , actions: {

        autoupdate:{
            process: function(seed,nut)
            {
                nut.disable();

                // 所有收藏
                helper.db.coll("lavico/favorites").find().toArray(function(err,_doc){

                    var then = this;
                    if(_doc){
                        for(var i=0 ; i<_doc.length ; i++){

                            (function(i){

                                // 是否存于用户表
                                helper.db.coll("welab/customers").findOne({wechatid:_doc[i].wxid,"lookbook.productID":_doc[i].productId},function(err,_docLookBook){

                                    if(err) console.log(err)

                                    if(_docLookBook){

                                        console.log(_doc[i])
                                    }else{



//                                        helper.db.coll("lavico/lookbook").findOne({"page.product._id":_doc[i].lookbookid.toString()},function(err,_lookbook){
//
//
//                                            var name = ""
//                                            for(var i=0 ; i<_lookbook.page.length ; i++){
//                                                for(var ii=0 ; ii<_lookbook.page[i].product.length ; ii++){
//
//                                                    if(doc.page[i].product[ii]._id == _doc[i].productID){
//                                                        name = doc.page[i].product[ii].name
//                                                    }
//                                                }
//                                            }
//
//
//                                            var lookbook = {
//                                                "_id": _doc[i].lookbookid.toString(),
//                                                "pageId": _doc[i].pageid,
//                                                "productID": _doc[i].productID,
//                                                "createDate": _doc[i].createDate,
//                                                "name": name
//                                            }
//
//                                            helper.db.coll("welab/customers").update({wechatid : _doc[i].wxid}, {$addToSet:{lookbook:lookbook}},then.hold(function(err,doc){
//                                                if(err ){
//                                                    throw err;
//                                                }
//                                            })) ;
//
//                                        })

                                    }

                                })
                            })(i)
                        }
                    }
                })


            }
        }
    }

}







