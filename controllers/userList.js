var search = require("welab/lib/search.js") ;
var util = require("welab/controllers/summary/util.js") ;

module.exports = {


    layout: "welab/Layout"
    , view: "lavico/templates/userList.html"

    , process: function (seed, nut) {

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


                var conditions = search.conditions(seed) ;

                var _data = {};
                var _rows = [];

                var sort = {_id:-1};
                if(seed.sortname){

                    var order = seed.sortorder == "asc" ? 1 : -1;
                    sort = eval("({\""+seed.sortname+"\":"+order+"})")
                }


                this.step(function(){

                    helper.db.coll("welab/customers").find(conditions).sort(sort).page((parseInt(seed.rp) || 20),seed.page||1,this.hold(function(err,page){
                        if(err) throw err ;

                        _data.page = page.currentPage
                        _data.total = page.totalcount

                        for (var i=0; i<page.docs.length; i++)
                        {
                            page.docs[i].input = '<input type="checkbox" userid="'+page.docs[i]._id+'" onclick="checkUser(this)" >';
                            page.docs[i].realname = page.docs[i].realname || '未注册用户';
                            page.docs[i].city = page.docs[i].city || '';
                            page.docs[i].followCount = page.docs[i].followCount || '1';
                            page.docs[i].messageCount = page.docs[i].messageCount && otherData.totaMessages ? (page.docs[i].messageCount) + " <span style='color: #1ABC9C'>" + (parseInt((page.docs[i].messageCount / otherData.totaMessages)*100)) + "%</span>" : "0";
                            page.docs[i].isRegister = page.docs[i].registerTime ? "是" : "否"
                            page.docs[i].gender = page.docs[i].gender == 'female'?"女": (page.docs[i].gender == 'male' ? "男" : '未知')
                            page.docs[i].birthday = parseInt(((new Date()) - (parseInt(page.docs[i].birthday))) / (1000*60*60*24*365))
                            page.docs[i]['lookbook.createDate'] = page.docs[i].lookbook[0].createDate

                            var tags = [];
                            if( page.docs[i].tags){
                                for (var ii=0; ii<page.docs[i].tags.length; ii++)
                                {
                                    tags.push('<span class="tm-tag tm-tag-info" ><span>'+page.docs[i].tags[ii]+'</span><a href="#" class="tm-tag-remove" tagidtoremove="1" data-dismiss="alert" onclick="removeTagOrKeyword(this)">×</a></span>')
                                }
                            }
                            page.docs[i].tags = tags.join("&nbsp;")
                            page.docs[i].followTimebak = page.docs[i].followTime;
                            page.docs[i].followTime = parseInt(((new Date()) - (new Date(page.docs[i].followTime*1000))) / (1000*60*60*24))
                            page.docs[i].registerTime = parseInt(((new Date()) - (new Date(page.docs[i].registerTime))) / (1000*60*60*24))
                            page.docs[i].lastMessageTime = parseInt(((new Date()) - (new Date(page.docs[i].lastMessageTime))) / (1000*60*60*24))
                            page.docs[i].isBlacklist = "否"
                            page.docs[i].viewCount = page.docs[i].viewCount && otherData.totalView ? (page.docs[i].viewCount) + " <span style='color: #1ABC9C'>" + (parseInt((page.docs[i].viewCount / otherData.totalView)*100)) + "%</span>" : "0";

                            var viewFriendCount = page.docs[i].viewFriendCount + page.docs[i].viewTimeLineCount;

                            page.docs[i].viewFriendCount = viewFriendCount && otherData.totalViewFriend ? (viewFriendCount) + " <span style='color: #1ABC9C'>" + (parseInt((viewFriendCount / otherData.totalViewFriend)*100)) + "%</span>" : "0";
                            var viewShareCount = page.docs[i].shareFriendCount + page.docs[i].shareTimeLineCount;

                            page.docs[i].shareFriendCount = viewShareCount && otherData.totalShare ? (viewShareCount) + " <span style='color: #1ABC9C'>" + (parseInt((viewShareCount / otherData.totalShare)*100)) + "%</span>" : "0";
                            _rows.push(page.docs[i])

                            page.docs[i].unfollowTimeForFollow = page.docs[i].isFollow == false ? parseInt((page.docs[i].unfollowTime - (page.docs[i].followTimebak*1000)) / (1000*60*60*24)) : '尚未取消关注'
                            page.docs[i].unfollowTimeForReg = page.docs[i].registerTime ? parseInt((page.docs[i].unfollowTime - (page.docs[i].registerTime)) / (1000*60*60*24)) : '尚未注册'
                        }
                        _data.rows = _rows;
                    })) ;

                })



                this.step(function(){

                    var data = JSON.stringify(_data);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }

        }
    }

}
