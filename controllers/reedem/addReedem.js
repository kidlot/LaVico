/*
  author:json
  description:add reedem(添加积分兑换)
 */
var middleware = require('../../lib/middleware.js');
module.exports={
    layout: "welab/Layout",
    view:"lavico/templates/reedem/addReedem.html",
    process:function(seed,nut){
        var then = this;
        var list;
        //Coupon/Promotions:券表
        this.step(function(doc){
            //从接口读取所有活动券和面值
            var perPage = 1000;
            var pageNum = seed.page ? seed.page : 1;
            var jsonData={};
            jsonData.perPage=10000;
            jsonData.pageNum=seed.page ? seed.page : 1;
            middleware.request('Coupon/Promotions',jsonData,
                this.hold(function(err,doc){
                    doc = doc.replace(/[\n\r\t]/,'');
                    var doc_json = eval('(' + doc + ')');
                    var page = {};
                    page.lastPage = Math.ceil(doc_json.total/perPage);
                    page.currentPage = pageNum;
                    page.totalcount = doc_json.total;
                    nut.model.page = page;

                    if(doc_json && doc_json.list){
                        return doc_json.list;
                    }else{
                        return {};
                    }
                })
            )
        });

        var activitypic = []
        this.step(function(doc){
            //查找活动表对应的券图和描述
            var count = 0;
            for(var i=0;i<doc.length;i++){
                (function(i){
                    helper.db.coll("lavico/activity").findOne({aid:doc[i].PROMOTION_CODE},then.hold(function(err,detail){
                        count ++ ;
                        if(detail){
                            doc[i].pic = detail.pic;
                            doc[i].thumb = detail.thumb;
                            doc[i].introduction=decodeURIComponent(detail.introduction);
                        }
                        console.log(detail);
                        if(count == doc.length){
                            list = doc;
                            return doc;
                            then.terminate();
                        }
                    }));
                })(i);
            }
        });

        this.step(function(list){
            nut.model.list = list;
            console.log("list",list)

        });
    },
    actions:{
        //保存公告
        save:{
            layout: "welab/Layout",
            view:"lavico/templates/reedem/updateReedem.html",
            process:function(seed,nut){
                helper.db.coll("lavico/reddem").update({_id:helper.db.id(seed._id)},postData,{multi:false,upsert:true},this.hold(function(err,doc){
                    if(err) throw err;
                    if(doc) nut.message("保存成功",null,'success') ;
                }));
            }
        },

        modify_html:{
            layout: "welab/Layout",
            view:"lavico/templates/reedem/updateReedem.html",
            process:function(seed,nut){
                var perPage = 1000;
                var pageNum = seed.page ? seed.page : 1;
                var then = this;
                //Coupon/Promotions:券表
                this.step(function(doc){
                    middleware.request('Coupon/Promotions',{
                        perPage:perPage,
                        pageNum:pageNum
                    },this.hold(function(err,doc){
                        doc = doc.replace(/[\n\r\t]/,'');
                        var doc_json = eval('(' + doc + ')');
                        var page = {};
                        page.lastPage = Math.ceil(doc_json.total/perPage);
                        page.currentPage = pageNum;
                        page.totalcount = doc_json.total;
                        nut.model.page = page;

                        if(doc_json && doc_json.list){
                            return doc_json.list;
                        }else{
                            return {};
                        }
                    }))
                });
                //lavico/activity:接口：活动表
                var list;
                this.step(function(doc){
                    var count = 0;
                    for(var i=0;i<doc.length;i++){
                        (function(i){
                            helper.db.coll("lavico/activity").findOne({aid:doc[i].PROMOTION_CODE},then.hold(function(err,detail){
                                count ++ ;
                                if(detail){
                                    doc[i].pic = detail.pic;
                                    doc[i].thumb = detail.thumb;
                                    doc[i].introduction=decodeURIComponent(detail.introduction);
                                }
                                if(count == doc.length){
                                    list = doc
                                    return doc;
                                    then.terminate();
                                }
                            }));
                        })(i);
                    }
                });
                var redem
                this.step(function(){
                    if(seed._id){
                        helper.db.coll("lavico/reddem").findOne({_id:helper.db.id(seed._id)},then.hold(function(err,reedem){
                            if(reedem){
                                redem = reedem;
                            }
                        }));
                    }
                })

                this.step(function(){
                    nut.model.list = list;//全部券名
                    console.log("list")
                    console.log(list)
                    nut.model.reedem = redem;
                });
            },
            viewIn:function(){
                //日历控件
                $('#startDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })
                $('#endDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })

                var aid;
                if($("#aid").val()){
                    aid = $("#aid").val();
                    $("#activity_select option").each(function(){ if($(this).val() == aid){ $(this).attr("selected","true");
                    } $(".promotion_detail").css('display','none');
                        $("#"+aid).css('display','block');
                        $("#"+aid+" .needScore").val($('#needScore').val());
                    });
                }
                var lottery_input = $("#lottery_input").val();
                if(lottery_input){ $("#lottery_cycle option").each(function(){
                    if($(this).val() == lottery_input){
                        $(this).attr("selected","true");
                } }); }
                $('#activity_select').change(function(){ aid = $(this).val();
                    $(".promotion_detail").css('display','none');
                    $("#"+$(this).val()).css('display','block');
                });

                //编辑器-礼品描述
                var desEditor = CKEDITOR.replace( 'des', {
                    toolbar: [
                        [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
                    ]
                });
                desEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
                desEditor.config.enterMode = CKEDITOR.ENTER_BR;
                desEditor.config.language = 'zh-cn';
                desEditor.config.width = 600;
                desEditor.config.height = 400;
                //保存功能
                window.save = function (){

                    var aFormInput = {}
                    var _inputCheck = true;
                    var smallPic = $("#"+aid).first().find("#smallPic").val();
                    var bigPic = $("#"+aid).first().find("#bigPic").val();
                    var qty = $("#"+aid).first().find("#QTY").val();

                    if(!$("#startDate").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择开始时间！",
                            type: 'error',
                            showCloseButton: true})

                    }
                    if(!$("#endDate").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择结束时间！",
                            type: 'error',
                            showCloseButton: true})

                    }
                    if($("#activity_select").val()=="0"){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择优惠劵！",
                            type: 'error',
                            showCloseButton: true})
                    }
                    if(!qty){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请填写所需积分！",
                            type: 'error',
                            showCloseButton: true})
                    }
                    if(!smallPic){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请上传小图！",
                            type: 'error',
                            showCloseButton: true})
                    }
                    if(!bigPic){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请上传大图！",
                            type: 'error',
                            showCloseButton: true})
                    }
                    if(!_inputCheck){
                        return false;
                    }

                    aFormInput['startDate'] = new Date($("#startDate").val()).getTime();//开始时间
                    aFormInput['endDate'] = new Date($("#endDate").val()).getTime();//结束时间
                    aFormInput['aid'] = aid;//券号
                    aFormInput['name'] = $("#name").val();//名称
                    aFormInput['des'] = encodeURIComponent(desEditor.document.getBody().getHtml());
                    aFormInput['introduction'] = $("#introduction").val();//描述
                    aFormInput['switcher'] = 'on';//
                    aFormInput['createTime'] = new Date().getTime();//创建时间
                    aFormInput['QTY']=$("#"+aid).first().find("#QTY").val();//面值
                    aFormInput['needScore']=$("#"+aid).first().find("#needScore").val();//所需积分
                    aFormInput['smallPic']=smallPic || null;//小图片
                    aFormInput['bigPic']=bigPic || null;//大图片


                    if(_inputCheck){
                        var oLinkOptions = {} ;
                        oLinkOptions.data = [{name:'postData',value:JSON.stringify(aFormInput)},{name:'_id',value:$("#_id").val()}];
                        oLinkOptions.type = "POST";
                        oLinkOptions.url = "/lavico/reedem/addReedem:update";

                        $.request(oLinkOptions,function(err,nut){
                            if(err) throw err ;
                            console.log(err);
                            nut.msgqueue.popup() ;
                            $.controller("/lavico/reedem/reedem_list",null,"lazy");
                        });

                    }
                }
            }
        },
        update:{
            process:function(seed,nut){
                nut.view.disable();
                var postData = JSON.parse(seed.postData);

                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }

                helper.db.coll("lavico/reddem").update({_id:helper.db.id(seed._id)},postData,{multi:false,upsert:true},this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                        nut.message("保存成功",null,'success') ;
                    }
                }));
            }
        },

        insert:{

            process:function(seed,nut){
                nut.view.disable();
                var postData = JSON.parse(seed.postData);

                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }

                helper.db.coll("lavico/reddem").insert(postData,this.hold(function(err,doc){
                    if(err){
                        throw err;
                    }else{
                        nut.message("保存成功",null,'success') ;
                    }
                }))

            }
        }
    },
    viewIn:function(){

        var aid;
        //日历控件
        $('#startDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        })

        $('#endDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        })

        //编辑器-礼品描述
        var desEditor = CKEDITOR.replace( 'des', {
            toolbar: [
                [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
            ]
        });
        desEditor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
        desEditor.config.enterMode = CKEDITOR.ENTER_BR;
        desEditor.config.language = 'zh-cn';
        desEditor.config.width = 600;
        desEditor.config.height = 400;

        //券选择
        $('#activity_select').change(function(){
            aid = $(this).val();
            $(".promotion_detail").css('display','none');
            $("#"+aid).css('display','block');
        });

        //保存功能
        window.save = function (){
            var aFormInput = {}
            var _inputCheck = true;
            var des = encodeURIComponent(desEditor.document.getBody().getHtml());//礼品描述
            var name = $("#name").val();


            if(!name){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请填写礼品名称！",
                    type: 'error',
                    showCloseButton: true})

            }
            if(!$("#startDate").val()){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请选择开始时间！",
                    type: 'error',
                    showCloseButton: true})

            }
            if(!$("#endDate").val()){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请选择结束时间！",
                    type: 'error',
                    showCloseButton: true})

            }
            if(!des){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请填写礼品描述！",
                    type: 'error',
                    showCloseButton: true});
                return false;

            }
            if($("#activity_select").val()=="0"){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请选择优惠劵！",
                    type: 'error',
                    showCloseButton: true})
                return false;
            }

            var smallPic = $("#"+aid).first().find("#smallPic").val();
            var bigPic = $("#"+aid).first().find("#bigPic").val();
            var needScore = $("#"+aid).first().find("#needScore").val();
            if(!needScore){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请填写所需积分！",
                    type: 'error',
                    showCloseButton: true})
            }
            if(!smallPic){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请上传小图！",
                    type: 'error',
                    showCloseButton: true})
            }
            if(!bigPic){
                _inputCheck = false;
                $.globalMessenger().post({
                    message: "请上传大图！",
                    type: 'error',
                    showCloseButton: true})
            }

            if(!_inputCheck){
                return false;
            }

            aFormInput['startDate'] = new Date($("#startDate").val()).getTime();//开始时间
            aFormInput['endDate'] = new Date($("#endDate").val()).getTime();//结束时间
            aFormInput['aid'] = aid;//券号
            aFormInput['name'] = name;//名称
            aFormInput['des'] = des;
            aFormInput['introduction'] = $("#introduction").val();//描述
            aFormInput['switcher'] = 'on';//
            aFormInput['createTime'] = new Date().getTime();//创建时间
            aFormInput['QTY']=$("#"+aid).first().find("#QTY").val()||null;//面值
            aFormInput['needScore']=needScore;//所需积分
            aFormInput['smallPic']=smallPic;//小图片
            aFormInput['bigPic']=bigPic;//大图片


            if(_inputCheck){
                var oLinkOptions = {} ;
                oLinkOptions.data = [{name:'postData',value:JSON.stringify(aFormInput)},{name:'_id',value:$("#_id").val()}];
                oLinkOptions.type = "POST";
                oLinkOptions.url = "/lavico/reedem/addReedem:insert";

                $.request(oLinkOptions,function(err,nut){
                    if(err) throw err ;
                    nut.msgqueue.popup() ;
                    $.controller("/lavico/reedem/reedem_list",null,"lazy");
                });

            }
        }

    }

}