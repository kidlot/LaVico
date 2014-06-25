
// 清除砍价记录
// db.eval('clearBargain("oTVLcjsqnJ1_z0w2oRbXpMeBW0Hc")');

db.system.js.save({_id:"clearBargain",value:function(wxid){

    db['welab/customers'].update({wechatid:wxid},{$set:{bargain:[]}});
    db['lavico/user/logs'].remove({wxid:wxid,action:"侃价"});

}});

