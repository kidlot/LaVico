module.exports = {

    layout: "welab/Layout"
    , view: "welab/apps/mass/templates/index.html"

    , process: function(seed,nut) {
        var then = this

        this.step(function () {

            // 查标签
            helper.db.coll("welab/customers").aggregate([
                {$match: {tags: {$exists: true}}},
                {'$unwind': '$tags' },
                {$group: {
                    _id: "$tags"
                }}
            ], this.hold(function (err, doc) {

                nut.model.tags = doc
            }))


            // reply list
            helper.db.coll("welab/reply").find({isValid: true, $or: [
                {type: "single"},
                {type: "list"},
                {type: "text"}
            ]}).toArray(this.hold(function (err, docs) {
                if (err) throw err;
                nut.model.replyList = docs
            }))

        })
        this.step(function () {

        })

    }

}

