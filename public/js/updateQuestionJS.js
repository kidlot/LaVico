$(function () {
    $("#save").click(function () {
        var jsonData = "{";
        var beginTime=$("input[name='beginTime']").val();
        var endTime=$("input[name='endTime']").val();
        var isOpen=$("select[name='isOpen']").val();
        var theme=$("input[name='title']").val();
        var themeType=$("select[name='themeType']").val();//0答题抢积分 1型男测试 2调查问卷
        var volumename=$("input[name='volumename']").val();
        var url=$("input[name='url']").val();

        var _inputCheck = true;
        if(!beginTime){
            _inputCheck = false;
            $.globalMessenger().post({
                message: "请选择开始时间！",
                type: 'error',
                showCloseButton: true})
        }
        if(!endTime){
            _inputCheck = false;
            $.globalMessenger().post({
                message: "请选择结束时间！",
                type: 'error',
                showCloseButton: true})

        }
        if(!theme){
            _inputCheck = false;
            $.globalMessenger().post({
                message: "请选择主题名称！",
                type: 'error',
                showCloseButton: true})
        }

        if(!volumename && themeType==1){
            _inputCheck = false;
            $.globalMessenger().post({
                message: "请填写劵名称！",
                type: 'error',
                showCloseButton: true})
        }

        if(beginTime>endTime){
            _inputCheck = false;
            $.globalMessenger().post({
                message: "开始时间不能大于结束时间！",
                type: 'error',
                showCloseButton: true})
        }

        if(!_inputCheck){
            return false;
        }

        jsonData +="volumename:'"+volumename+ "',url:'"+url+"',themeType:"+themeType+",isOpen:'"+isOpen+"',endTime:'"+endTime+"',beginTime:'"+beginTime+"',createTime:'"+createTime()+"',theme:\'" + theme + "\',";
        //jsonData += "description:\'奖项设置\',relief:\'免责声明\',themePicUrl:\'主题图片路径\',themeUrl:\'主题点击链接\',options:[";
        //jsonData += "options:[";
        jsonData += "explanation:\'活动说明\',description:\'活动规则\',relief:\'免责声明\',themePicUrl:\'主题图片路径\',themeUrl:\'主题点击链接\',options:[";

        //题目数
        var titleCount= $("div[name=contentSet]").find("div[name=mainContent]").find("div[name=option]").length;

        //获取题目div
        $val=$("div[name=contentSet]").find("div[name=mainContent]").find("div[name=option]").first();
        for(var i=0;i<titleCount;i++){
            //title
            title=$val.find("input[name='txtQuestion']").val();
            type=$val.find("select[name='type']").val();

            jsonData+="{optionId:"+(i+1)+",title:'"+title+"',type:"+type;

            //single
            if($val.find("select[name='type']").val()==0){
                jsonData+=",choose:[";
                //choose
                $li=$val.find("ul[name='chooses'] li").first();
                for(var j=0;j<$val.find("ul[name='chooses'] li").length;j++){
                    if($li.find("input[name='chooseName']").val()!=""){
                        chooseID=j;
                        isCorrect=$li.find("input[name='chkCorrect']").is(':checked');
                        if(isCorrect){
                            isCorrect=1;
                        }else{
                            isCorrect=0;
                        }

                        chooseName=$li.find("input[name='txtChooseContent']").val();
                        chooseScore=$li.find("input[name='txtChooseScore']").val();
                        chooseNext=$li.find("input[name='txtNext']").val();
                        customerLabel=$li.find("input[name='txtLab']").val();//自定义标签
                        stopLabel=$li.find("input[name='txtStop']").val();//停止标签
                        uploadFile=$li.find("input[name='uploadFile']").val();

                        jsonData+="{customerLabel:'"+customerLabel+"',stopLabel:'"+stopLabel+"',chooseID:"+chooseID+",isCorrect:"+isCorrect+",chooseName:'"+chooseName+"',chooseScore:'"+chooseScore+"',chooseNext:'"+
                            chooseNext+"',uploadFile:'"+uploadFile+"'}";

                        if(j<$val.find("ul[name='chooses'] li").length-1){jsonData+=","}
                    }
                    $li=$li.next();
                }
                jsonData+="]}";
            }else if($val.find("select[name='type']").val()==1){
                //mutile
                jsonData+=",choose:[";
                $mutil=$val.find("div[name='mutilWDiv']").find("li.oneChoose").first();
                for(var j=0;j<$val.find("div[name='mutilWDiv']").find("li.oneChoose").length;j++){
                    if($mutil.find("input[name='mutilTitle']").val()!=""){
                        isCorrect=$mutil.find("input[name='chkCorrect']").is(':checked');
                        //console.log("mutil:"+isCorrect);
                        if(isCorrect=="checked"){
                            isCorrect=1;
                        }else{
                            isCorrect=0;
                        }
                        chooseMutileName=$mutil.find("input[name='txtChooseContent']").val();
                        chooseMutileScore=$mutil.find("input[name='txtChooseScore']").val();
                        chooseMutilePic=$mutil.find("input[name='uploadFile']").val();
                        chooseID=j+"0";
                        chooseNext="";
                        //并接json
                        jsonData+="{isCorrect:"+isCorrect+",chooseID:'"+chooseID+"',chooseName:'"+chooseMutileName+"',chooseScore:'"+
                            chooseMutileScore+"',chooseNext:'"+chooseNext+"',uploadFile:'"+chooseMutilePic+"'}";
                        if(j<$val.find("div[name='mutilWDiv']").find("li.oneChoose").length-1){jsonData+=","}
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
            if(i<titleCount-1){jsonData+=",";}
            $val=$val.next();
        }
        jsonData+="],scoreMinMax:[";

        //奖项设置数量
        count=$("div[name=contentSet]").find("div[name=setGift]").find("div[name=setGiftOne]").length;
        $fcount=$("div[name=contentSet]").find("div[name=setGift]");
        for(var v=0;v<count;v++){
            //jsonData
            jsonData+="{";
            //条件分值（小）
            var conditionSmallScore=$fcount.find("input[name='conditionMinScore']:eq("+v+")").val();
            //条件分值（大）
            var conditionBigScore=$fcount.find("input[name='conditionMaxScore']:eq("+v+")").val();
            //条件标签
            var conditionLabel=$fcount.find("input[name='conditionLabel']:eq("+v+")").val();
            //获得标签
            var getLabel=$fcount.find("input[name='getLabel']:eq("+v+")").val();
            //获得标签内容
            var tipContent=$fcount.find("textarea[name='tipContent']:eq("+v+")").val();
            tipContent = tipContent.replace(/[\n\r\t]/,'<br/>');
            //获得积分
            var getScore=$fcount.find("input[name='getScore']:eq("+v+")").val();
            //获得活动编号
            var getActivities=$fcount.find("select[name='getActivities']:eq("+v+")").val();

            jsonData+="conditionMinScore:'"+conditionSmallScore+"',conditionMaxScore:'"+
                conditionBigScore+"',conditionLabel:'"+conditionLabel+"',getLabel:'"+getLabel+"',getScore:'"+
                getScore+"',getActivities:'"+getActivities+"',tipContent:'"+tipContent+"'}";
            if (v < count - 1) {jsonData += ','}
        }
        jsonData+="]}";

        $.ajax({
            type: "post",
            url: "/lavico/answerQuestion/question/updateQuestion:save",
            data:{_id:$("input[name=_id]").val(),json:jsonData}
        }).done(function(msg){
                alert("成功");
                if(themeType==1){
                    $.controller("/lavico/answerQuestion/statistics/statistics_list_1")
                }else{
                    $.controller("/lavico/answerQuestion/statistics/statistics_list")
                }
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
        //document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
        //document.getElementById('progressNumber').innerHTML = 'unable to compute';
    }
}

function uploadComplete(evt) {
    var json = eval('(' + evt.target.responseText + ')');
    //隐藏域
    $(picShowDisc).parent().parent().next().show();
    //$(picShowDisc).parent().parent().find("input[name='uploadFile']").val(json.model.fileName);
    $(picShowDisc).prev().val(json.model.fileName)
    $(picShowDisc).parent().parent().next().find("img[name='picimg']").attr("src",json.model.fileName);
    //setVal( nowLineNum, {pic:json.model.fileName});
    //$("#pic").val("")
    //$(".rightRow").height( (parseInt($(".settingView").height()) + parseInt($(".settingView").position().top)) +30);
}

function uploadFailed(evt) {
    alert("There was an error attempting to upload the file.");
}

function uploadCanceled(evt) {
    alert("The upload has been canceled by the user or the browser dropped the connection.");
}
//删除图片
function delPic (then){
    $(then).parent().parent().parent().hide();
    $(then).parent().parent().parent().prev().find("input[name='uploadFile']").val("")
    var oLinkOptions = {} ;
    oLinkOptions.data = [];

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