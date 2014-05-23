$(function () {
    $(".but_2").click(function () {
        var jsonData = "{";
        var beginTime=$("input[name='beginTime']").val();
        var endTime=$("input[name='endTime']").val();
        var isOpen=$("input[name='isOpen']").val();

        jsonData += "isOpen:'"+isOpen+"',endTime:'"+endTime+"',beginTime:'"+beginTime+"',createTime:'"+createTime()+"',theme:\'" + $(".name").val() + "\',";
        jsonData += "description:\'奖项设置\',relief:\'免责声明\',themePicUrl:\'主题图片路径\',themeUrl:\'主题点击链接\',options:[";

        //题目数
        var titleCount=$(".question_num").length;

        //获取题目div
        $val=$(".question_num").parents(".page_2:eq(0)");
        for(var i=0;i<titleCount;i++){
            //$inner=$val.
            //alert($inner.html());
            //获取题目文本
            title=$val.find(".name").val();
            //类型0,1,2
            type=$val.find(".select").val();

            jsonData+="{optionId:"+(i+1)+",title:'"+title+"',type:"+type;

            if(type==0){
                //single
                //单题选项个数
                jsonData+=",choose:[";
                chooseCount=$val.find(".topic_list li").length;
                //单题li
                $li=$val.find(".topic_list li:first-child");

                for(var j=0;j<chooseCount;j++){

                    if($li.find(".groupText_1").val()!="")
                    {
                        jsonData+="{";
                        //选项编号
                        //chooseID
                        chooseID=j+1;//排版编号 第一位代表题号从0开始，第二开始题数
                        //选项名称
                        chooseName=$li.find(".groupText_1").val();
                        //alert(chooseName);
                        //积分
                        chooseScore=$li.find(".groupText_2").val();
                        //下一题
                        chooseNext=$li.find(".groupText_3").val();
                        //图片
                        uploadFile=$li.find(".uploadFile").val();
                        //并接json
                        jsonData+="chooseID:"+chooseID+",chooseName:'"+chooseName+"',chooseScore:'"+chooseScore+"',chooseNext:'"+chooseNext+"',uploadFile:'"+uploadFile+"'}";
                        //,
                        if(j<chooseCount-1){jsonData+=","}
                    }
                    $li=$li.next();

                }
                jsonData+="]}";

            }else if(type==1){
                //mutile
                //多选题个数
                jsonData+=",choose:[";
                chooseCount=$val.find(".more li").length;

                $li=$val.find(".more li:first-child");

                for(var co=0;co<chooseCount;co++){
                    if($li.find(".groupText_1").val()!="") {
                        jsonData+="{";
                        //多项选择题目名称
                        chooseMutileName=$val.find(".more li:eq("+co+")").find(".groupText_1").val();
                        //多项选择题目积分
                        chooseMutileScore=$val.find(".more li:eq("+co+")").find(".groupText_2").val();
                        //多项选择图片
                        chooseMutilePic=$val.find(".more li:eq("+co+")").find("file").val();
                        //下一题编号，多选为空表示
                        chooseNext="";
                        //选项编号
                        chooseID=co+"0";

                        //并接json
                        jsonData+="chooseID:"+chooseID+",chooseName:'"+chooseMutileName+"',chooseScore:'"+chooseMutileScore+"',chooseNext:'"+chooseNext+"',uploadFile:'"+chooseMutilePic+"'}";
                        //,
                        if(co<chooseCount-1){jsonData+=","}
                    }
                    $li=$li.next();

                }
                jsonData+="]}";

            }else if(type==2){
                //description
                //简答积分
                //alert(i);
                //console.log(".single:eq("+i+")");
                singleScore=$val.find("input[name='gegt']").val();

                //singleScore=$val.find(".single:eq("+i+")").find("span:eq(0) input").val();
                //alert(singleScore);
                //alert(singleScore);
                //获取最高分
                //singleMax = $(".single").find("span:eq(1) input").val();
                singleMax = $val.find("input[name='gegtMaxLen']").val();
                //alert(singleMax);
                //获取最低分
                singleMin = $val.find("input[name='gegtMinLen']").val();
                //alert(singleMin);
                //jsonData
                jsonData+=",answerScore:"+singleScore+",answerRange:{minCount:'"+singleMax+"',maxCount:'"+singleMin+"'}}";

            }

            if(i<titleCount-1){jsonData+=",";}

            //下一个统计题目div
            $val=$val.next(".page_2");
        }

        jsonData+="],scoreMinMax:[";

        //奖项设置数量
        count=$(".h100").length;

        $p3=$(".page_3");
        $p100=$(".h100");
        for(var v=0;v<count;v++){
            //jsonData
            jsonData+="{";
            //条件分值（小）
            var conditionSmallScore=$p3.find("div:eq(0)").find("input:eq(0)").val();
            //条件分值（大）
            var conditionBigScore=$p3.find("div:eq(0)").find("input:eq(1)").val();
            //条件标签
            var conditionLabel=$p3.find("div:eq(0)").find("input:eq(2)").val();
            //获得标签
            var getLabel=$p100.next().find("input:eq(0)").val();
            //获得积分
            var getScore=$p100.next().find("input:eq(1)").val();
            //获得活动编号
            var getActivities=$p100.next().find("input:eq(2)").val();

            jsonData+="conditionMinScore:"+conditionSmallScore+",conditionMaxScore:"+conditionBigScore+",conditionLabel:'"+conditionLabel+"',getLabel:'"+getLabel+"',getScore:'"+getScore+"',getActivities:'"+getActivities+"'}";

            if (v < count - 1) {
                jsonData += ','
            }
            $p3=$p3.next();
            $p100=$p100.next();
        }

        jsonData+="]}";


        //document.write(jsonData);
        //ajax
        /*
        $.post("/lavico/score/addScore:save",jsonData,function(msg){
            alert(msg);
        },"json");
        */
        $.ajax({
            type: "POST",
            url: "/lavico/answerQuestion/addScore:save",
            data:{json:jsonData}
        }).done(function(msg){
                alert(msg.ret);
            }
        );
    });
});

/*
 * 图片上传开始
 */

var picShowDisc;
function fileSelected(pic) {
    /*
     document.getElementById('progressNumber').innerHTML = "";
     var file = document.getElementById('pic').files[0];
     if (file) {
     var fileSize = 0;
     if (file.size > 1024 * 1024)
     fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
     else
     fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
     uploadFile(pic);
     }
     */
    uploadFile(pic);
}

function uploadFile(pic) {
    picShowDisc=pic;
    var fd = new FormData();
    fd.append("pic",pic.files[0]);
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open("POST", "/welab/Uploadify?$layout=false&$render=false");
    xhr.send(fd);
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
        document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
}

function uploadComplete(evt) {
    var json = eval('(' + evt.target.responseText + ')');

    //$(".img-polaroid").attr("src",json.model.fileName);
    //$(".picView").css("display","");
    //$(".picView").find("img").attr("src",json.model.fileName);

    //隐藏域

    $(picShowDisc).prev().val(json.model.fileName);
    $(picShowDisc).next().find(".media-object").attr("src",json.model.fileName);



    //alert($(picShowDisc).prev().val());

    setVal( nowLineNum, {pic:json.model.fileName});

    $("#pic").val("")

    $(".rightRow").height( (parseInt($(".settingView").height()) + parseInt($(".settingView").position().top)) +30);
}

function uploadFailed(evt) {
    alert("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
    alert("The upload has been canceled by the user or the browser dropped the connection.");
}
//删除图片
function delPic (then){

    var oLinkOptions = {} ;
    oLinkOptions.data = [];
    //alert($(then).parent().prev().attr("src"));
    oLinkOptions.data.push({name:"pic",value:$(then).parent().prev().attr("src")});
    oLinkOptions.type = "POST";
    oLinkOptions.url = "/welab/Uploadify:delpic";

    $.request(oLinkOptions,function(err,nut){

        if(err) throw err ;

        $(then).parent().parent().prev().val();
        $(then).parent().prev().attr("src","");
        //$(".picView").hide();
        //nut.msgqueue.popup() ;

        //$("#progressNumber").hide();

        //setVal(nowLineNum,{pic:""});


        /*
        if( nowLineNum == 0){
            $(".firstItem").find("img").attr("src", firstPic)
        }else{
            var _opt =  $(".list").children("div").eq(nowLineNum-1);
            _opt.find("img").attr("src", otherPic)
        }
        $("#pic").val("")
    */
    }) ;
}
/*
 *图片上传结束
 */

//创建当前时间
function createTime(){
    var d = new Date();
    var vYear = d.getFullYear();
    var vMon = d.getMonth() + 1;
    var vDay = d.getDate();
    s=vYear+"-"+(vMon<10 ? "0" + vMon : vMon)+"-"+(vDay<10 ? "0"+ vDay : vDay);
    return s;
}