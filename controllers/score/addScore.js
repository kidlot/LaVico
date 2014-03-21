module.exports = {
    //layout: "welab/Layout",
    layout:null,
    view: "lavico/templates/score/themeManager.html",
    process: function (seed, nut) {} ,
    actions:{
        //主题问题表
        save:{
            process:function(seed,nut){
                    console.log(seed.json);
                    nut.disabled = true;//限制框架的返回
                    helper.db.coll("lavico/themeQuestion").insert(eval('('+seed.json+')'),function(err, doc) {

                    });
                    var rsd={ret:"成功"};
                    this.step(function(){
                        this.res.setHeader('Content-Type', 'text/html;charset=utf-8');
                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                        this.res.write(rsd);
                        this.res.end();
                    });

                }
            }
/*
        //积分换物品
        saveGift:{
            process:function(seed,nut){
                nut.disabled=true;
                //db
                //helper.db.coll("lavico/scoreGift").insert(seed.jsonData,function(err, doc) {});
                //var rsd={ret:"成功"};

                this.step(function(){
                    var msg = JSON.stringify(rsd);//字符串转换为json对象
                    this.res.setHeader('Content-Type', 'application/json');
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write(msg.seed);
                    this.res.end();
                })
            }
        }
/*
        //客户换购
        custReceive:{
            process:function(seed,nut){
                /*
                判断传入积分标签是“积分”还是"标签"
                1标签：根据标签和主题编码，返回 “获取标签”“获取积分”“活动ID”
                2积分：根据主题编号和查找积分范围，返回 “获取标签”“获取积分”“活动ID”

            }
        }
*/
    }
}
