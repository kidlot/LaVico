/*
 * 应用：活动券-后台应用
 * URL：{host}/lavico/activity
 * */
module.exports={
     layout:"welab/Layout",
     view:"lavico/templates/answerQuestion/RuleDescription.html",
     process:function(seed,nut){
         id=seed._id;
         nut.model._id=seed._id;
         helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},this.hold(function(err,doc){
             if(err) throw err
             nut.model.doc=doc || {};
         }));
     },
     viewIn:function(){
         //活动说明-编辑器
         var explanationEditor = CKEDITOR.replace( 'explanation', {
             toolbar: [
                 [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
             ]
         });
         explanationEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
         explanationEditor.config.enterMode = CKEDITOR.ENTER_BR;
         explanationEditor.config.language = 'zh-cn';
         explanationEditor.config.width = 600;
         explanationEditor.config.height = 400;
         explanationEditor.config.allowedContent = true;//防止过滤标签的css-style属性
         //活动规则-编辑器
         var descriptionEditor = CKEDITOR.replace( 'description', {
             toolbar: [
                 [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
             ]
         });
         descriptionEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
         descriptionEditor.config.enterMode = CKEDITOR.ENTER_BR;
         descriptionEditor.config.language = 'zh-cn';
         descriptionEditor.config.width = 600;
         descriptionEditor.config.height = 400;
         descriptionEditor.config.allowedContent = true;//防止过滤标签的css-style属性

         //免责声明-编辑器
         var reliefEditor = CKEDITOR.replace( 'relief', {
             toolbar: [
                 [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
             ]
         });
         reliefEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
         reliefEditor.config.enterMode = CKEDITOR.ENTER_BR;
         reliefEditor.config.language = 'zh-cn';
         reliefEditor.config.width = 600;
         reliefEditor.config.height = 400;
         reliefEditor.config.allowedContent = true;//防止过滤标签的css-style属性

         //保存功能
         window.save = function(){
             //活动说明
             var explanation = encodeURIComponent(explanationEditor.document.getBody().getHtml());
             //活动规则
             var description = encodeURIComponent(descriptionEditor.document.getBody().getHtml());
             //免责声明
             var relief = encodeURIComponent(reliefEditor.document.getBody().getHtml());

             if(!explanation){
                 $.globalMessenger().post({
                     message: "请填写活动说明",
                     type: 'error',
                     showCloseButton: true});
                 return false;
             }
             if(!description){
                 $.globalMessenger().post({
                     message: "请填写活动规则",
                     type: 'error',
                     showCloseButton: true});
                 return false;
             }
             if(!relief){
                 $.globalMessenger().post({
                     message: "请填写免责声明",
                     type: 'error',
                     showCloseButton: true});
                 return false;
             }
             if(!$('#pic_upload').attr('src')){
                 $.globalMessenger().post({
                     message: "请上传活动大图",
                     type: 'error',
                     showCloseButton: true});
                 return false;
             }
             var aFormInput = {};
             //aFormInput.thumb = $('#thumb_upload').attr('src');
             aFormInput.pic = $('#pic_upload').attr('src');
             aFormInput.description = description;
             aFormInput.relief = relief;
             aFormInput.explanation = explanation;
             var post = {} ;
             post.data = [{name:'postData',value:JSON.stringify(aFormInput)},{name:'_id',value:$("#_id").val()}];
             post.type = "POST";
             post.url = "/lavico/answerQuestion/RuleDescription:save";

             $.request(post,function(err,nut){
                 nut.msgqueue.popup();
                 //$.controller("/lavico/answerQuestion/themeList",null,"lazy");
             }) ;
         }
     },
     actions:{
         save:{
                 process:function(seed,nut){
                         var postData = JSON.parse(seed.postData);
                         var _id = seed._id;
                         seed.description = postData.description;
                         seed.relief = postData.relief;
                         seed.explanation = postData.thumb;
                         seed.thumb = postData.explanation;//小图地址
                         seed.pic = postData.pic;//大图地址
                         console.log(postData);
                         helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(_id)},{$set:postData},
                         this.hold(function(err,doc){
                                 if(err){throw err;}
                                 console.log(doc);
                                 nut.message("保存成功",null,"success");
                         })
                         );
                 }
         }
     }
}
