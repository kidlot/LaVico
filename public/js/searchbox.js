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

        if(data[0] == "followTime"){
            data[1] = data[1];

        }
        if(data[0] == "registerTime"){
            data[1] =  data[1];
        }
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
