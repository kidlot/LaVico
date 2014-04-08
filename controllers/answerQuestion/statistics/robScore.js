
module.exports={
    layout:"welab/Layout",
    view:"lavico/templates/answerQuestion/statistics/robScore.html",
    process:function(seed,nut){
    },
    actions:{
        search:{
            layout:"welab/Layout",
            view:"lavico/templates/answerQuestion/statistics/robScoreShow.html",
            process:function(seed,nut){
                var then=this;
                var beginTime=seed.beginTime;
                var endTime=seed.endTime;
                var docGlobal,themeId;
                var page;
                var countPlay=0;
                var cityName=new Array(),cityNum=new Array();


                if(beginTime=="" || endTime=="" || seed.txtTheme==""){
                    //nut.write("<script>alert('请填写完整');history.back(-1)</script>");
                    //nut.model.showJson="";
                }else{

                    var wechatIdArr=new Array();
                    var wechatTime=new Array();

                    var showJson="[";

                    this.step(function(){
                        helper.db.coll("lavico/themeQuestion").findOne({theme:seed.txtTheme},this.hold(function(err,doc){
                            if(err) throw err;
                            if(doc) docGlobal=doc;
                        }));
                    });
                    this.step(function(){
                        if(docGlobal){
                            nut.model.theme=docGlobal.theme;
                            nut.model.themeType=docGlobal.themeType;

                            nut.model.searchBeginTime=seed.beginTime;
                            nut.model.searchEndTime=seed.endTime;
                            themeId=docGlobal._id;
                        }

                    });

                    this.step(function(){
                        helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(themeId),"isFinish":false,"optionId":1}).toArray(this.hold(function(err,doc){
                            if(err)throw err;
                            for(var i=0;i<doc.length;i++){

                                var time=doc[i].createTime;
                                if(new Date(time).getTime()< new Date(endTime).getTime() && new Date(time).getTime()>new Date(beginTime).getTime()){
                                    //搜索范围之内
                                    wechatIdArr.push(doc[i].wechatid);
                                    wechatTime.push(doc[i].createTime);
                                    countPlay++;
                                }
                            }
                            nut.model.goCount=countPlay;//参与人数

                        }));

                        helper.db.coll("lavico/custReceive").find({"themeId":helper.db.id(themeId),"isFinish":true,"optionId":0,"getLabel":"","getGift":"","compScore":""}).toArray(
                            this.hold(function(err,doc){
                            if(err)throw err;
                            var finishCountT=0;
                            for(var i=0;i<doc.length;i++){
                                var time=doc[i].createTime;
                                if(new Date(time).getTime()< new Date(endTime).getTime() && new Date(time).getTime()>new Date(beginTime).getTime()){
                                    finishCountT++;
                                }
                            }
                                nut.model.finishCount=finishCountT;//完成人数
                        }));
                    });

                    this.step(function(){
                        for(var i=0;i<wechatIdArr.length;i++){
                            (function(i){
                                helper.db.coll("welab/customers").findOne({"wechatid":wechatIdArr[i]},then.hold(function(err,doc){

                                    //统计区域范围开始
                                    var falg=true;
                                    var s=-1;
                                    for(var j=0;j<cityName.length;j++){
                                        if(cityName[j]==doc.city){
                                            falg=false;
                                            s=j;
                                        }
                                    }
                                    if(falg){
                                        cityName.push(doc.city);
                                        cityNum.push(1);
                                    }else{
                                        cityName[s]++;
                                    }

                                    showJson+="{mobile:"+doc.mobile+","
                                        +"realname:'"+doc.realname+"',"
                                        +"time:'"+wechatTime[i]+"',"
                                        +"codeId:'"+"xxxxxx"+"',"
                                        +"gender:'"+doc.gender+"',"
                                        +"age:"+calBirthday(doc.birthday)
                                        +"}";
                                    if(i<wechatIdArr.length-1){showJson+=","}
                                }));
                            })(i);
                        }
                    });

                    this.step(function(){
                        showJson+="]";
                        nut.model.jsonO=eval('('+showJson+')');

                        //总条数
                        var totalcount=countPlay;
                        var currentPage=1;
                        var docs=eval('('+showJson+')');
                        var lastPage=(countPlay-1)/countPlay+1;
                        var i_page={lastPage:lastPage,currentPage:currentPage,totalcount:totalcount,docs:docs};
                        nut.model.page=i_page;

                        //图表1:完成人数/参与人数
                        nut.model.myChart_Data1 = JSON.stringify({d1:nut.model.finishCount, d2:nut.model.goCount});
                        //图表2：区域比列
                        var se="{";
                        if(cityNum.length>5){
                        for(var i=1;i<=5;j++){
                            se+="d"+i+":"+cityNum[i-1];
                            if(i<5)se+=",";
                        }}else{
                            for(var i=1;i<=cityNum.length;i++){
                                se+="d"+i+":"+cityNum[i-1];
                                if(i<cityNum.length)se+=",";
                            }
                        }
                        se+="}";

                        nut.model.myChart_Data2=JSON.stringify(se);

                    });

                }
            }
        }
    },
    viewIn:function(){
        var _data = JSON.parse( $("#myChart_Data1").text())
        var data = [
            {
                value: _data.d1 == 0 && _data.d2 == 0 ? 1 : _data.d1,
                color:"#3498db",
                label : '完成人数'
            },
            {
                value: _data.d1 == 0 && _data.d2 == 0 ? 1 : _data.d2,
                color : "#b1d4e5",
                label : '参与人数'
            }
        ]
        var ctx = $("#myChart1").get(0).getContext("2d");
        new Chart(ctx).Pie(data,{});

        //测试内容
        _data = JSON.parse( $("#myChart_Data1").text())
        data = [
            {
                value: _data.d1 == 0 && _data.d2 == 0 ? 1 : _data.d1,
                color:"#3498db",
                label : '完成人数'
            },
            {
                value: _data.d1 == 0 && _data.d2 == 0 ? 1 : _data.d2,
                color : "#b1d4e5",
                label : '参与人数'
            }
        ]
        var ctx = $("#myChart1").get(0).getContext("2d");
        new Chart(ctx).Pie(data,{});
    }
}

function calBirthday(custBirthday){
    var bornYear= new Date(parseInt(custBirthday)).getFullYear();
    var toDayYear=new Date().getFullYear();
    return toDayYear-bornYear;
}
