module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/shake/info.html"

    , process: function(seed,nut)
    {

        nut.model._id = seed._id
        var then = this
        var docs = {};

        var real_count = 0;
        var real_total = 0;
        var count = 0;
        var total = 0;
        this.step(function(){
            var count = 0;
            helper.db.coll("lavico/shake").findOne({_id:helper.db.id(seed._id)},this.hold(function(err,_doc){
                docs = _doc
                helper.db.coll("welab/customers").find({"shake.aid":docs._id.toString()}).toArray(then.hold(function(err,_doc2){
                    docs.sumFavorites = _doc2.length;
                    for(var i=0;i<_doc2.length;i++){
                      for(var j=0;j<_doc2[i].shake.length;j++){
                       if(_doc2[i].shake[j].aid == docs._id.toString()){
                          real_count++;
                        }                        
                      } 
                    }
                }))           
            }))        
        })
        
        this.step(function(){
            helper.db.coll("shake/shake").aggregate(
                        [
                          {$match:{
                              aid:seed._id
                            }
                          },
                          {$group:{
                            _id:'$uid',
                            total:{$sum:1}
                            }
                          }
                        ]
                        ,this.hold(function(err,doc){
                          docs.total = doc.length;
                          for(var i=0;i<doc.length;i++){
                            real_total += doc[i].total;
                          }
                        })
                    )
        })

        this.step(function(){
            docs.reality_chance = Math.round(real_count/real_total*100);
            nut.model.doc = docs
        })



        this.step(function(){

            var dTime = new Date()
            var _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)

            var startTimeStamp = seed.startDate ? new Date(seed.startDate + " 00:00:00").getTime() : new Date(_ym+"-01 00:00:00").getTime();
            var endTimeStamp = seed.stopDate ? new Date(seed.stopDate + " 23:59:59").getTime() : new Date(_ym+"-31 23:59:59").getTime();
            nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
            seed["$userList"] = {startDate:nut.model.startDate,stopDate:nut.model.stopDate,unwind:"shake",_id:nut.model._id};
        })
    }
    , children: {

        userList: "lavico/shake/userList.js"

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

        $("#exportssd").attr("href","/lavico/shake/userList:exports?&unwind=shake&data=%7B%22name%22%3A%22%E5%90%8D%E7%A7%B0%22%2C%22createDate%22%3A%22%E6%94%B6%E8%97%8F%E6%97%B6%E9%97%B4%22%7D")
    }


}







