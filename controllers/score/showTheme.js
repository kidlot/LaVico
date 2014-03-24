module.exports={
    layout:null,
    view:"lavico/templates/score/showTheme.html",
    process:function(seed,nut){
        var id=seed._id;//题组编号
        var optionId=seed.optionID;//用户正在做的第N题
        var chooseNext=seed.chooseNext;

        /*chooseNext
         *无值：默认下一题
         *有值数字：指定跳转规定题号
         *有值标签：跳转完成页面
         */

        if(chooseNext!=""){
            if(!isNaN(chooseNext)){
                //number
                helper.db.coll("lavico/themeQuestion").findOne({"_id":helper.db.id(id)},this.hold(function(err,cursor){
                    if(err) throw err;

                    nut.model.beginTime=cursor.beginTime;
                    nut.model.endTime=cursor.endTime;
                    nut.model.isOpen=cursor.isOpen;

                    var options= cursor.options;//题总数
                    //var currentOptionID=1;//当前第N题
                    //根据第N题超找此option
                    for(var i=0;i<options.length;i++){
                        nut.model.optionCount=options.length;
                        if(options[i].optionId==chooseNext){



                            //console.log(JSON.stringify(options[i]));
                            nut.model.options=JSON.stringify(options[i]);
                            nut.model.themeID=id;
                        }
                    }
                }));
            }else{
                //lab:redirect finish page
                //nut.disabled=true;//屏蔽框架html的返回,避免模板中标签的误识别
                this.res.writeHead(302, {
                    'Location': "/lavico/score/finish?scoreAll="+seed.scoreAll+"&_id="+id+"&chooseNext="+(parseInt(optionId)+1)
                });
                this.res.end();
            }
        }else{
            console.log("333");
            //null:default next options
            nut.disabled=true;

            this.res.writeHead(302, {
                'Location': "/lavico/score/showTheme?scoreAll="+seed.scoreAll+"&_id="+id+"&optionID="+(1+parseInt(optionId))+"&chooseNext="+(parseInt(optionId)+1)
            });
            this.res.end();
        }
    }
}

function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}