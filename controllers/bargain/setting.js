var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

	layout: "welab/Layout"
	, view: "lavico/templates/bargain/setting.html"

    , process: function(seed,nut)
    {
        helper.db.coll("lavico/bargain/kv").findOne({},this.hold(function(err,_doc){
            if(err) throw err;
            nut.model.doc = _doc||{}
            if(nut.model.doc.description)
                nut.model.doc.description = decodeURIComponent(nut.model.doc.description);
        }))
    }

    , viewIn : function(){


        //活动规则-编辑器
        var descriptionEditor = CKEDITOR.replace( 'description', {
            toolbar: [
                [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
            ]
        });
        descriptionEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
        descriptionEditor.config.enterMode = CKEDITOR.ENTER_BR;
        descriptionEditor.config.language = 'zh-cn';
        descriptionEditor.config.allowedContent = true;//防止过滤标签的css-style属性
        descriptionEditor.config.width = 420;
        descriptionEditor.config.height = 400;

        //保存
        window.save = function(){

            //活动规则
            var description = encodeURIComponent(descriptionEditor.document.getBody().getHtml());


            if(!description){
                $.globalMessenger().post({
                    message: "请填写详细说明",
                    type: 'error',
                    showCloseButton: true});
                return false;
            }

            if(!$('#pic_upload').attr('src')){
                $.globalMessenger().post({
                    message: "请上传活动图",
                    type: 'error',
                    showCloseButton: true});
                return false;
            }

            var aFormInput = {}
            var _inputCheck = true;

            aFormInput['pic_kv'] = $("#pic_upload").attr("src")
            aFormInput['description'] = description;


            if(_inputCheck){
                var oLinkOptions = {} ;
                oLinkOptions.data = [{name:'postData',value:JSON.stringify(aFormInput)}];
                oLinkOptions.type = "POST";
                oLinkOptions.url = "/lavico/bargain/setting:save";
                $.request(oLinkOptions,function(err,nut){
                    //if(err) throw err ;
                    nut.msgqueue.popup() ;
                    //$.controller("/lavico/bargain/setting",null,"lazy");
                }) ;
            }
        }


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

                helper.db.coll("lavico/bargain/kv").update({type:"kv"},{$set:postData},{multi:true,upsert:true},this.hold(function(err,doc){
                    if(err){
                        console.log(err)
                        throw err;
                    }
                }));

                nut.message("保存成功",null,'success') ;
            }
        }


    }
}
