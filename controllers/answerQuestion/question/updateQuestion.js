var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/question/updateQuestion.html",
    process:function(seed,nut){
        id=seed._id;
        var scoreMinMaxs;
        var list;
        var themetype = seed.themetype ? seed.themetype : 0;
        nut.model.type = themetype;
        helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(id)},this.hold(function(err,doc){
            if(err) throw err;
            nut.model.docs=doc;
            nut.model.scoreMinMax = doc.scoreMinMax;
            scoreMinMaxs = doc.scoreMinMax;
        }))

        var perPage = 1000;
        var pageNum = seed.page ? seed.page : 1;

        this.step(function(){
            middleware.request('Coupon/Promotions',{
                    perPage:perPage,
                    pageNum:pageNum
                },this.hold(function(err,doc){
                doc = doc.replace(/[\n\r\t]/,'');
                var doc_json = eval('(' + doc + ')');
                nut.model.doc_json=doc_json;
                list =  doc
            })
        )})

        this.step(function(){
            var resultlist = JSON.parse(list)
            var codelist=[];
            for(var j=0;j<resultlist.list.length;j++){
                for(var i=0;i<scoreMinMaxs.length;i++){
                    var ls = {};
                    if(scoreMinMaxs[i].getActivities == resultlist.list[j].PROMOTION_CODE){
                        ls.code = resultlist.list[j].PROMOTION_CODE;
                        ls.name = resultlist.list[j].PROMOTION_NAME
                        ls.selected = "selected";
                        codelist.push(ls)
                    }else{
                        ls.code = resultlist.list[j].PROMOTION_CODE;
                        ls.name = resultlist.list[j].PROMOTION_NAME
                        ls.selected = "";
                        codelist.push(ls)
                    }
                    break;
                }
            }
            nut.model.list = codelist;
        })

    },
    actions:{
        save:{
            process:function(seed,nut){
                helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(seed._id)}
                    ,{$set:eval('('+seed.json+')')},this.hold(function(err, doc) {
                        if(err) throw err;
                    }))

                var perPage = 4;
                var pageNum = seed.page ? seed.page : 1;

                this.step(function(){
                    middleware.request('Coupon/Promotions',{
                            perPage:perPage,
                            pageNum:pageNum
                        },this.hold(function(err,doc){
                        //var doc = '{"total":9,"list":[{"PROMOTION_CODE":"L2013112709","PROMOTION_NAME":"无限制现金券","PROMOTION_DESC":"无限制现金券","row_number":1,"coupons":[{"QTY":123,"COUNT":1,"USED":1},{"QTY":50,"COUNT":500,"USED":0},{"QTY":1000,"COUNT":4,"USED":3},{"QTY":500,"COUNT":49,"USED":40},{"QTY":100,"COUNT":2,"USED":2},{"QTY":10000,"COUNT":50,"USED":50}]},{"PROMOTION_CODE":"MQL201401200001","PROMOTION_NAME":"长沙友谊满3000收500券","PROMOTION_DESC":"长沙友谊满3000收500券","row_number":2,"coupons":[{"QTY":91,"COUNT":1,"USED":0},{"QTY":500,"COUNT":1,"USED":1},{"QTY":100,"COUNT":2,"USED":2}]},{"PROMOTION_CODE":"CQA201401030002","PROMOTION_NAME":"满500抵用100","PROMOTION_DESC":"满500抵用100","row_number":3,"coupons":[{"QTY":100,"COUNT":30,"USED":7}]},{"PROMOTION_CODE":"CPL201401140001","PROMOTION_NAME":"奥德臣原价满10000减2500","PROMOTION_DESC":"奥德臣原价满10000减2500","row_number":4,"coupons":[{"QTY":90,"COUNT":1,"USED":1}]},{"PROMOTION_CODE":"CQL201404010004","PROMOTION_NAME":"贡平礼品券测试","PROMOTION_DESC":"贡平礼品券测试","row_number":5,"coupons":[{"QTY":398,"COUNT":1,"USED":0}]},{"PROMOTION_CODE":"MQL201402180001","PROMOTION_NAME":"ew","PROMOTION_DESC":"ewr","row_number":6,"coupons":[]},{"PROMOTION_CODE":"CQL201402250001","PROMOTION_NAME":"买衬衫送袜子","PROMOTION_DESC":"买衬衫送袜子","row_number":7,"coupons":[{"QTY":150,"COUNT":3,"USED":1}]},{"PROMOTION_CODE":"CQL201312230001","PROMOTION_NAME":"满400抵80券","PROMOTION_DESC":"满400抵80券","row_number":8,"coupons":[{"QTY":79,"COUNT":1,"USED":1},{"QTY":97,"COUNT":1,"USED":0},{"QTY":20,"COUNT":1,"USED":1},{"QTY":100,"COUNT":23,"USED":0}]},{"PROMOTION_CODE":"CQL201403260003","PROMOTION_NAME":"398元券仅限衬衫","PROMOTION_DESC":"398元券仅限衬衫","row_number":9,"coupons":[{"QTY":398,"COUNT":5,"USED":0}]}],"perPage":20,"pageNum":1}';
                        doc = doc.replace(/[\n\r\t]/,'');
                        var doc_json = eval('(' + doc + ')');
                        nut.model.doc_json=doc_json;

                    })
                    )})
            }
        }
    },
    viewIn:function() {
        $('#datetimepicker_s').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        })

        $('#datetimepicker_t').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        })

        $.getScript('/lavico/public/zclip.js/jquery.zclip.min.js',function(){
            $("#btnCopy").zclip({
                path:'/lavico/public/zclip.js/ZeroClipboard.swf',
                copy:$('#host-url').val()
            });
        });

//        $('#datetimepicker_s').datetimepicker({
//            format: 'yyyy-mm-dd',
//            autoclose: true,
//            minView: 2
//        }).on('changeDate', function(ev)
//            {
//                $.controller("/welab/summary/addQuestion",{
//                    start: $("#datetimepicker_s").val() ,
//                    end: $("#datetimepicker_t").val()
//                },'.childview:last()>.ocview') ;
//            });
//
//        $('#datetimepicker_t').datetimepicker({
//            format: 'yyyy-mm-dd',
//            autoclose: true,
//            minView: 2,
//        }).on('changeDate', function(ev)
//            {
//                $.controller("/welab/summary/addQuestion",{
//                    start: $("#datetimepicker_s").val() ,
//                    end: $("#datetimepicker_t").val()
//                },'.childview:last()>.ocview') ;
//            });
    }
}