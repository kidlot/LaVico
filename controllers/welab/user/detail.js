/**
 * Created by David Xu on 5/29/14.
 */
var summary = require("./summary.js") ;

module.exports = {

    layout: "welab/Layout"
    , view: "welab/templates/user/detail.html"

    ,process: function (seed, nut) {

        helper.db.coll("welab/customers").findOne({_id : helper.db.id(seed._id)},this.hold(function(err,doc){

            var _data = {};
            _data = doc;
            summary.otherData(seed._id , this.hold(function(doc){
                _data.otherData = doc;

                _data.regData = {}
                for(var _tmp in _data){
                    if( _tmp != "_id" && _tmp != "city" && _tmp != "country" && _tmp != "face" && _tmp != "fakeid" && _tmp != "followCount" && _tmp != "followTime" && _tmp != "gender" && _tmp != "isFollow" && _tmp != "lastMessageTime" && _tmp != "messageCount" && _tmp != "province" && _tmp != "ranking" && _tmp != "realname" && _tmp != "wechatUsername" && _tmp != "wechatid" && _tmp != "otherData" && _tmp!="regData" && _tmp!="birthday" && _tmp!="mobile" && _tmp!="tags" && _tmp!="email" && _tmp!="registerTime" && _tmp!="telephone" && _tmp!="unfollowCount" && _tmp!="unfollowTime"  && _tmp!="shareFriendCount" && _tmp!="shareTimeLineCount" && _tmp!="viewCount" && _tmp!="viewTimeLineCount"){
                        _data.regData[_tmp] = _data[_tmp]
                    }
                }

                if(_data.face && !/^http:\/\//g.test(_data.face) && !/^\/welab\//g.test(_data.face)){
                    _data.face = "/welab/" + _data.face
                }

                console.log(_data)


                nut.model.data = _data||{};
            }));
        }))
    }

    , viewIn: function(){

        jQuery("#tags").tagsManager({
            prefilled: [],
            hiddenTagListName: 'tagsVal'
        });


        $('#datetimepicker').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        }).on('changeDate', function(ev)
            {
                $("#datetimepicker").attr("utime",ev.date.valueOf())
            });


        /**
         * 删除动作
         */
        var deletingLink ;
        $(".removeUserView").on("click",function(){
            deletingLink = this ;
            $('#delModal').modal('toggle');
            return false;
        })

        $(".removeUserBtn").click(function(){
            $('#delModal').modal('toggle');
            $(deletingLink).action(function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
                $.controller("/welab/user/list",null,"lazy");
            }) ;
            return false;
        });

        /**
         * 设置标签
         */
        var oUserSetOption = {} ;

        $(".userSetTagView").on("click",function(){
            jQuery("#tags").tagsManager('empty');
            $('#tagModal').modal('toggle');
            oUserSetOption = {} ;
            oUserSetOption.data = [];
            oUserSetOption.data.push({name:"sUserList",value:$("#_id").text()});
            return false;
        })

        $(".userTagBtn").click(function(){

            var tags = $("input[type='hidden'][name='tagsVal']").val();
            if( tags == ""){
                $.globalMessenger().post({
                    message: '至少设置一个标签.',
                    type: 'error',
                    showCloseButton: true})
                return ;
            }
            oUserSetOption.data.push({name:"sTagList",value:tags});
            oUserSetOption.type = "POST";
            oUserSetOption.url = "/welab/user/tags:setUserTag";
            $('#tagModal').modal('toggle');

            $.request(oUserSetOption,function(err,nut){
                if(err) throw err ;
                nut.msgqueue.popup() ;
                $.controller("/welab/user/detail?_id="+$("#_id").text(),null,"lazy");
            }) ;

            return false;

        });

        pro=document.getElementById("provid");
        for(var key in selects){
            pro.options.add(new Option(key,key));
        }
    }
}