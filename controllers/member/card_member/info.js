var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null,

    view:'lavico/templates/member/card_member/info.html',

    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        this.step(function(){
            if(wxid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });
        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }
            }));
        });
        this.step(function(){
            nut.model.wxid = wxid;
        });
        this.step(function(){
          helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
            if(doc && doc.mobile && doc.realname && doc.birthday && doc.gender){
              nut.model.mobile = doc.mobile;
              nut.model.realname = doc.realname;
              var date =   new Date(parseInt(doc.birthday));
              nut.model.birthday_year = date.getFullYear() + '年';
              nut.model.birthday_month = date.getMonth() + '月';
              nut.model.birthday_date = date.getDate() +'日';
              nut.model.gender = (doc.gender && doc.gender == 'male') ? '男' : ((doc.gender && doc.gender == 'female') ? '女' : '' );
              nut.model.is_send = 1;            
            }else{
              nut.model.mobile = '';
              nut.model.realname = '';
              nut.model.birthday_year = '';
              nut.model.birthday_month = '';
              nut.model.birthday_date = '';
              nut.model.gender = '';
              nut.model.is_send = 0;             
            }
            /*其他个人信息，也就是需要审核的信息*/
            /*
            * 电子邮件：email
            * 行业：profession
            * 所属省份：province
            * 所属城市：city
            * 具体地址：address
            * 喜好款式：favoriteStyle
            * 喜好颜色：favoriteColor
            * */
            if(doc.hasOwnProperty('email')){
                //电子邮件
                nut.model.email = doc.email;
            }else{
                nut.model.email = '';
            }

            if(doc.hasOwnProperty('profession')){
                //行业
                nut.model.profession = doc.profession;
            }else{
                nut.model.profession = '';
            }

            if(doc.hasOwnProperty('province')){
                //所属省份
                nut.model.province = doc.province;
            }else{
                nut.model.province = '';
            }

            if(doc.hasOwnProperty('city')){
                //所属城市
                nut.model.city = doc.city;
            }else{
                nut.model.city = '';
            }

            if(doc.hasOwnProperty('address')){
                //具体地址
                nut.model.address = doc.address;
            }else{
                nut.model.address = '';
            }

            if(doc.hasOwnProperty('favoriteStyle')){
                //喜好款式
                nut.model.favoriteStyle = doc.favoriteStyle;
            }else{
                nut.model.favoriteStyle = '';
            }

            if(doc.hasOwnProperty('favoriteColor')){
                //喜好颜色
                nut.model.favoriteColor = doc.favoriteColor;
            }else{
                nut.model.favoriteColor = '';
            }

          }));
        });

    },

    viewIn:function(){

        $('#submit').click(function(){
            if(!$("#wxid").val()){
              alert('请先绑定会员');
              return false;
            }        
            if(!$("#is_send").val()){
              alert('请先绑定会员');
              return false;
            }
            var email = $('#email').val();
            var profession = $('#profession').val();
            var province = $('#province').val();
            var city = $('#city').val();
            var address = $('#address').val();
            var favoriteStyle = $('#favoriteStyle').val();
            var favoriteColor = $('#favoriteColor').val();
            if(!email || !/^.+@.+\..+$/.test(email)){
              alert('邮箱格式错误');
              return false;
            }
            if(!profession){
              alert('请输入行业');
              return false;
            } 
            if(!province){
              alert('请输入省份');
              return false;
            } 
            if(!city){
              alert('请输入城市');
              return false;
            } 
            if(!address){
              alert('请输入地址');
              return false;
            } 
            if(!favoriteStyle){
              alert('请输入喜好款式');
              return false;
            } 
            if(!favoriteColor){
              alert('请输入喜欢颜色');
              return false;
            }     
            $.get('/lavico/member/card_member/info:Modified',
              {
                'wxid':$('#wxid').val(),
                'email':email,
                'profession':profession,
                'province':province,
                'city':city,
                'address':address,
                'favoriteStyle':favoriteStyle,
                'favoriteColor':favoriteColor,              
              },
              function(data){
                if(data.result == 'ok'){
                  alert('提交成功');
                }else if(data.result == 'fail'){
                  alert('提交失败');
                }else{
                  alert('提交失败');
                }                
            });
        });
    },

    actions:{
        updateUserInfo:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disable();//不显示模版
                var lastid = 0;//保存先前的lastid
                var nowLastid = 0;//保存当前的lastid
                var dataJson; //远端返回数据，也就是需要更新的的数据列表
                var memberIDArr = [];//本地需要更新的用户memberID
                var _list;//dataJson.list,type:array,远端返回数据，也就是需要更新的的数据列表
                var list;//过滤不需要的数据，处理之后的数据
                this.step(function(){
                    //console.log(helper.db.coll('lavico/user/lastId'));

                });
                this.step(function(){
                    var data_request = {};

                    helper.db.coll('lavico/user/lastId').findOne({},this.hold(function(err, doc){
                        if(!doc){

                            helper.db.coll("lavico/user/lastId").insert(
                                {
                                    'lastid': 0
                                    , 'lastModified': new Date().getTime()

                                }
                                , {$safe:true}
                                , function(err){ err&&console.log(err) }
                            ) ;
                        }
                    }));
                });

                this.step(function(){
                    helper.db.coll('lavico/user/lastId').find({}).sort({lastModified:-1}).limit(1).toArray(this.hold(function(err, doc){
                        //console.log(doc);
                        lastid = doc[0].lastid;
                        //console.log(lastid);

                    }));
                });
                //搜索需要的更新的memberID
                this.step(function(){
                    helper.db.coll('welab/customers').find(
                        {
                            $and:
                                [
                                    {"HaiLanMemberInfo":{$exists:true}},
                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                ]
                        }
                    ).toArray(this.hold(
                        function(err,doc){
                            //console.log(doc);
                            for(var _i=0; _i<doc.length;_i++){
                                memberIDArr.push(doc[_i].HaiLanMemberInfo.memberID);
                            }
                            //console.log(memberIDArr);
                        }
                    ));
                });
                this.step(function(){

                    if(lastid == 0){
                        //初始化数据
                        var data_request = {};
                        middleware.request("System/FieldChange",
                            data_request,
                            this.hold(function(err,doc){
                                dataJson = JSON.parse(doc);
                                //console.log(dataJson);
                                //插入数据库
                                helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                    $set:{
                                        'data':dataJson,
                                        'lastModified':new Date().getTime()
                                    }
                                },this.hold(function(err, doc) {
                                    err&&console.log(err);
                                }));
                                //插入数据库
                                _list = dataJson.list;//临时数组
                                list = [];
                                for(var _i=0 ; _i<_list.length; _i++){
                                    if(_list[_i].TABLE_NAME == 'PUB_MEMBER_PSN'){
                                        list.push(_list[_i]);
                                    }
                                }
                                //console.log(list);
                                //console.log(_list.length);
                                //console.log(list.length);
                                //实际更新的数据
                                helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                    $set:{
                                        'updateData':list,
                                        'lastModified':new Date().getTime()
                                    }
                                },this.hold(function(err, doc) {
                                    err&&console.log(err);
                                }));
                                //实际更新的数据
                            }));

                    }else{
                        //数据

                        var data_request = {
                            "lastid":lastid
                        };
                        middleware.request("System/FieldChange"
                            ,data_request
                            ,this.hold(
                                function(err,doc){

                                    dataJson = JSON.parse(doc);
                                    //console.log(dataJson);
                                    //插入数据库
                                    if(dataJson.list.length == 0){
                                        //如果返回的是空，也就是{"list":[]}
                                        nut.disable();//不显示模版
                                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                        this.res.write('{"success":true,"info":"lastid_is_'+lastid+'","end":true}');
                                        this.res.end();
                                        this.terminate();
                                    }else{


                                        helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                            $set:{
                                                'data':dataJson,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                            err&&console.log(err);
                                        }));
                                        //插入数据库
                                        _list = dataJson.list;//临时数组
                                        list = [];
                                        for(var _i=0 ; _i<_list.length; _i++){
                                            if(_list[_i].TABLE_NAME == 'PUB_MEMBER_PSN'){
                                                list.push(_list[_i]);
                                            }
                                        }
                                        //console.log(list);
                                        //console.log(_list.length);
                                        //console.log(list.length);
                                        //实际更新的数据
                                        helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                            $set:{
                                                'updateData':list,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                            err&&console.log(err);
                                        }));
                                        //实际更新的数据



                                    }

                                }
                        ));
                    }
                });
                //最后一步，更新数据
                this.step(function(){
                    //暂时屏蔽此更新
                    //memberIDArr.length
                    //console.log(memberIDArr);
                    //console.log(list);
                    for(var _i=0;_i<memberIDArr.length;_i++){
                        for(var _j=0;_j<list.length;_j++){

                            var _last_id = list[_j].PK_PUB_FIELD_CHANGEHIS;//当前更新的lastid
                            var _table_name = list[_j].TABLE_NAME;//更新的表名字
                            var _field_name = list[_j].FIELD_NAME;//更新的字段名字
                            var _member_id = list[_j].RK_VALUE;//更新的memberid
                            var _new_value = list[_j].NEW_VALUE;//更新之后最新值


                            if(memberIDArr[_i] == _member_id){
                                console.log('memberIDArr['+_i+']:'+memberIDArr[_i]);
                                console.log('_member_id:'+_member_id);
                                console.log('_field_name:'+_field_name);
                                console.log('_new_value:'+_new_value);

                                //FIELD_NAME 字段名字 : MEM_PSN_CNAME -->会员姓名（中文）
                                /*
                                *
                                *"realname": "田丰",MEM_PSN_CNAME
                                *"gender": "male",MEM_PSN_SEX
                                *"birthday": 830707200000,MEM_PSN_BIRTHDAY DATE +++++++
                                *"mobile": "13964011581",MOBILE_TELEPHONE_NO
                                *"email": "zealair@gmail.com",MEM_PSN_EMAIL
                                 "profession": "广告",MEM_INDUSTRY
                                 "province": "上海",PROVINCE
                                 "city": "上海",CITY
                                 "address": "天钥桥路909号3号楼606",MEM_PSN_ADDRESS
                                 "favoriteStyle": "修身、立体剪裁",MEM_PSN_HOPPY
                                 "favoriteColor": "黑色、蓝色、白色",MEM_PSN_COLOR
                                 */
                                if(_field_name == 'MEM_PSN_CNAME'){

                                    helper.db.coll('welab/customers').update({
                                        $and:
                                            [
                                                {"HaiLanMemberInfo":{$exists:true}},
                                                {"HaiLanMemberInfo.memberID":{$exists:true}},
                                                {"HaiLanMemberInfo.memberID":_member_id}
                                            ]
                                    },{
                                            $set:{
                                                'realname':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_PSN_SEX'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'gender':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MOBILE_TELEPHONE_NO'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'mobile':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_PSN_EMAIL'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'email':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_INDUSTRY'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'profession':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'PROVINCE'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'province':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'CITY'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'city':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'MEM_PSN_ADDRESS'){
                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'address':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'MEM_PSN_HOPPY'){
                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'favoriteStyle':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'MEM_PSN_COLOR'){
                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'favoriteColor':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else{
                                    //忽略其他情况
                                }


                            }
                        }
                    }
                    nowLastid = _list[_list.length-1].PK_PUB_FIELD_CHANGEHIS;//保存最新的lastid

                });

                this.step(function(){
                    //console.log(lastid);
                    //console.log(nowLastid);
                    if(lastid < nowLastid){
                        helper.db.coll("lavico/user/lastId").insert(
                            {
                                'lastid': nowLastid
                                ,'lastModified': new Date().getTime()

                            }
                            , {$safe:true}
                            , function(err){ err&&console.log(err) }
                        );
                    }

                });
                this.step(function(){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"success":true,"info":"lastid_is_'+nowLastid+'","end":false}');
                    this.res.end();
                    this.terminate();
                });
            }
        },
        Modified:{
            layout:null,
            view:null,
            process:function(seed,nut){
              this.step(function(){
                nut.disabled = true ;
                var then =this;
                var data_request = {
                    'email':seed.email,
                    'profession':seed.profession,
                    'province':seed.province,
                    'city':seed.city,
                    'address':seed.address,
                    'favoriteStyle':seed.favoriteStyle,
                    'favoriteColor':seed.favoriteColor,
                    'complete':1                
                };
                helper.db.coll("lavico/user/logs").insert(
                    {
                        'createTime':new Date().getTime(),
                        'wxid':seed.wxid,
                        'action':"info",
                        'request':data_request
                    },
                    function(err, doc){
                    }
                );		                
                helper.db.coll('welab/customers').update({wechatid:seed.wxid},
                  {$set:data_request},  
                  this.hold(function(err, doc){
                    then.res.writeHead(200, { 'Content-Type': 'application/json' });
                    if(doc){
                      then.res.write('{"result":"ok"}');
                    }else{
                      then.res.write('{"result":"fail"}');
                    }
                    then.res.end();
                    then.terminate();
                }));
              });
            }
        }
    }

}
function contains(arr, obj) {
    var i = arr.length;
    while(i--){
        if(arr[i] == obj){
            return true;
        }
    }
    return false;
}