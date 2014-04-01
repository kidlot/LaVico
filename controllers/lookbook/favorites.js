module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/lookbook/favorites.html"

    , process: function(seed,nut)
    {
    }
    , actions: {

        save:{
            process: function(seed,nut)
            {
                helper.db.coll("lavico/favorites").insert({productId:seed.pid,wxid:seed.wxid,createDate:new Date().getTime()},this.hold(function(err,_doc){

                    nut.disable();
                    var data = JSON.stringify(_doc);
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(data);
                    this.res.end();
                }))
            }
        }
    }
}







