module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/lookbook/form.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed._id){

            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
            }))
        }

        this.step(function(){
            nut.model._id = seed._id
            nut.model.jsonDoc = JSON.stringify(doc)
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

        //复制功能
        $.getScript('/lavico/public/zclip.js/jquery.zclip.min.js',function(){
            $("#btnCopy").zclip({
                path:'/lavico/public/zclip.js/ZeroClipboard.swf',
                copy:$('#host-url').val()
            });
        });

        //精英搭配类型切换
        $('select[name="type"]').change(function(){
            var _imagTitle = $('.imgTitle');
            if($(this).val()=='整图型'){
                _imagTitle.html('搭配效果图 (134 x 640)');
            }else{
                _imagTitle.html('搭配效果图 (600 x 400)');
            }
        });
        setTimeout(function(){
            if($('select[name="type"]').val()=='整图型'){
                $('.imgTitle').html('搭配效果图 (134 x 640)');
            }else{
                $('.imgTitle').html('搭配效果图 (600 x 400)');
        }},100);


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

                if(seed._id){

                    helper.db.coll("lavico/lookbook").update({_id:helper.db.id(seed._id)},{$set:postData},this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                    }));
                }else{
                    postData.createData = new Date().getTime()
                    helper.db.coll("lavico/lookbook").insert(postData,this.hold(function(err,doc){
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

                    helper.db.coll("lavico/lookbook").remove({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
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

    }
}


function _log(wxid,action,data){
    helper.db.coll("lavico/user/logs").insert({createTime:new Date().getTime(),wxid:wxid,action:action,data:data}, function(err, doc){
        if(err)console.log(err)
    })
}
