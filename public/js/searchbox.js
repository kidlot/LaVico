$(function(){


    $(document).on('click','.lnk-add-condition',function(event){

        var $condition = $(".searchConditionTemplate")
            .clone()
            .removeClass("searchConditionTemplate")
            .appendTo(".searchConditionOuter") ;

        $condition.find("select[name=searchFieldName]")[0].selectedIndex = 0 ;
        $condition.find("select[name=searchFieldName]").trigger("change") ;

    }) ;

    $(document).on('click','.removeItem',function(event){
        $(event.target).parents(".searchCondition").remove() ;
    }) ;

    var typeMapTemplate = {
        text: ".searchExpressionText"
        , num: ".searchExpressionNum"
        , date: ".searchExpressionDate"
        , value: ".searchExpressionValue"
        , gender: ".searchExpressionGender"
        , messagetype: ".searchExpressionMessageType"
        , replytype: ".searchExpressionReplyType"
        , member: ".searchExpressionMember" //David.xu at 2014-06-24
        , membertype: ".searchExpressionMemberType" //David.xu at 2014-06-24
        , follow: ".searchExpressionFollow" //David.xu at 2014-06-24
        , register: ".searchExpressionRegister" //David.xu at 2014-06-24
        ,birthday:".searchExpressionbirthday"
        ,type:".searchExpressionType"

    }
    $(document).on('change','[name=searchFieldName]',function(event){

        $(event.target).parents(".searchCondition").find(".searchExpression").remove() ;

        $option = $(event.target.options[event.target.selectedIndex]) ;
        var fieldtype = $option.attr("search-field-type") ;
        var tpl = $option.attr("template") || typeMapTemplate[fieldtype] ;
        if(!tpl){
            throw new Error("unknow field template") ;
            return ;
        }

        $expression = $(".searchTemplates").find(tpl).clone() ;
        $(event.target).after($expression) ;

        $expression.find(".datepicker").datetimepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            minView: 2
        })
    }) ;

}) ;

$.searchInitConditions = function(meta){
    $select = $(".searchConditionTemplate [name=searchFieldName]").html('') ;

    for(var i=0;i<meta.length;i++)
    {
        $select.append(_.template(
            "<option value='<%=field%>' search-field-type='<%=type%>'><%=title%></option>"
            , meta[i]
        )) ;
    }
}

$.fn.searchConditions = function(){


    var $conditions = $(this).parents(".searchbox").find(".searchConditionOuter") ;
    var conditions = [] ;

    $conditions.find(".searchCondition").each(function(){
        var value = $(this).find("[name=searchConditionValue]").val() ;

        if(!value)
            return ;
        var data = [ $(this).find("[name=searchFieldName]").val(), value ] ;

        /*2014-07-21添加时间间隔晒选功能*/
        if(data[0] == "followTime" || data[0] == "registerTime"){
            data[1] = data[1];//开始时间
            data[2] = $(this).find("[name=searchConditionValueEnd]").val();//结束时间
            var a = /^\d{4}-\d{1,2}-\d{1,2}$/;
            var _str;
            if(data[0] == "followTime"){
                _str = '关注时间';
            }
            if(data[0] == "registerTime"){
                _str = '注册时间';
            }
            if (a.test(data[1])) {
                var _sTime = new Date(data[1] + " 00:00:00").getTime();//开始时间
                if (data[2]&&a.test(data[2])){
                    var _tTime = new Date(data[2] + " 23:59:59").getTime();//结束时间
                }else{
                    var _tTime = new Date(data[1] + " 23:59:59").getTime();//结束时间
                }
                if(_sTime > _tTime){
                    $.globalMessenger().post({
                        message: _str+"的开始时间必须比结束时间早！",
                        type: 'error',
                        showCloseButton: true})
                    return;
                }
            }
        }
//        if(data[0] == "registerTime"){
//            data[1] =  data[1];//开始时间
//            data[2] = $(this).find("[name=searchConditionValueEnd]").val();//结束时间
//
//        }

        if(data[0] == "HaiLanMemberInfo.type"){
            data[1] = parseInt(data[1]);
        }

        if(data[0] == "isFollow"){
            if(data[1]=='true'){
                data[1] = true;
            }else{
                data[1] = false;
            }
        }

        if(data[0] == "isRegister"){
            if(data[1]=='true'){
                data[1] = true;
            }else{
                data[1] = false;
            }
        }
        console.log(data);


        var operatior = $(this).find("[name=searchConditionOperator]").val() ;
        if(operatior)
            data[2] = operatior ;

        conditions.push(data) ;
    }) ;

    return conditions ;
} ;
