module.exports = {
    layout:"welab/Layout",
    //layout:null,
    view: 'lavico/templates/sa.html',
    process:function(seed,nut) {


        var provinceArr = [];
        provinceArr[0] = ['安庆'];
        provinceArr[1] = ['安新'];
        provinceArr[2] = ['鞍山'];
        provinceArr[3] = ['宝清'];
        provinceArr[4] = ['保定'];

        var cityArr = [];
        cityArr[0] = ['安庆','安庆市新百百货店','安徽省安庆市新百百货四楼'];
        cityArr[1] = ['安新','安新县街店','河北省保定市安新县雁翎西路农行对面马克华菲'];
        cityArr[2] = ['鞍山','台安县街店','辽宁省鞍山市台安县繁荣南街马克华菲SHAKE街店'];
        cityArr[3] = ['宝清','宝清县汇丰商厦店','黑龙江省双鸭山市宝清县汇丰商厦二楼 马克华菲'];
        cityArr[4] = ['保定','保定市华创街店','河北省保定市恒祥大街华创国际广场马克华菲专柜'];
        nut.model.provinceArr=provinceArr;
        console.log(cityArr)
        nut.model.cityArr=JSON.stringify(cityArr);


        helper.db.collection("test/users").find().toArray(function(err,docs){
                if(err){
                    throw err;
                }
                nut.model.groups = docs ;
            }
        );
        var Arryprovince = [];
        Arryprovince[0]=['江苏省'];
        Arryprovince[1]=['福建省'];
        Arryprovince[2]=['广东省'];
        Arryprovince[3]=['甘肃省'];
        nut.model.province=Arryprovince;

        helper.db.collection("test/users").aggregate({$group:{_id:"$name",totalPop:{$sum:"$num"}}},this.hold(function(err,users){
            if(err){
                throw err;
            }
            nut.model.totaluser = users;
        }));

        helper.db.coll("test/users").aggregate({$group:{_id:null,totalpop:{$sum:1}}},function(err,users){
            if(err){
                throw err;
            }
            nut.model.count= users;
        })

        helper.db.coll("test/users").find().limit(1).toArray(function(err,doc){
            if(err){
                throw err;
            }
            nut.model.page = doc;
        });

    },
    viewIn:function(){
        var ArryCity = [];
        ArryCity[0]=['江苏省',"南京","苏州","南通","常州"];
        ArryCity[1]=['福建省',"福州","福安","龙岩","南平"];
        ArryCity[2]=['广东省',"广州","潮阳","潮州","澄海"];
        ArryCity[3]=['甘肃省',"兰州","白银","定西","敦煌"];
        $('li a').on('click', function (e) {
            //  $(this).parent().nextAll('ul li').slideToggle()
            // $(this).parent().nextAll('ul li').slideToggle()
            for(var j = 0; j< ArryCity.length; j++){
                if($(this).html()==ArryCity[j][0]){
                    for(var i=1;i<ArryCity[j].length;i++){
                        $(this).append(
                            '<ul style="list-style: none">'+'<li>'+ArryCity[j][i]+'</li>'+'</ul>'
                        )
                    }
                }
            }
        });
    },
}