/**
 * Created by root on 14-4-9.
 */
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/question/updateQuestion.html",
    process:function(seed,nut){
        id=seed._id;
        helper.db.coll("lavico/themeQuestion").findOne({_id:helper.db.id(id)},this.hold(function(err,doc){
            if(err) throw err;
            nut.model.docs=doc;
            console.log(doc);
        }))
    },
    actions:{
        save:{
            process:function(seed,nut){

                helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(seed._id)}
                    ,eval('('+seed.json+')'),this.hold(function(err, doc) {
                        if(err) throw err;
                    }))
            }
        }
    },
    viewIn:function(){
        $('#datetimepicker_s').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        }).on('changeDate', function(ev)
            {
                $.controller("/welab/summary/addQuestion",{
                    start: $("#datetimepicker_s").val() ,
                    end: $("#datetimepicker_t").val()
                },'.childview:last()>.ocview') ;
            });

        $('#datetimepicker_t').datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2,
        }).on('changeDate', function(ev)
            {
                $.controller("/welab/summary/addQuestion",{
                    start: $("#datetimepicker_s").val() ,
                    end: $("#datetimepicker_t").val()
                },'.childview:last()>.ocview') ;
            });
    }
}