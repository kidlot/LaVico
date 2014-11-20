module.exports = {

    layout: "welab/Layout",
    view:  "lavico/templates/updatememberid.html",
    process: function(seed,nut)
    {
        var arr = [];
        this.step(function(){

            arr  = [
                [ 18269828, 15116132 ],
                [ 18284725, 15154610 ],
                [ 18309782, 16548874 ],
                [ 18310693, 16444668 ],
                [ 18310700, 16446417 ],
                [ 18310702, 16447228 ],
                [ 18310950, 16426756 ],
                [ 18310963, 16466583 ],
                [ 18309214, 16426721 ],
                [ 18309218, 16428750 ],
                [ 18311687, 16426653 ],
                [ 18311269, 16535750 ],
                [ 18318239, 16829149 ],
                [ 18318485, 16725555 ],
                [ 18319659, 17333118 ],
                [ 18319727, 16853273 ],
                [ 18319851, 16816817 ],
                [ 18322935, 16802976 ],
                [ 18322133, 16702900 ],
                [ 18320473, 16842162 ],
                [ 18323283, 16845856 ],
                [ 18322418, 17051524 ],
                [ 18322481, 16837478 ],
                [ 18320774, 16703066 ],
                [ 18322701, 17047998 ],
                [ 18321391, 17542754 ],
                [ 18323997, 16744901 ],
                [ 18324063, 17277673 ],
                [ 18324216, 16762826 ],
                [ 18324281, 17978535 ] ]
        })
        var then = this;
        var result = [];
        this.step(function(){
            for(var i=0;i<arr.length;i++){
                (function(i,arr){
                    console.log(" arr[i][1]",typeof  arr[i][1])
                    helper.db.coll("welab/customers").update({$and:[
                           {"HaiLanMemberInfo":{$exists:true}},
                            {"HaiLanMemberInfo.memberID":{$exists:true}},
                            {"HaiLanMemberInfo.memberID":arr[i][1]}
                        ]},
                        {$set: {"HaiLanMemberInfo.memberID":arr[i][0]}},{upsert:false,multi:true},then.hold(function(err,doc){
                            if(err) throw err;
                            console.log("doc",doc)
                            if(doc==0){
                                var list = {};
                                list.oldmemberid = arr[i][1]
                                list.newmemberid = arr[i][0]
                                list.status = "失败";
                                list.count = doc;
                                result.push(list)
                            }else{
                                var list = {};
                                list.oldmemberid = arr[i][1]
                                list.newmemberid = arr[i][0]
                                list.status = "成功";
                                list.count = doc;
                                result.push(list)
                            }
                        }))
                })(i,arr)
            }

        })
        this.step(function(){
            nut.model.result = result;
        })
    }
}