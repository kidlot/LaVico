/**
 * Created by root on 14-4-8.
 */
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/question/addQuestion.html",
    process:function(seed,nut){

    },
    actions:{
        save:{
            process:function(seed,nut){
                    console.log(seed.json);
                    helper.db.coll("lavico/themeQuestion").insert(eval('('+seed.json+')'),this.hold(function(err, doc) {
                            if(err) throw err;
                        }));
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