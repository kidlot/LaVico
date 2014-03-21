module.exports = {

	layout: null
	, view: "lavico/templates/bargain/kv.html"

    , process: function(seed,nut)
    {
        var doc = {};

        if(seed._id){

            helper.db.coll("lavico/bargain").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                doc = _doc || {}
            }))
        }

        this.step(function(){
            nut.model.doc = doc
        })

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
            minView: 2,
            endDate: new Date()
        });
    }

    , actions: {

        save: {

            process: function(seed,nut)
            {

                nut.view.disable() ;

                var postData = JSON.parse(seed.postData);

                if(postData.length == 0 ){
                    nut.message("保存失败。数据不能为空",null,'error') ;
                    return;
                }

                if(seed._id){

                    helper.db.coll("lavico/bargain").update({_id:helper.db.id(seed._id)},{$set:postData},this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                    }));
                }else{
                    postData.createData = new Date().getTime()
                    helper.db.coll("lavico/bargain").insert(postData,this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                    }));
                }



                nut.message("保存成功",null,'success') ;

            }
        }

        , remove: {

            process: function(seed,nut)
            {
                var res = {}

                if(seed._id){

                    helper.db.coll("lavico/bargain").remove({_id:helper.db.id(seed._id)},this.hold(function(err,doc){
                        if(err){
                            throw err;
                        }
                        res = {err:0}
                    }));
                }else{

                    res = {err:1,msg:"没有ID"}
                }

                this.step(function(){
                    nut.disable();
                    var data = JSON.stringify(res);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                })
            }
        }
    }
}







