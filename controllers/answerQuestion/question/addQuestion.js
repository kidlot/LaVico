var middleware = require('lavico/lib/middleware.js');//引入中间件
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/question/addQuestion.html",
    process:function(seed,nut){
        var perPage = 1000;
        var pageNum = seed.page ? seed.page : 1;
        var type = seed.themetype ? seed.themetype : 0;
        nut.model.type = type;

        this.step(function(){
            middleware.request('Coupon/Promotions',{perPage:perPage,pageNum:pageNum},this.hold(function(err,doc){
                doc=doc.replace(/[\n\r\t]/,'');
                var doc_json = eval('(' + doc + ')');
                nut.model.doc_json=doc_json;

            })
            )})

    },
    actions:{
        save:{
            process:function(seed,nut){
                helper.db.coll("lavico/themeQuestion").insert(eval('('+seed.json+')'),this.hold(function(err, doc) {
                    if(err) throw err;
                }));

                middleware.request('Coupon/Promotions',{
                    perPage:1000,
                    pageNum:1
                },this.hold(function(err,doc){
                    doc = doc.replace(/[\n\r\t]/,'');
                    var doc_json = eval('(' + doc + ')');
                    nut.model.doc_json=doc_json;

                }))

            }
        }
    },
    viewIn:function(){
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


























//module.exports={
//    layout:"welab/Layout",
//    view:"lavico/templates/answerQuestion/question/addQuestion.html",
//    process:function(seed,nut){
//        var perPage = 1000;
//        var pageNum = seed.page ? seed.page : 1;
//
//        this.step(function(){
//            middleware.request('Coupon/Promotions',{perPage:perPage,pageNum:pageNum},this.hold(function(err,doc){
//
//                    doc=doc.replace(/[\n\r\t]/,'');
//                    var doc_json = eval('(' + doc + ')');
//                    nut.model.doc_json=doc_json;
//                })
//            )
//        })
//
//    },
//    actions:{
//        save:{
//            process:function(seed,nut){
//
//                helper.db.coll("lavico/themeQuestion").insert(eval('('+seed.json+')'),this.hold(function(err, doc) {
//                    if(err) throw err;
//                }));
//
//                middleware.request('Coupon/Promotions',{
//                    perPage:1000,
//                    pageNum:1
//                },this.hold(function(err,doc){
//
//                    doc = doc.replace(/[\n\r\t]/,'');
//                    var doc_json = eval('(' + doc + ')');
//                    nut.model.doc_json=doc_json;
//
//                }))
//
//            }
//        }
//    },
//    viewIn:function(){
//        $('#datetimepicker_s').datetimepicker({
//            format: 'yyyy-mm-dd',
//            autoclose: true,
//            minView: 2
//        }).on('changeDate', function(ev)
//        {
//            $.controller("/welab/summary/addQuestion",{
//                start: $("#datetimepicker_s").val() ,
//                end: $("#datetimepicker_t").val()
//            },'.childview:last()>.ocview') ;
//        });
//
//        $('#datetimepicker_t').datetimepicker({
//            format: 'yyyy-mm-dd',
//            autoclose: true,
//            minView: 2,
//        }).on('changeDate', function(ev)
//        {
//            $.controller("/welab/summary/addQuestion",{
//                start: $("#datetimepicker_s").val() ,
//                end: $("#datetimepicker_t").val()
//            },'.childview:last()>.ocview') ;
//        });
//    }
//}