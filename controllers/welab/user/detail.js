/**
 * Created by David Xu on 5/29/14.
 */
var summary = require("welab/controllers/user/summary.js") ;

module.exports = {

    layout: "welab/Layout"
    , view: "welab/templates/user/detail.html"

    ,process: function (seed, nut) {


        console.log("fffffffff")

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