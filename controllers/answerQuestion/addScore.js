module.exports = {
    layout:null,
    view: null,
    process:function(seed,nut){
            //console.log(seed.json);
            nut.disabled = true;//限制框架的返回
        this.step(
            helper.db.coll("lavico/themeQuestion").insert(eval('('+seed.json+')'),this.hold(function(err, doc) {
                if(err) throw err;
        })));


        this.step(function(){
            res={ret:"成功"};
            this.res.setHeader('Content-Type', 'text/html;charset=utf-8');
            this.res.writeHead(200, { 'Content-Type': 'application/json' });
            this.res.write(res);
            this.res.end();
        });

    },
    actions:{
        update:function(){
            this.step(
              //helper.db.coll("welab/apps").update({_id:helper.db.id(seed._id)} , item,this.hold(function(err,doc){
                helper.db.coll("lavico/themeQuestion").update({_id:helper.db.id(seed._id)}
                    ,eval('('+seed.json+')'),this.hold(function(err, doc) {
                    if(err) throw err;
                })));


            this.step(function(){
                res={ret:"成功"};
                this.res.setHeader('Content-Type', 'text/html;charset=utf-8');
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write(res);
                this.res.end();
            });
        }
    }

}
