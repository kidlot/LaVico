module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/answer.html",
    process:function(seed,nut){
        var beginTime="",endTime="",isOpen="";
        var _id=seed._id;//获取题目ID
        var optionId=seed.optionId;//获取题号
        var wechatid=seed.wechatid;//获取微信ID
        if(optionId==1)this.req.session.scoreAll=0;//初始化session
        var member_id;
        nut.model.wxid = wechatid;
        nut.model.optionId = optionId;
        var memberId;

        this.step(function(){
            //查找此会员是否存在
            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,result){
                if(err) throw err;
                if(result){
                    if(result.HaiLanMemberInfo&&result.HaiLanMemberInfo.memberID&&result.HaiLanMemberInfo.action=='bind'){
                        member_id = result.HaiLanMemberInfo.memberID;
                    }else{
                        member_id ="undefined";
                    }
                }else{
                    nut.disable();
                    write_info(then,"您的访问不对请和核查访问方式![缺少微信ID]");
                }
                if(member_id=="undefined"){
                    nut.view.disable();
                    nut.write("<script>window.onload=function(){window.popupStyle2.on('您还不是LaVico的会员，请先注册会员',function(event){location.href='/lavico/member/index?wxid="+wechatid+"'})}</script>");

                }
                memberId = member_id;
                nut.model.member_id =member_id;

            }))
        });

        this.step(function(){
            //判断活动是否开启或到期1-1
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err)throw err;
                beginTime=doc.beginTime;
                endTime=doc.endTime;
                isOpen=doc.isOpen;
                nut.model.themeType = doc.themeType;
                nut.model.themequestion = JSON.stringify(doc.options);
            }));
        });
        this.step(function(){
            //判断活动是否开启或到期1-2
            if(new Date(beginTime).getTime()<new Date(createTime()).getTime() && new Date(endTime).getTime()>new Date(createTime()).getTime()){
                if(isOpen==0){
                    nut.view.disable();
                    //nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
                    nut.write("<script>window.onload=function(){window.popupStyle2.on('很抱歉，活动已经停止',function(event){history.back()})}</script>");
                }else{
                    //显示题目
                    helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,cursor){
                        if(err) throw err;
                        for(var i=0;i<cursor.options.length;i++){
                            //循环题数
                            if(optionId==cursor.options[i].optionId){
                                //传入题号和当前题号相同,记录题目
                                nut.model.option=JSON.stringify(cursor.options[i]);//以json字符串格式记录,当前此题
                                nut.model.optionId=i+1;
                                nut.model._id=_id;
                                nut.model.optionCount=cursor.options.length;//此题目总共有题数
                                nut.model.wechatid=wechatid;
                                nut.model.themeType =cursor.themeType;
                            }

                        }
                        if(optionId>cursor.options.length){
                            //异常情况：当optionId大于题数时
                            //nut.write("<script>alert('无此题，联系管理员');history.back();</script>");
                            nut.write("<script>window.onload=function(){window.popupStyle2.on('无此题，联系管理员',function(event){history.back()})}</script>");
                            nut.view.disable();
                        }
                    }));
                }
            }else{
                nut.view.disable();
                nut.write("<script>window.onload=function(){window.popupStyle2.on('很抱歉，活动已经停止',function(event){history.back()})}</script>");
               // nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
            }
        });

        this.step(function(){
            helper.db.coll("lavico/custReceive").find({"wechatid":wechatid,"themeId":helper.db.id(_id),"memberId":""+memberId}).toArray(this.hold(function(err,doc){
                if(err) throw err;
                nut.model.custReceive = JSON.stringify(doc);
            }));
        })

        //nut.model.wechatid=wechatid;
    },
    viewIn:function(){
        $('#loading').hide();//隐藏加载框
//        $.ajax({
//            type: "GET",
//            url: "/lavico/answerQuestion/answer:detail",
//            data: {"id":_id},
//            dataType: "json",
//            success: function(data){
//                if(data.error == "false"){
//                    var dates = data.dates;
//
//                }else{
//                    $('#count').html('');
//                }
//            }
//        });
    },
//    actions:{
//        detail:{
//            layout:null,
//            view:null,
//            process:function(seed,nut){
//                var id = seed._id;
//                this.step(function(){
//                    //判断活动是否开启或到期1-1
//                    helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},this.hold(function(err,doc){
//                        if(err)throw err;
//                        nut.disable();//不显示模版
//                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
//                        this.res.write('{"error":"false","dates":"'+JSON.stringify(doc.options)+'"}');
//                        this.res.end();
//                        //nut.model.themequestion = JSON.stringify(doc.options);
//                    }));
//                });
//            }
//        }
//    }
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}

