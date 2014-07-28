module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/bargain/statistics.html"

    , process: function(seed,nut)
    {
        if(seed._id){

            nut.model._id = seed._id
            var then = this
            var docs;


            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){

                docs = _doc
                //参与人数:
                helper.db.coll("lavico/user/logs").aggregate([
                        {$match:{action:"侃价","data.step":4,'data.productID':seed._id}},
                        {$group:{_id:"$wxid"}}
                    ],
                    then.hold(function(err,doc){
                        docs.pv = doc.length || 0
                    })
                )

                //成交人数:
                helper.db.coll("lavico/user/logs").aggregate([
                        {$match:{action:"侃价","data.step":4,"data.stat":true,'data.productID':seed._id}},
                        {$group:{_id:"$wxid"}}
                    ],
                    then.hold(function(err,doc){
                        docs.uv = doc.length || 0
                    })
                )

                //最低成交价
                helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,"data.stat":true,'data.productID':seed._id}).sort({"data.price":1}).limit(1).toArray(then.hold(function(err,doc){
                    docs.min = doc && doc[0] ? doc[0].data.price : 0

                })
                )

                //最高成交价
                helper.db.coll("lavico/user/logs").find({action:"侃价","data.step":4,"data.stat":true,'data.productID':seed._id}).sort({"data.price":-1}).limit(1).toArray(then.hold(function(err,doc){
                    docs.max = doc && doc[0] ? doc[0].data.price : 0
                })
                )
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


            var dTime = new Date()
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)
            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,_id:seed._id,unwind:"bargain"};
        })

        var taglist;
        var tagstr = "";
        this.step(function(){
            helper.db.coll("lavico/tags").find({}).toArray(this.hold(function(err,docs){
                if(err) throw  err;
                if(docs){
                    taglist = docs || {};
                }
            }))
        })

        this.step(function(){
            if(taglist){
                for(var i=0;i<taglist.length;i++){
                    tagstr += taglist[i].title + ",";
                }
            }
            var reg=/,$/gi;
            nut.model.jsonData = tagstr.replace(reg,"");
            console.log("nut.model.jsonData",nut.model.jsonData);
        })
    }
    , children: {

        userList: "lavico/bargain/userList.js"

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

        var tagstr = $("#jsondata").val();
        var taglist = tagstr.split(",");
        var str = []
        for(var i=0;i<taglist.length;i++){
            str.push(taglist[i])
        }

        jQuery("#tags").tagsManager({
            prefilled: str,
            hiddenTagListName: 'tagsVal'
        });

        $("#exportssd").attr("href","/lavico/bargain/userList:exports?_id="+$("#_id").val()+"&unwind=bargain&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%97%B6%E9%97%B4%22%7D")
    }


}







