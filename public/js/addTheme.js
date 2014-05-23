$(function () {
    $("#save").click(function () {

        var jsonData = "{";
        var beginTime=$("input[name='beginTime']").val();
        var endTime=$("input[name='endTime']").val();
        var isOpen=$("select[name='isOpen']").val();
        var theme=$("input[name='title']").val();

        jsonData += "isOpen:'"+isOpen+"',endTime:'"+endTime+"',beginTime:'"+beginTime+"',createTime:'"+createTime()+"',theme:\'" + theme + "\',";
        jsonData += "description:\'奖项设置\',relief:\'免责声明\',themePicUrl:\'主题图片路径\',themeUrl:\'主题点击链接\',options:[";

        //题目数
        var titleCount=$(".question_num").length;

        //获取题目div
        var $titleVal=$("div[name='optionSet']");
        var $arr=$("div[name='oneOption']:visible");
        $val=$titleVal.find("div[name='oneOption']:visible").first();


        for(var i=0;i<$arr.length;i++){
            //title
            title=$val.find("input[name='title']").val();
            type=$val.find("select[name='type']").val();

            jsonData+="{optionId:"+(i+1)+",title:'"+title+"',type:"+type;

            //sinple
            if($val.find("select[name='type']").val()==0){
                jsonData+=",choose:[";
                //choose
                $li=$val.find("ul[name='choose'] li").first();
                for(var j=0;j<$val.find("ul[name='choose'] li").length;j++){
                    if($li.find("input[name='chooseName']").val()!=""){
                        //isCorrect  name='chooseID'
                        chooseID=$li.find("input[name='chooseID']").val();
                        isCorrect=$li.find("input[name='correct']").is(':checked');
                        //alert(isCorrect);
                        if(isCorrect){
                            isCorrect=1;
                        }else{
                            isCorrect=0;
                        }
                        chooseName=$li.find("input[name='chooseName']").val();
                        chooseScore=$li.find("input[name='chooseScore']").val();
                        chooseNext=$li.find("input[name='chooseNext']").val();
                        uploadFile=$li.find("input[name='uploadFile']").val();

                        jsonData+="{chooseID:"+chooseID+",isCorrect:"+isCorrect+",chooseName:'"+chooseName+"',chooseScore:'"+chooseScore+"',chooseNext:'"+
                            chooseNext+"',uploadFile:'"+uploadFile+"'}";

                        if(j<$val.find("ul[name='choose'] li").length-1){jsonData+=","}
                     }
                    $li=$li.next();
                }
                jsonData+="]}";

            }else if($val.find("select[name='type']").val()==1){
                jsonData+=",choose:[";
                $mutil=$val.find("div[name='mutilDiv']").find("div[name='mutilOne']").first();
                for(var j=0;j<$val.find("div[name='mutilOne']").length;j++){

                    if($mutil.find("input[name='mutilTitle']").val()!=""){
                        isCorrect=$li.find("input[name='correct']").is(':checked');
                        console.log("mutil:"+isCorrect);
                        if(isCorrect=="checked"){
                            isCorrect=1;
                        }else{
                            isCorrect=0;
                        }
                        chooseMutileName=$mutil.find("input[name='mutilTitle']").val();
                        chooseMutileScore=$mutil.find("input[name='mutilScore']").val();
                        chooseMutilePic=$mutil.find("input[name='uploadFile']").val();
                        chooseID=j+"0";
                        chooseNext="";
                        //并接json
                        jsonData+="{isCorrect:"+isCorrect+",chooseID:"+chooseID+",chooseName:'"+chooseMutileName+"',chooseScore:'"+
                            chooseMutileScore+"',chooseNext:'"+chooseNext+"',uploadFile:'"+chooseMutilePic+"'}";
                        if(j<$val.find("div[name='mutilOne']").length-1){jsonData+=","}
                    }

                    $mutil=$mutil.next();
                }
                jsonData+="]}";

            }else if($val.find("select[name='type']").val()==2){

                singleScore=$val.find("div[name=simpleAnswer]").find("input[name=simpleScore]").val()
                singleMax=$val.find("div[name=simpleAnswer]").find("input[name=simpleMinLen]").val()
                singleMin=$val.find("div[name=simpleAnswer]").find("input[name=simpleMaxLen]").val()

                jsonData+=",answerScore:"+singleScore+",answerRange:{minCount:'"+singleMax+"',maxCount:'"+singleMin+"'}}";

            }
            if(i<$arr.length-1){jsonData+=",";}
            $val=$val.next();
        }
        jsonData+="],scoreMinMax:[";
        //奖项设置数量
        count=$("div[name='scoreMinMaxOne']:visible").length;
        $fcount=$("div[name='scoreMinMaxOne']:visible").first();
        for(var v=0;v<count;v++){
            //jsonData
            jsonData+="{";
            //条件分值（小）
            var conditionSmallScore=$fcount.find("input[name='conditionMinScore']").val();

            //条件分值（大）
            var conditionMaxScore=$fcount.find("input[name='conditionMaxScore']").val();
            //条件标签
            var conditionLabel=$fcount.find("input[name='conditionLabel']").val();
            //获得标签
            var getLabel=$fcount.find("input[name='getLabel']").val();
            //获得积分
            var getScore=$fcount.find("input[name='getScore']").val();
            //获得活动编号
            var getActivities=$fcount.find("input[name='getActivities']").val();

            jsonData+="conditionMinScore:"+conditionSmallScore+",conditionMaxScore:"+
                conditionMaxScore+",conditionLabel:'"+conditionLabel+"',getLabel:'"+getLabel+"',getScore:'"+
                getScore+"',getActivities:'"+getActivities+"'}";
            if (v < count - 1) {jsonData += ','}
            $fcount.next();
        }
        jsonData+="]}";

        //document.write(jsonData);

        $.ajax({
            type: "POST",
            url: "/lavico/answerQuestion/addScore:update",
            data:{'json':jsonData,'_id':_id}
        }).done(function(msg){
                alert("成功");
            });


    });
});

/*
 * 图片上传开始
 */
function fileSelected(pic) {
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
    //隐藏域

    $(picShowDisc).parent().parent().find("input[name='uploadFile']").val(json.model.fileName);
    $(picShowDisc).parent().parent().find("img[name='picimg']").attr("src",json.model.fileName);

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

    })
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