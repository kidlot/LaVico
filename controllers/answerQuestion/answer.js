module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/answer.html",
    process:function(seed,nut){
        var beginTime="",endTime="",isOpen="";
        var _id=seed._id;//获取题目ID
        var optionId=seed.optionId;//获取题号
        var wechatid=seed.wechatid;//获取微信ID
        if(optionId==1)this.req.session.scoreAll=0;//初始化session

        this.step(function(){
            //查找此会员是否存在
            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,result){
                if(err) throw err;
                if(result){
                    if(result.HaiLanMemberInfo&&result.HaiLanMemberInfo.memberID&&result.HaiLanMemberInfo.action=='bind'){
                        //return result.HaiLanMemberInfo.memberID;//获取会员ID
                    }else
                    {
                        this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wechatid});
                        this.res.end();
                    }
                    //return 9123084;
                }else{
                    nut.disable();
                    write_info(then,"您的访问不对请和核查访问方式![缺少微信ID]");
                }
            }))
        });


//        this.step(function(){
//            helper.db.coll("lavico/custReceive").count({"wechatid":wechatid,"themeId":helper.db.id(_id)},this.hold(function(err,doc){
//                if(err) throw err;
//                if(doc>0){
//                    this.res.writeHead(302, {'Location': "/lavico/member/index?wxid="+wechatid});
//                    this.res.end();
//                }
//            }))
//        })




        this.step(function(){
            //判断活动是否开启或到期1-1
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err)throw err;
                beginTime=doc.beginTime;
                endTime=doc.endTime;
                isOpen=doc.isOpen;
            }));
        });
        this.step(function(){
            //判断活动是否开启或到期1-2
            if(new Date(beginTime).getTime()<new Date(createTime()).getTime() && new Date(endTime).getTime()>new Date(createTime()).getTime()){
                if(isOpen==0){
                    nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
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
                                //console.log(wechatid)
                                nut.model.wechatid=wechatid;
                            }
                        }
                        if(optionId>cursor.options.length){
                            //异常情况：当optionId大于题数时
                            nut.write("<script>alert('无此题，联系管理员');history.back();</script>");
                            nut.view.disable();
                        }
                    }));
                }
            }else{
                nut.view.disable();
                nut.write("<script>alert('很抱歉，活动已经停止');history.back();</script>");
            }
        });

        //nut.model.wechatid=wechatid;
    }
}
function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}