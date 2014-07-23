module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/reedem/statistics.html",
    process: function(seed,nut)
    {
        //积分兑换编号
        var reedem_id=seed._id;
        var tongJ={};

        this.step(function(){
            //根据编号，查找一条可兑换商品
            helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(reedem_id)},this.hold(function(err,doc){
                if(err) throw err;
                if(doc){
                    tongJ.name=doc.name;
                    tongJ.needScore=doc.needScore;
                    return doc.aid
                }
            }))
        })

        this.step(function(aid){
            //查找商品积分兑换记录条数
            helper.db.coll("lavico/exchangeRecord").count({reddem_id:reedem_id},this.hold(function(err,result){
                if(err) throw err;
                if(result){
                    tongJ.count=result;
                }else{
                    tongJ.count=0;
                }
            }))
        });

        this.step(function(){
            tongJ._id=reedem_id;
            nut.model._id=reedem_id;
            nut.model.tongJ=tongJ;
        });

        this.step(function(){
            //调用商品搜索插件
            var dTime = new Date();
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1);
            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)

            //传参数到children
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,unwind:"reedem",_id:nut.model._id};
        })
    },
    children:{
        userList: "lavico/reedem/userList.js"
    },

    viewIn:function(){
        $.searchInitConditions([
            {field:'realname',title:'姓名',type:'text'}
            , {field:'gender',title:'性别',type:'gender'}
            , {field:'birthday',title:'年龄',type:'birthday'}
            , {field:'email',title:'电子邮件',type:'text'}
            , {field:'mobile',title:'移动电话',type:'text'}
            , {field:'registerTime',title:'注册时间',type:'date'}
            , {field:'followTime',title:'关注时间',type:'date'}
            , {field:'tags',title:'标签',type:'text'}
        ]) ;

        $('#startDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        })
        jQuery("#tags").tagsManager({
            prefilled: [],
            hiddenTagListName: 'tagsVal'
        });

        $('#stopDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        }),
            $("#exportssd").attr("href","/lavico/reedem/userList:exports?_id="+$("#_id").val()+"&unwind=reedem&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%97%B6%E9%97%B4%22%7D")
            //$("#exportssd").attr("href","/lavico/reedem/userList:exports?&unwind=reedem&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%94%B6%E8%97%8F%E6%97%B6%E9%97%B4%22%7D")
    }



}