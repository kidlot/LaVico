/**
 * Created by root on 14-5-5.
 */
module.exports= {
    layout: "lavico/layout",
    view:"lavico/templates/answerQuestion/answer_num1.html",
    process:function(seed,nut){

        nut.model.wechatId=seed.wechatid;
        nut.model._id=seed._id;
        var wxid=seed.wechatid;

        this.step(function(){
            console.log("bbbb");
            helper.db.coll("welab/customers").findOne({"wechatid":wxid},this.hold(function(err,doc){
                if(err) throw err;
                if(doc && doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID && doc.HaiLanMemberInfo.action=='bind'){
                    //console.log("ffff");
                    //return doc.HaiLanMemberInfo.memberID;//获取会员ID
                }else{
                    nut.model.flag="1";
                    //console.log("aa")
                    //nut.disable();//不显示模版

                    //this.res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
                    //window.onload=function(){window.popupStyle2.on('您还不是LaVico的会员，请先注册会员',function(event){location.href='/lavico/member/index?wxid="+wechatid+"'})}
                    //this.res.write("<script>window.onload=function(){window.popupStyle2.on('您还不是LaVico的会员，请先注册会员',function(event){location.href='/lavico/member/index?wxid="+wxid+"'})}");
                    //this.res.end();
                    //this.terminate();
                }
            }))
        })

        this.step(function(){
            //var id = '536879ea38c23a370d000c72';
            helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(seed._id)},this.hold(function(err,doc){
                if(err) throw err
                if(doc)	nut.model.docs=doc;
            }));
        })

    }

}