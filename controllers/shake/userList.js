/*
* 摇一摇：统计的用户列表
* */
var search = require("welab/lib/search.js") ;
var util = require("welab/controllers/summary/util.js") ;

module.exports = {


    layout: "welab/Layout"
    , view: "lavico/templates/shake/userList.html"

    , process: function (seed, nut) {
        this.step(function(){
            helper.db.coll("lavico/tags").find({}).toArray(this.hold(function(err,docs){
                if(err) throw  err;
                nut.model.taglist = docs || {};
            }))
        })
        nut.model.startDate = seed.startDate;
        nut.model.stopDate = seed.stopDate;
        nut.model.unwind = seed.unwind;
        nut.model._id = seed._id;
       // console.log('+++++++++++++++++++++++++');
        //console.log(nut.model);
        //console.log('+++++++++++++++++++++++++');


    }
    , viewIn : function(){

        $("#userList").flexigrid({
            url: '/lavico/shake/userList:jsonData?unwind='+$(".unwind").val()+'&startDate='+$(".startDate").val()+"&stopDate="+$(".stopDate").val()+"&_id="+$("._id").val(),
            dataType: 'json',
            colModel : [
                {display: '<input type="checkbox" onclick="selectAllUser(this)">', name : 'input', width : 30, sortable : true},
                {display: '日期', name : $(".unwind").val()+'.createDate', width : 80, sortable : true},
                {display: '微信ID', name : $(".unwind").val()+'.uid', width : 50, sortable : true, hide:true},
                {display: '姓名', name : 'realname', width : 80, sortable : true},
                {display: '标签', name : 'tags', width : 292, sortable : true, hide:false},
                {display: '手机号码', name : 'mobile', width : 100, sortable : true},
                {display: 'memberID', name :'memberID', width : 80, sortable : true},
//                {display: '券名', name : $(".unwind").val()+'.promotion_name', width : 100, sortable : true},
                {display: '券号', name : $(".unwind").val()+'.coupon_no', width : 180, sortable : true},
                {display: '券中奖率', name : $(".unwind").val()+'.lottery_chance', width : 80, sortable : true},
                {display: '消耗积分', name : $(".unwind").val()+'.points', width : 80, sortable : true},
                {display: '券名称', name : $(".unwind").val()+'.display_name', width : 80, sortable : true},
                {display: '面值', name : $(".unwind").val()+'.promotion_qty', width : 80, sortable : true},
                {display: '性别', name : 'gender', width : 80, sortable : true, hide:false},
                {display: '省份', name : 'province', width : 80, sortable : true, hide:true},
                {display: '城市', name : 'city', width : 80, sortable : true, hide:true},
                {display: '年龄', name : 'birthday', width : 80, sortable : true, hide:true}

            ],
            //sortname: "input",
            sortorder: "desc",
            usepager: true,
            useRp: true,
            rp: 17,
            showTableToggleBtn: true,
            width: 929,
            height: 590,
            onSuccess:function(o){
                $("#userList").find("tr").find("td").each(function(i,o){
                    $(o).click(function(){


                        if( event.srcElement.nodeName == "DIV" || event.srcElement.nodeName == "TD"){

                            if( !$(o).parent().hasClass("trSelected") ){

                                $(o).parent().find("td:eq(0)").find("input")[0].checked = true;
                            }else{
                                $(o).parent().find("td:eq(0)").find("input")[0].checked = false;
                            }
                        }
                    })
                })
            }
        });

    }
    , actions: {

        jsonData: {

            process: function (seed, nut) {

                nut.disabled = true ;

                // 总人数
                var otherData = {};
                // 总消息数
                var count = util.countor(this) ;
                count("customers","totalUser",{},otherData) ;
                count("messages","totaMessages",{replyFor:{$exists:false}},otherData) ;
                count("replyViewLog","totalView",{action:"view"},otherData) ;
                count("replyViewLog","totalShare",{$or:[{action:"share.friend"},{action:"share.timeline"}]},otherData) ;
                count("replyViewLog","totalViewFriend",{$or:[{action:"view.friend"},{action:"view.timeline"}]},otherData) ;

                var conditions = search.conditions(seed) || {} ;

                //关注时间 任意
                if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].followTime){
                    conditions.$or[0].followTime.$gt = parseInt(conditions.$or[0].followTime.$gt/1000);
                    conditions.$or[0].followTime.$lt = parseInt(conditions.$or[0].followTime.$lt/1000);

                }

                if(conditions && conditions.$or && conditions.$or[1] && conditions.$or[1].followTime){
                    conditions.$or[1].followTime.$gt = parseInt(conditions.$or[1].followTime.$gt/1000);
                    conditions.$or[1].followTime.$lt = parseInt(conditions.$or[1].followTime.$lt/1000);

                }

                //关注时间 全部
                if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].followTime){
                    conditions.$and[0].followTime.$gt = parseInt(conditions.$and[0].followTime.$gt/1000);
                    conditions.$and[0].followTime.$lt = parseInt(conditions.$and[0].followTime.$lt/1000);
                }

                if(conditions && conditions.$and && conditions.$and[1] && conditions.$and[1].followTime){
                    conditions.$and[1].followTime.$gt = parseInt(conditions.$and[1].followTime.$gt/1000);
                    conditions.$and[1].followTime.$lt = parseInt(conditions.$and[1].followTime.$lt/1000);
                }
                //年龄 任意
                if(conditions && conditions.$or && conditions.$or[0] && conditions.$or[0].birthday){
                    if(conditions.$or[0].birthday.$gt){
                        conditions.$or[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$or[0].birthday.$lt){
                        conditions.$or[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
                    }else if(conditions.$or[0].birthday.$lte){
                        conditions.$or[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$or[0].birthday.$gte){
                        conditions.$or[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
                    }else{
                        var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-01-01 00:00:00").getTime();
                        var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[0].birthday)))+"-12-31 23:59:59").getTime();
                        var investigation  = {$gte:gt,$lte:lt};
                        conditions.$or[0].birthday=investigation;
                    }
                }

                if(conditions && conditions.$or && conditions.$or[1] && conditions.$or[1].birthday){
                    if(conditions.$or[1].birthday.$gt){
                        conditions.$or[1].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[1].birthday.$gt)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$or[1].birthday.$lt){
                        conditions.$or[1].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[1].birthday.$lt)))+"-01-01 00:00:00").getTime();
                    }else if(conditions.$or[1].birthday.$lte){
                        conditions.$or[1].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[1].birthday.$lte)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$or[1].birthday.$gte){
                        conditions.$or[1].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[1].birthday.$gte)))+"-01-01 00:00:00").getTime();
                    }else{
                        var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[1].birthday)))+"-01-01 00:00:00").getTime();
                        var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$or[1].birthday)))+"-12-31 23:59:59").getTime();
                        var investigation  = {$gte:gt,$lte:lt};
                        conditions.$or[1].birthday=investigation;
                    }
                }
                //年龄 全部
                if(conditions && conditions.$and && conditions.$and[0] && conditions.$and[0].birthday){
                    if(conditions.$and[0].birthday.$gt){
                        conditions.$and[0].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gt)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$and[0].birthday.$lt){
                        conditions.$and[0].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lt)))+"-01-01 00:00:00").getTime();
                    }else if(conditions.$and[0].birthday.$lte){
                        conditions.$and[0].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$lte)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$and[0].birthday.$gte){
                        conditions.$and[0].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday.$gte)))+"-01-01 00:00:00").getTime();
                    }else{
                        var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-01-01 00:00:00").getTime();
                        var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[0].birthday)))+"-12-31 23:59:59").getTime();
                        var investigation  = {$gte:gt,$lte:lt};
                        conditions.$and[0].birthday=investigation;
                    }
                }

                if(conditions && conditions.$and && conditions.$and[1] && conditions.$and[1].birthday){
                    if(conditions.$and[1].birthday.$gt){
                        conditions.$and[1].birthday.$gt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[1].birthday.$gt)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$and[1].birthday.$lt){
                        conditions.$and[1].birthday.$lt =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[1].birthday.$lt)))+"-01-01 00:00:00").getTime();
                    }else if(conditions.$and[1].birthday.$lte){
                        conditions.$and[1].birthday.$lte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[1].birthday.$lte)))+"-12-31 23:59:59").getTime();
                    }else if(conditions.$and[1].birthday.$gte){
                        conditions.$and[1].birthday.$gte =new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[1].birthday.$gte)))+"-01-01 00:00:00").getTime();
                    }else{
                        var gt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[1].birthday)))+"-01-01 00:00:00").getTime();
                        var lt = new Date((parseInt(new Date().getFullYear()-parseInt(conditions.$and[1].birthday)))+"-12-31 23:59:59").getTime();
                        var investigation  = {$gte:gt,$lte:lt};
                        conditions.$and[1].birthday=investigation;
                    }
                }

                var storeList;
                this.step(function(){
                    /*关注来源数字与门店对应，查询lavico/stores表*/
                    helper.db.coll("lavico/stores").find().sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                        if(err) throw err ;
                        if(doc&&doc[0]&&doc[0].storeList){
                            storeList = doc[0].storeList;
                        }else{
                            storeList = false;
                        }
                    }));
                })

                this.step(function(){
                    if(conditions && conditions.$or){
                        for(var i =0 ;i<conditions.$or.length;i++){
                            if(conditions.$or[i].source){
                                if(storeList){
                                    for(var j=0;j<storeList.length;j++){
                                        if(conditions.$or[i].source==storeList[j][1]){
                                            conditions.$or[i].source =  ""+storeList[j][0];
                                        }
                                    }
                                }
                            }
                        }
                    }else if(conditions && conditions.$and){
                        for(var i =0 ;i<conditions.$and.length;i++){
                            if(conditions.$and[i].source){
                                if(storeList){
                                    for(var j=0;j<storeList.length;j++){
                                        if(conditions.$and[i].source==storeList[j][1]){
                                            conditions.$and[i].source =  ""+storeList[j][0];
                                        }
                                    }
                                }
                            }
                        }
                    }
                })

                var _data = {};
                var _rows = [];

                var sort = {_id:-1};
                if(seed.sortname){

                    var order = seed.sortorder == "asc" ? 1 : -1;
                    sort = eval("({\""+seed.sortname+"\":"+order+"})")
                }


                this.step(function(){

                    var arrregateParams = [
                    ]

                    if(seed.unwind){
                        conditions[seed.unwind+".createDate"] = {$gt:new Date(seed.startDate + " 00:00:00").getTime(), $lt:new Date(seed.stopDate + " 23:59:59").getTime()}
                        arrregateParams.push({$unwind: "$"+seed.unwind})
                    }

                    if(seed._id){
                        conditions[seed.unwind+".aid"] = seed._id
                    }
                    //console.log(seed._id);
                    arrregateParams.push({$match:conditions})
                    //console.log(arrregateParams)
                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;
                            _data.page = (parseInt(seed.page)||1)
                            _data.total = docs.length

                        })
                    );

                    arrregateParams.push({$sort:sort})
                    arrregateParams.push({$skip:((parseInt(seed.page)-1)||0)*(parseInt(seed.rp) || 20)})
                    arrregateParams.push({$limit:(parseInt(seed.rp) || 20)})
                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;

                            for (var i=0; i<docs.length; i++)
                            {
                                docs[i].input = '<input type="checkbox" userid="'+docs[i]._id+'" id="'+docs[i]._id+'" onclick="checkUser(this)" >';
                                docs[i].realname = docs[i].realname || '';
                                docs[i].city = docs[i].city || '';
                                docs[i].followCount = docs[i].followCount || '1';
                                docs[i].messageCount = docs[i].messageCount && otherData.totaMessages ? (docs[i].messageCount) + " <span style='color: #1ABC9C'>" + (parseInt((docs[i].messageCount / otherData.totaMessages)*100)) + "%</span>" : "0";
                                docs[i].isRegister = docs[i].registerTime ? "是" : "否"
                                docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '未知')
                                docs[i].birthday = parseInt(((new Date()) - (parseInt(docs[i].birthday))) / (1000*60*60*24*365))

                                var tags = [];
                                if( docs[i].tags){
                                    for (var ii=0; ii<docs[i].tags.length; ii++)
                                    {
                                        tags.push('<span class="tm-tag tm-tag-info" ><span>'+docs[i].tags[ii]+'</span><a href="javascript:;" class="tm-tag-remove" tagidtoremove="1"  onclick="removeTagOrKeyword(this)">×</a></span>')
                                    }
                                }
                                docs[i].tags = tags.join("&nbsp;")
                                docs[i].followTimebak = docs[i].followTime;
                                docs[i].mobile = docs[i].mobile || '';
                                docs[i].memberID = (docs[i].HaiLanMemberInfo&&(docs[i].HaiLanMemberInfo.memberID!='undefined'))?docs[i].HaiLanMemberInfo.memberID:'';

                                docs[i].followTime = parseInt(((new Date()) - (new Date(docs[i].followTime*1000))) / (1000*60*60*24))
                                docs[i].registerTime = parseInt(((new Date()) - (new Date(docs[i].registerTime))) / (1000*60*60*24))
                                docs[i].lastMessageTime = parseInt(((new Date()) - (new Date(docs[i].lastMessageTime))) / (1000*60*60*24))
                                docs[i].isBlacklist = "否"
                                docs[i].viewCount = docs[i].viewCount && otherData.totalView ? (docs[i].viewCount) + " <span style='color: #1ABC9C'>" + (parseInt((docs[i].viewCount / otherData.totalView)*100)) + "%</span>" : "0";


                                for(var oi in docs[i]){

                                    if(typeof(docs[i][oi]) == "object"){
                                        for(var oii in docs[i][oi]){

                                            if(oii == "createDate"){

                                                docs[i][oi+"."+oii] = new Date(docs[i][oi][oii] + 60*60*8*1000).toISOString().substr(0,10)
                                            }else{

                                                docs[i][oi+"."+oii] = docs[i][oi][oii]
                                            }
                                        }
                                    }
                                }


                                _rows.push(docs[i])
                            }

                            _data.rows = _rows;
                        })
                    );

                })



                this.step(function(){

                    var data = JSON.stringify(_data);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }

        }


        , exports: {

            process: function (seed, nut) {
                nut.disabled = true ;
                //门店信息
                var storeList;
                var conditions = search.conditions(seed) || {} ;
                //this.terminate();
                var _data = {};
                var _rows = [];

                var sort = {_id:-1};
                if(seed.sortname){

                    var order = seed.sortorder == "asc" ? 1 : -1;
                    sort = eval("({\""+seed.sortname+"\":"+order+"})")
                }
                this.step(function(){
                    /*关注来源数字与门店对应，查询lavico/stores表*/
                    helper.db.coll("lavico/stores").find().sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){

                        if(err) throw err ;
                        if(doc&&doc[0]&&doc[0].storeList){
                            storeList = doc[0].storeList;
                        }else{
                            storeList = false;
                        }
                    }));
                })
                this.step(function(){

                    var arrregateParams = [
                        {$match:conditions}
                    ]

                    if(seed.unwind){
                        arrregateParams.push({$unwind: "$"+seed.unwind})
                    }


                    if(seed._id){
                        conditions[seed.unwind+".aid"] = seed._id
                    }
                    arrregateParams.push({$match:conditions})

                    arrregateParams.push({$sort:sort});

                    helper.db.coll("welab/customers").aggregate(
                        arrregateParams
                        ,this.hold(function(err,docs){
                            if(err) console.log(err) ;
                            try{
                                for (var i=0; i<docs.length; i++)
                                {
                                    docs[i].realname = docs[i].realname || '未注册用户';
                                    docs[i].city =  docs[i].city || "";
                                    docs[i].followCount = docs[i].followCount || '1';
                                    docs[i].messageCount = docs[i].messageCount||'1';
                                    docs[i].isRegister = docs[i].registerTime ? "是" : "否"
                                    docs[i].gender = docs[i].gender == 'female'?"女": (docs[i].gender == 'male' ? "男" : '未知')
                                    docs[i].birthday = docs[i].birthday ?parseInt(new Date().getFullYear()-new Date(docs[i].birthday).getFullYear()):""

                                    var cardtype = {1:"白卡", 2:"VIP卡", 3:"白金VIP卡"}
                                    docs[i].cardtype = docs[i].HaiLanMemberInfo ? cardtype[docs[i].HaiLanMemberInfo.type]||"" : "";

                                    docs[i].profession = docs[i].profession || '';
                                    var tags = [];
                                    if( docs[i].tags){
                                        for (var ii=0; ii<docs[i].tags.length; ii++)
                                        {
                                            tags.push(docs[i].tags[ii])
                                        }
                                    }

                                    docs[i].source = docs[i].source;

                                    /*门店查询David.xu-2014-07-23*/

                                    if(docs[i].source&&storeList){

                                        var _source = [];
                                        var _sourceObject = docs[i].source;
                                        if(_sourceObject){
                                            for(var _i in _sourceObject){

                                                if(_i == 0){
                                                    _sourceObject[_i] = storeList[_sourceObject[_i]][1];
                                                    _source =  [_sourceObject[_i]];
                                                }
                                            }
                                        }

                                        docs[i].source =  _source || '';
                                    }

//                                    if(docs[i].source&&storeList){
//                                        var _sourceObject = docs[i].source;
//                                        for(var _i in _sourceObject){
//                                            _sourceObject[_i] = storeList[_sourceObject[_i]][2];
//                                        }
//                                        docs[i].source = _sourceObject || '';
//                                    }else{
//                                        docs[i].source=""
//                                    }
                                    docs[i].tags = tags.join(",")
                                    docs[i].followTimebak = docs[i].followTime;
                                    docs[i].followTime = docs[i].followTime ? new Date(docs[i].followTime*1000).toISOString().substr(0,10) : "未知"
                                    docs[i].registerTime = docs[i].registerTime ? new Date(docs[i].registerTime).toISOString().substr(0,10) : "未知"
                                    docs[i].lastMessageTime = docs[i].lastMessageTime ? new Date(docs[i].lastMessageTime).toISOString().substr(0,10) : "未知"
//                                    if(docs[i] && docs[i].shake && docs[i].shake.memberID =="undefined"){
//                                        docs[i].shake.memberID = '';
//                                    }else{
//                                        docs[i].shake.memberID = docs[i].shake.memberID || '';
//                                    }

                                    if(docs[i] && docs[i].HaiLanMemberInfo && docs[i].HaiLanMemberInfo.memberID){
                                        docs[i].shake.memberID = docs[i].HaiLanMemberInfo.memberID;
                                    }else{
                                        docs[i].shake.memberID = '';
                                    }

                                    docs[i].province = docs[i].province || '';
                                    docs[i].mobile = docs[i].mobile || '';
                                    _rows.push(docs[i])
                                }
                            }catch(e){
                                if(e) console.log(e)
                            }


                            _data = _rows;

                        })
                    );

                })



                this.step(function(){

                    try{
                        var nodeExcel = require('excel-export');
                        var conf = {};
                        conf.cols = [

                            {
                                caption: '姓名',
                                type: 'string'
                            },{
                                caption:"省份",
                                type:"string"
                            }, {
                                caption: '城市',
                                type: 'string'
                            }, {
                                caption:"会员卡等级",
                                type:"string"
                            },{
                                caption: '关注次数',
                                type: 'string'
                            }, {
                                caption: '消息总数',
                                type: 'string'
                            }, {
                                caption: '性别',
                                type: 'string'
                            }, {
                                caption: '年龄',
                                type: 'string'
                            },{
                                caption:"行业",
                                type:"string"
                            },{
                                caption:"标签",
                                type:"string"
                            },{
                                caption:"关注门店",
                                type:"string"
                            }, {
                                caption: '关注时间',
                                type: 'string'
                            }, {
                                caption: '注册时间',
                                type: 'string'
                            },{
                                caption: '手机号码',
                                type: 'string'
                            },{
                                caption: '会员ID',
                                type: 'string'
                            },{
                                caption: '券号码',
                                type: 'string'
                            },{
                                caption: '券金额',
                                type: 'string'
                            },{
                                caption: '券中奖率',
                                type: 'string'
                            },{
                                caption: '活动名称',
                                type: 'string'
                            },{
                                caption: '活动编号',
                                type: 'string'
                            },{
                                caption: '消耗积分',
                                type: 'string'
                            },{
                                caption: '日期',
                                type: 'string'
                            }
                        ];

                        if(seed.unwind && seed.data){
                            var data = JSON.parse(seed.data)
                            for(var ii in data){
                                conf.cols.push({
                                    caption: data[ii],
                                    type: 'string'
                                })
                            }
                        }
                        conf.rows = [];

                        for(var i=0 ;i < _data.length ;i++){
                            _data[i].shake.createDate = formatDate(_data[i].shake.createDate);
                            _data[i].province = _data[i].province || '';
                            _data[i].city = _data[i].city || '';
                            _data[i].gender = _data[i].gender || '';
                            _data[i].shake.memberID = _data[i].shake.memberID || '';
                            _data[i].shake.coupon_no = _data[i].shake.coupon_no || '';
                            _data[i].shake.promotion_name = _data[i].shake.promotion_name || '';
                            _data[i].shake.promotion_code = _data[i].shake.promotion_code || '';
                            _data[i].shake.points = _data[i].shake.points || '0';
                            _data[i].shake.promotion_qty = _data[i].shake.promotion_qty || '0';
                            _data[i].shake.lottery_chance = _data[i].shake.lottery_chance || '';
                            var rows;
                            rows = [
                                _data[i].realname,
                                _data[i].province,
                                _data[i].city,
                                _data[i].cardtype,
                                _data[i].followCount,
                                _data[i].messageCount,
                                _data[i].gender,
                                _data[i].birthday,
                                _data[i].profession,
                                _data[i].tags || "",
                                _data[i].source ||"",
                                _data[i].followTime,
                                _data[i].registerTime,
                                _data[i].mobile,
                                _data[i].shake.memberID || "",
                                _data[i].shake.coupon_no,
                                _data[i].shake.promotion_qty,
                                _data[i].shake.lottery_chance,
                                _data[i].shake.promotion_name,
                                _data[i].shake.promotion_code,
                                _data[i].shake.points,
                                _data[i].shake.createDate
                            ]

                            if(seed.unwind && seed.data){
                                var data = JSON.parse(seed.data)
                                for(var ii in data){
                                    if(ii == "createDate"){
                                        var val = new Date(_data[i][seed.unwind][ii] + 60*60*8*1000).toISOString().substr(0,10)
                                    }else{
                                        var val = _data[i][seed.unwind][ii]
                                    }

                                    rows.push(
                                        val
                                    )

                                }
                            }
                            conf.rows.push(rows)

                        }
                    }catch(e){
                        if(e) console.log(e)
                    }


                    //console.log(conf)

                    var result = nodeExcel.execute(conf);
                    this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                    this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
                    this.res.write(result, 'binary');
                    return this.res.end();
                })
            }

        }
    }

}
function  formatDate(now){
    var   now = new Date(now);
    var   year=now.getFullYear();
    var   month=now.getMonth()+1;
    var   date=now.getDate();
    if(month < 10){
        month = '0'+month;
    }
    if(date < 10){
        date = '0'+date;
    }
    var   hour=now.getHours();
    var   minute=now.getMinutes();
    var   second=now.getSeconds();
    return   year+"-"+month+"-"+date;
}