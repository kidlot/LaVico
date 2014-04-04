module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/lookbook/statistics.html"

    , process: function(seed,nut)
    {
        if(seed._id){

            nut.model._id = seed._id
            var then = this
            var docs;

            helper.db.coll("lavico/lookbook").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){

                docs = _doc
                for(var i=0;i<docs.page.length;i++){

                    for(var ii=0;ii<docs.page[i].product.length;ii++){

                        (function(i,ii){

                            helper.db.coll("welab/customers").find({"lookbook.productId":docs.page[i].product[ii]._id}).count(then.hold(function(err,_doc2){
                                docs.page[i].product[ii].sumFavorites = _doc2
                            }))
                        })(i,ii)
                    }
                }
            }))

            this.step(function(){

                nut.model.doc = docs
            })


        }else{
            nut.disable();
            var data = JSON.stringify({err:1,msg:"没有ID"});
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(data);
            this.res.end();
        }

        this.step(function(){


            var dTime = new Date()
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)

            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate};
        })
    }
    , children: {

        userList: {

            layout: "welab/Layout"
            , view: "lavico/templates/userList.html"

            , process: function(seed,nut)
            {
                nut.model.startDate = seed.startDate
                nut.model.stopDate = seed.stopDate
            }
            , viewIn : function(){

                console.log("userList")

                $("#userList").flexigrid({
                    url: '/lavico/userList:jsonData?unwind=lookbook&startDate='+$(".startDate").val()+"&stopDate="+$(".stopDate").val(),
                    dataType: 'json',
                    colModel : [
                        {display: '<input type="checkbox" onclick="selectAllUser(this)">', name : 'input', width : 30, sortable : true},
                        {display: '日期', name : 'lookbook.createDate', width : 150, sortable : true},
                        {display: '姓名', name : 'realname', width : 150, sortable : true},
                        {display: '标签', name : 'tags', width : 442, sortable : true},
                        {display: '名称', name : 'lookbook.name', width : 150, sortable : true},

                        {display: '性别', name : 'gender', width : 80, sortable : true, hide:true},
                        {display: '年龄', name : 'birthday', width : 80, sortable : true, hide:true},
                        {display: '城市', name : 'city', width : 80, sortable : true, hide:true},
                        {display: '已关注(天)', name : 'followTime', width : 70, sortable : true, hide:true},
                        {display: '已注册(天)', name : 'registerTime', width : 70, sortable : true, hide:true},
                        {display: '未会话(天)', name : 'lastMessageTime', width : 70, sortable : true, hide:true},
                        {display: '会话数(占比)', name : 'messageCount', width : 100, sortable : true, hide:true}
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
        }

    }
    , viewIn : function(){

        $('#startDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        });

        $('#stopDate').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        });

        jQuery("#tags").tagsManager({
            prefilled: [],
            hiddenTagListName: 'tagsVal'
        });

        $("#exportssd").attr("href","/lavico/userList:exports?unwind=lookbook&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%94%B6%E8%97%8F%E6%97%B6%E9%97%B4%22%7D")
    }


}







