module.exports={
    layout:"lavico/layout",
    view:"lavico/templates/answerQuestion/answer.html",
    process:function(seed,nut){
        var beginTime="",endTime="",isOpen="";
        var _id=seed._id;//获取题目ID
        var optionId=seed.optionId;//获取题号
        var wechatid=seed.wechatid;//获取微信ID

        if(optionId==1)
            this.req.session.scoreAll=0;//初始化session

        var member_id;
        nut.model.wxid = wechatid;
        nut.model.optionId = optionId;
        var memberId = seed.memberid || "undefined";
        var parm;

        nut.model.isok = "0";
        nut.model.conent = "undefined"

        var status = seed.status ? seed.status : "false";

        this.step(function(){
            //查找此会员是否存在
            helper.db.coll("welab/customers").findOne({"wechatid":wechatid},this.hold(function(err,result){
                if(err) throw err;
                console.log("wechatid",wechatid)
                if(result){
                    if(result.HaiLanMemberInfo&&result.HaiLanMemberInfo.memberID&&result.HaiLanMemberInfo.action=='bind'){
                        member_id = result.HaiLanMemberInfo.memberID;
                    }else{
                        //member_id ="undefined";
                    }
                }else{
                    //member_id ="undefined";
                    nut.model.isok = "1";
                    nut.model.conent = "您还不是LaVico的会员，请先注册会员!"
                }
//                if(member_id=="undefined"){
//                    nut.model.isok = "1";
//                    nut.model.conent = "您还不是LaVico的会员，请先注册会员!"
//                }
                //memberId = member_id;
                nut.model.member_id =memberId;
            }))
        });

        this.step(function(){
            if(status=="true"){
                helper.db.coll("lavico/custReceive").remove({"wechatid":wechatid,"themeId":helper.db.id(_id),"memberId":""+memberId},this.hold(function(err,doc){
                    if(err)
                        throw err;
                }))

            }
        })

        this.step(function(){
            //判断活动是否开启或到期1-1
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,doc){
                if(err)throw err;
                beginTime=doc.beginTime;
                endTime=doc.endTime;
                isOpen=doc.isOpen;
                parm = doc.pram;
                nut.model.pram = doc.pram;
                nut.model.themeType = doc.themeType;
                nut.model.themequestion = JSON.stringify(doc.options);
            }));
        })

        this.step(function(){
            console.log("memberid",member_id)
            if(member_id=="undefined"){
                console.log("action","1")
                console.log("memberId",member_id)
                console.log("memberId",typeof member_id)
                console.log("wechatid",wechatid)
                console.log("wechatid",typeof wechatid)
                console.log("ut.model.themeType",nut.model.themeType)
                console.log("ut.model.themeType",typeof nut.model.themeType)
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"wechatid":wechatid,
                    "themetype":""+nut.model.themeType,"isFinish":true}).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        console.log("result_1",result)
                        if(result.length>0){
                            nut.model.isRecord = "1";
                        }else{
                            nut.model.isRecord = "0";
                        }
                    }))
            }else if(member_id!="undefined"){
                console.log("action","2")
                console.log("memberId",member_id)
                console.log("memberId",typeof member_id)
                console.log("wechatid",wechatid)
                console.log("wechatid",typeof wechatid)
                console.log("ut.model.themeType",nut.model.themeType)
                console.log("ut.model.themeType",typeof nut.model.themeType)
                helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(_id),"memberId":""+memberId,"wechatid":wechatid,
                    "themetype":""+nut.model.themeType,"isFinish":true}).toArray(this.hold(function(err,result){
                        if(err) throw err;
                        if(result.length>0){
                            console.log("result_2",result)
                            nut.model.isRecord = "1";
                        }else{
                            nut.model.isRecord = "0";
                        }
                    }))
            }else{
                nut.model.isRecord = "0";
            }
        })

        this.step(function(){
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(_id)},this.hold(function(err,cursor){
                if(err) throw err;
                if(optionId>cursor.options.length){
                    nut.model.isok = "2";
                    nut.model.conent = "无此题，联系管理员";
                    nut.write("<script>window.onload=function(){window.popupStyle2.on('无此题，联系管理员',function(event){history.back()})}</script>");
                    nut.view.disable();
                }
            }));
        })

        this.step(function(){

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
            }));
        });

        this.step(function(){
            helper.db.coll("lavico/custReceive").find({"wechatid":wechatid,"themeId":helper.db.id(_id),"memberId":""+memberId}).toArray(this.hold(function(err,doc){
                if(err) throw err;
                nut.model.custReceive = JSON.stringify(doc);
            }));
        })
    },
    viewIn:function(){
        $('#loading').hide();//隐藏加载框
    },
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}
