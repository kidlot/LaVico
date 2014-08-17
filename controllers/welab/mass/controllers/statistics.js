module.exports = {

    layout: "welab/Layout"
    , view: "welab/apps/mass/templates/statistics.html"

    , process: function(seed,nut)
    {
        helper.db.coll("welab/masslog").find({}).sort({_id:-1}).toArray(this.hold(function(err,docs){
            if(err) throw err ;
            nut.model.masslog = docs
        }))
    }
}

