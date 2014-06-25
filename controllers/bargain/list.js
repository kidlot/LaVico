module.exports = {
    layout: "lavico/layout",
    view: "lavico/templates/bargain/list.html",
    process: function(seed,nut){

        var then = this;
        nut.model.wxid = seed.wxid;

        this.step(function(){
            helper.db.coll("lavico/bargain").find({switcher:"on",startDate:{$lt:new Date().getTime()},stopDate:{$gt:new Date().getTime()}}).sort({createTime:-1}).toArray(this.hold(function(err,docs){
                nut.model.list = docs||[];
            }));
        })

    }
}







