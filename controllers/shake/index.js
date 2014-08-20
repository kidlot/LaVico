/**
 * 摇一摇管理首页
 *
 * */

var middleware = require('../../lib/middleware.js');
module.exports = {
    layout: "welab/Layout",
    view: "lavico/templates/shake/index.html",
    process: function (seed, nut) {

        var perPage = 10;
        var pageNum = seed.page ? seed.page : 1;
        var then = this;

        var list = {};
        helper.db.coll("lavico/shake").find({}).sort({createTime: -1}).page(perPage, pageNum, then.hold(function (err, page) {
            list = page
            for (var i = 0; i < page.docs.length; i++) {
                if (new Date().getTime() < list.docs[i].startDate) {
                    list.docs[i].status = "未开始"
                } else if (new Date().getTime() > list.docs[i].endDate) {
                    list.docs[i].status = "已结束"
                } else {
                    list.docs[i].status = "进行中"
                }
                list.docs[i].count = 0;
            }
        }));


        this.step(function () {
            for (var i = 0; i < list.docs.length; i++) {
                (function (i) {
                    helper.db.coll("welab/customers").find({"shake.aid": list.docs[i]._id.toString()}).toArray(then.hold(function (err, _doc2) {
                        list.docs[i].count = _doc2.length;//获得人数,也就是中奖人数

                    }))




                    helper.db.coll("lavico/shake/logs").aggregate(
                        [
                            {$match: {
                                aid: list.docs[i]._id.toString()
                            }
                            },
                            {$group: {
                                _id: '$uid',
                                total: {$sum: 1}
                            }
                            }
                        ]
                        , then.hold(function (err, doc) {
                            list.docs[i].total = doc.length;//参与人数，也就是所有参加活动的人数
                        })
                    )


                })(i);
            }
        })

        this.step(function () {
            if (list && list.docs) {
                for (var i = 0; i < list.docs.length; i++) {
                    (function (i) {
                        middleware.request('Coupon/Promotions', {
                            perPage: perPage,
                            pageNum: 1,
                            code: list.docs[i].aid
                        }, then.hold(function (err, doc) {
                            console.log(doc);
                            doc = doc.replace(/[\n\r\t]/, '');
                            var doc_json = eval('(' + doc + ')');
                            for (var o in doc_json.list[0]) {
                                list.docs[i][o] = doc_json.list[0][o];
                            }
                        }))
                    })(i);
                }
            }
        })
        this.step(function () {
            nut.model.list = list;
        });

    },
    actions: {

        add: {
            layout: "welab/Layout",
            view: "lavico/templates/shake/add.html",
            process: function (seed, nut) {
                var perPage = 1000;
                var pageNum = seed.page ? seed.page : 1;
                var then = this;
                nut.model.host = this.req.headers.host;

                this.step(function (doc) {
                    middleware.request('Coupon/Promotions', {
                        perPage: perPage,
                        pageNum: pageNum
                    }, this.hold(function (err, doc) {
                        doc = doc.replace(/[\n\r\t]/, '');
                        var doc_json = eval('(' + doc + ')');

                        var page = {};
                        page.lastPage = Math.ceil(doc_json.total / perPage);
                        page.currentPage = pageNum;
                        page.totalcount = doc_json.total;
                        nut.model.page = page;

                        //console.log(doc_json);

                        if (doc_json && doc_json.list) {
                            return doc_json.list;
                        } else {
                            return {};
                        }
                    }))
                });
                var list;
                this.step(function (doc) {
                    var count = 0;
                    for (var i = 0; i < doc.length; i++) {
                        (function (i) {
                            helper.db.coll("lavico/activity").findOne({aid: doc[i].PROMOTION_CODE}, then.hold(function (err, detail) {
                                count++;

                                if (detail) {
                                    doc[i].pic = detail.pic;

                                }
                                if (count == doc.length) {
                                    list = doc
                                    return doc;
                                    then.terminate();
                                }
                            }));
                        })(i);
                    }
                });

                this.step(function () {
                    if (seed._id) {
                        helper.db.coll("lavico/shake").findOne({_id: helper.db.id(seed._id)}, then.hold(function (err, shake) {

                            if (shake) {
                                return shake;
                            }
                        }));
                    }
                })

                this.step(function (shake) {
                    shake = shake ? shake : {};
                    doc = JSON.stringify(list);

                    nut.model.list = list;
                    nut.model.shake = shake;
                    nut.model.doc = doc;

                });
            },
            viewIn: function () {
                $('#startDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })

                $('#endDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })

                if ($("#aid").val()) {
                    aid = $("#aid").val();
                    $("#activity_select  option").each(function () {
                        if ($(this).val() == aid) {
                            $(this).attr("selected", "true");
                        }
                        $(".promotion_detail").css('display', 'none');
                        $("#" + aid).css('display', 'block');
                        $("#" + aid + " .lottery_chance").val($('#lottery_chance').val());
                    });
                }

                //添加
                $('#add-coupons').click(function(){
                    console.log($('#activity_select').val());
                    var _PROMOTION_CODE = $('#activity_select').val();//_PROMOTION_CODE
                    $("#" + _PROMOTION_CODE).css('display','block').find('.panel-body').css("background-color", "#eeeeee");
                    $("#" + _PROMOTION_CODE).find('.display_name').focus();
                    var _PROMOTION_NAME = $("#" + _PROMOTION_CODE).find('.PROMOTION_NAME').attr('data');
                    //PROMOTION_NAME

                    $.globalMessenger().post({
                        message: "添加"+_PROMOTION_NAME+"优惠券成功",
                        type: 'error',
                        showCloseButton: true});
                });

                //删除
                $('#del-coupons').click(function(){
                    console.log($('#activity_select').val());
                    var _PROMOTION_CODE = $('#activity_select').val();//_PROMOTION_CODE
                    var _PROMOTION_NAME = $("#" + _PROMOTION_CODE).find('.PROMOTION_NAME').attr('data');

                    $("#" + _PROMOTION_CODE).css('display', 'none');
                    $.globalMessenger().post({
                        message: "删除"+_PROMOTION_NAME+"优惠券成功",
                        type: 'error',
                        showCloseButton: true});
                });

                //编辑器
                var editor = CKEDITOR.replace( 'mainContent', {
                    toolbar: [
                        [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
                    ]
                });
                editor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
                editor.config.enterMode = CKEDITOR.ENTER_BR;
                editor.config.language = 'zh-cn';
                editor.config.width = 600;
                editor.config.height = 400;
                editor.config.allowedContent = true;//防止过滤标签的css-style属性

                //保存按钮
                window.save = function (){

                    var aFormInput = {}

                    var _inputCheck = true;

                    /*日期判断*/
                    var _startDate = $('#startDate').val();
                    var startDate = new Date();
                    var startDateTimeStamp;
                    startDate.setFullYear(_startDate.substring(0,4));
                    startDate.setMonth((parseInt(_startDate.substr(5,2))-1));
                    startDate.setDate((parseInt(_startDate.substr(8,2))));
                    startDate.setHours(0,0,0);
                    startDateTimeStamp = Date.parse(startDate);//毫秒级

                    var _endDate =$('#endDate').val();
                    var endDate = new Date();
                    var endDateTimeStamp;
                    endDate.setFullYear(_endDate.substring(0,4));
                    endDate.setMonth((parseInt(_endDate.substr(5,2))-1));
                    endDate.setDate((parseInt(_endDate.substr(8,2))));
                    endDate.setHours(0,0,0);
                    endDateTimeStamp = Date.parse(endDate);//毫秒级


                    var aid = $('#aid').val();
                    if(startDateTimeStamp > endDateTimeStamp){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "开始时间必须比结束时间早！",
                            type: 'error',
                            showCloseButton: true})
                    }



                    if(!$("#startDate").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择开始时间！",
                            type: 'error',
                            showCloseButton: true})

                    }
                    if(!$("#endDate").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择结束时间！",
                            type: 'error',
                            showCloseButton: true})

                    }

                    if(!$("#name").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请填写名称！",
                            type: 'error',
                            showCloseButton: true})
                    }


                    if(!$('#lottery_cycle').val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择抽奖频率！",
                            type: 'error',
                            showCloseButton: true})
                    }
                    if(!$('#lottery_count').val()){

                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请填写抽奖次数！",
                            type: 'error',
                            showCloseButton: true})
                    }

                    var reg = /^\d+$/;//数字正则

                    if(!$.isNumeric($('#lottery_count').val())){

                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "抽奖频率的值必须是数字！",
                            type: 'error',
                            showCloseButton: true});
                    }else{

                        if(parseInt($('#lottery_count').val()) < 0){
                            _inputCheck = false;
                            $.globalMessenger().post({
                                message: "抽奖频率的值不能是负数！",
                                type: 'error',
                                showCloseButton: true});
                        }else{
                            if(parseInt($('#lottery_count').val()) != $('#lottery_count').val()){

                                _inputCheck = false;
                                $.globalMessenger().post({
                                    message: "抽奖频率的值必须是整数！",
                                    type: 'error',
                                    showCloseButton: true});

                            }
                        }
                    }

                    if(!$.isNumeric($('#points').val())){

                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "积分消耗的值必须是数字！",
                            type: 'error',
                            showCloseButton: true});
                    }else{

                        if(parseInt($('#points').val()) < 0){
                            _inputCheck = false;
                            $.globalMessenger().post({
                                message: "积分消耗的值必须是零或者正整数！",
                                type: 'error',
                                showCloseButton: true});
                        }else{
                            if(parseInt($('#points').val()) != $('#points').val()){

                                _inputCheck = false;
                                $.globalMessenger().post({
                                    message: "积分消耗的值必须是整数！",
                                    type: 'error',
                                    showCloseButton: true});

                            }
                        }
                    }


                    if(!_inputCheck){
                        return false;
                    }

                    aFormInput['lottery'] = new Array();
                    var _lottery_sum = 0;//所有的优惠券总概率必须小于等于100
                    $(".promotion_detail").each(function(i,object){
                        console.log($(object).is(':visible'));
                        if($(object).is(':visible')){

                            var _PROMOTION_NAME = $(object).find('.PROMOTION_NAME').attr('data');

                            if(!$(object).find('.display_name').val()){
                                _inputCheck = false;
                                $.globalMessenger().post({
                                    message: _PROMOTION_NAME + "的券名称不能为空！",
                                    type: 'error',
                                    showCloseButton: true})
                                $(object).find('.display_name').focus().css('background-color','#1abc9c');

                            }else{

                                if(!$(object).find('.lottery_chance').val()){
                                    _inputCheck = false;
                                    $.globalMessenger().post({
                                        message: _PROMOTION_NAME + "的抽奖概率不能为空！",
                                        type: 'error',
                                        showCloseButton: true})
                                    $(object).find('.lottery_chance').focus().css('background-color','#1abc9c');

                                }else{

                                    var _lottery_chance = parseInt($(object).find('.lottery_chance').val());//抽奖概率
                                    _lottery_sum = _lottery_sum + _lottery_chance;

                                    if(_lottery_chance >100 || _lottery_chance <0){
                                        _inputCheck = false;
                                        $.globalMessenger().post({
                                            message: _PROMOTION_NAME + "的抽奖概率必须大于等于0，小于等于100！",
                                            type: 'error',
                                            showCloseButton: true})
                                        $(object).find('.lottery_chance').focus().css('background-color','#1abc9c');
                                    }

                                    var _lottery = {};
                                    _lottery.PROMOTION_CODE = $(object).find('.PROMOTION_CODE').attr('data');
                                    _lottery.PROMOTION_NAME = $(object).find('.PROMOTION_NAME').attr('data');
                                    _lottery.PROMOTION_DESC = $(object).find('.PROMOTION_DESC').attr('data');
                                    _lottery.PROMOTION_TYPE = $(object).find('.PROMOTION_TYPE').attr('data');
                                    _lottery.PROMOTION_QTY = $(object).find('.PROMOTION_QTY').attr('data') || null;
                                    _lottery.PROMOTION_PIC = $(object).find('.PROMOTION_PIC').attr('data') || null;
                                    _lottery.PROMOTION_USED_TOTAL = $(object).find('.PROMOTION_USED_TOTAL').attr('data');
                                    _lottery.display_name = $(object).find('.display_name').val();
                                    _lottery.lottery_chance = $(object).find('.lottery_chance').val();
                                    aFormInput['lottery'].push(_lottery);
                                }
                            }
                        }
                    })

                    if(_lottery_sum < 0 || _lottery_sum > 100){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "所有的优惠券的总概率必须小于等于100！",
                            type: 'error',
                            showCloseButton: true});
                    }

                    var content = editor.document.getBody().getHtml();//编辑器内容
                    aFormInput['startDate'] = new Date($("#startDate").val()).getTime();
                    aFormInput['endDate'] = new Date($("#endDate").val()).getTime();
                    aFormInput['name'] = $("#name").val();
                    aFormInput['lottery_cycle'] = $("#lottery_cycle").val();
                    aFormInput['lottery_count'] = $("#lottery_count").val();
                    aFormInput['switcher'] = 'on';
                    aFormInput['parm'] = $('input[name="parm"]:checked').val();
                    //aFormInput['thumb'] = $('#thumb_upload').attr('src');//活动小图
                    aFormInput['pic'] = $('#pic_upload').attr('src');//活动大图
                    aFormInput['createTime'] = new Date().getTime();
                    aFormInput['points'] = parseInt($("#points").val()) || 0;//每次游戏，所消耗的积分
                    aFormInput['content'] = encodeURIComponent(content);
                    aFormInput['display_name'] = $("#display_name").val();//券名称
                    console.log(aFormInput)

                    if(_inputCheck){
                        var oLinkOptions = {} ;
                        oLinkOptions.data = [{name:'postData',value:JSON.stringify(aFormInput)},{name:'_id',value:$("#_id").val()}];
                        oLinkOptions.type = "POST";
                        oLinkOptions.url = "/lavico/shake/index:save";

                        $.request(oLinkOptions,function(err,nut){
                            if(err) throw err ;
                            nut.msgqueue.popup();
                            $.controller("/lavico/shake",null,"lazy");
                        }) ;
                    }
                }
            }
        },
        modify_html: {
            layout: "welab/Layout",
            view: "lavico/templates/shake/modify.html",
            process: function (seed, nut) {
                var perPage = 1000;
                var pageNum = seed.page ? seed.page : 1;
                var then = this;
                nut.model.host = this.req.headers.host;

                this.step(function (doc) {
                    middleware.request('Coupon/Promotions', {
                        perPage: perPage,
                        pageNum: pageNum
                    }, this.hold(function (err, doc) {
                        doc = doc.replace(/[\n\r\t]/, '');
                        var doc_json = eval('(' + doc + ')');

                        var page = {};
                        page.lastPage = Math.ceil(doc_json.total / perPage);
                        page.currentPage = pageNum;
                        page.totalcount = doc_json.total;
                        nut.model.page = page;

                        //console.log(doc_json);

                        if (doc_json && doc_json.list) {
                            return doc_json.list;
                        } else {
                            return {};
                        }
                    }))
                });
                var list;
                this.step(function (doc) {
                    var count = 0;
                    for (var i = 0; i < doc.length; i++) {
                        (function (i) {
                            helper.db.coll("lavico/activity").findOne({aid: doc[i].PROMOTION_CODE}, then.hold(function (err, detail) {
                                count++;

                                if (detail) {
                                      doc[i].pic = detail.pic;

                                }
                                if (count == doc.length) {
                                    list = doc
                                    return doc;
                                    then.terminate();
                                }
                            }));
                        })(i);
                    }
                });

                this.step(function () {
                    if (seed._id) {
                        helper.db.coll("lavico/shake").findOne({_id: helper.db.id(seed._id)}, then.hold(function (err, shake) {

                            if (shake) {
                                return shake;
                            }
                        }));
                    }
                })


                this.step(function (shake) {
                    shake.lottery_cycle = parseInt(shake.lottery_cycle);
                    shake = shake ? shake : {};
                    doc = JSON.stringify(list);

                    nut.model.list = list;
                    nut.model.shake = shake;
                    nut.model.doc = doc;
                    nut.model.lottery = JSON.stringify(shake.lottery);

                });
            },
            viewIn: function () {

                var url;//当前活动的地址;

                $('#startDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })

                $('#endDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    autoclose: true,
                    minView: 2
                })

                if ($("#aid").val()) {
                    aid = $("#aid").val();
                    $("#activity_select  option").each(function () {
                        if ($(this).val() == aid) {
                            $(this).attr("selected", "true");
                        }
                        $(".promotion_detail").css('display', 'none');
                        $("#" + aid).css('display', 'block');
                        $("#" + aid + " .lottery_chance").val($('#lottery_chance').val());
                    });
                }
                //URL修改
                var point;
                $('input[name="parm"]').change(function (){
                    var _parm  = $('input[name="parm"]:checked').val();
                    var host = window.location.host;
                    var shake_id = $("#_id").val();
                    var shake;
                    if(_parm=='02'||_parm=='03'){
                        point = $('#points').val();
                        $('#points').val(0).attr("readonly","readonly");
                        shake = 'shake'+_parm;
                    }else{
                        if(point){
                            $('#points').val(point).removeAttr("readonly");
                        }else{
                            $('#points').removeAttr("readonly");
                        }
                        shake = 'shake';
                    }
                    url = "http://"+host+"/lavico/activity/"+shake+"?uid={wxid}&aid="+shake_id;
                    $('#host-url').val(url);
                });
                //添加
                $('#add-coupons').click(function(){
                    console.log($('#activity_select').val());
                    var _PROMOTION_CODE = $('#activity_select').val();//_PROMOTION_CODE
                    $("#" + _PROMOTION_CODE).css('display','block').find('.panel-body').css("background-color", "#eeeeee");
                    $("#" + _PROMOTION_CODE).find('.display_name').focus();
                    var _PROMOTION_NAME = $("#" + _PROMOTION_CODE).find('.PROMOTION_NAME').attr('data');
                    //PROMOTION_NAME

                    $.globalMessenger().post({
                        message: "添加"+_PROMOTION_NAME+"优惠券成功",
                        type: 'error',
                        showCloseButton: true});
                });

                //删除
                $('#del-coupons').click(function(){
                    console.log($('#activity_select').val());
                    var _PROMOTION_CODE = $('#activity_select').val();//_PROMOTION_CODE
                    var _PROMOTION_NAME = $("#" + _PROMOTION_CODE).find('.PROMOTION_NAME').attr('data');

                    $("#" + _PROMOTION_CODE).css('display', 'none');
                    $.globalMessenger().post({
                        message: "删除"+_PROMOTION_NAME+"优惠券成功",
                        type: 'error',
                        showCloseButton: true});
                });

                //编辑器
                var editor = CKEDITOR.replace( 'mainContent', {
                    toolbar: [
                        [ 'Source','Image','Bold', 'Italic', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink']
                    ]
                });
                editor.config.shiftEnterMode = CKEDITOR.ENTER_BR;
                editor.config.enterMode = CKEDITOR.ENTER_BR;
                editor.config.language = 'zh-cn';
                editor.config.width = 600;
                editor.config.height = 400;
                editor.config.allowedContent = true;//防止过滤标签的css-style属性

                //复制功能

                $("#btnCopy").zclip({
                    path:'/lavico/public/zclip.js/ZeroClipboard.swf',
                    copy:function(){
                        return $('#host-url').val();
                    }
                });

                //保存按钮
                window.save = function (){

                    var aFormInput = {}

                    var _inputCheck = true;

                    /*日期判断*/
                    var _startDate = $('#startDate').val();
                    var startDate = new Date();
                    var startDateTimeStamp;
                    startDate.setFullYear(_startDate.substring(0,4));
                    startDate.setMonth((parseInt(_startDate.substr(5,2))-1));
                    startDate.setDate((parseInt(_startDate.substr(8,2))));
                    startDate.setHours(0,0,0);
                    startDateTimeStamp = Date.parse(startDate);//毫秒级

                    var _endDate =$('#endDate').val();
                    var endDate = new Date();
                    var endDateTimeStamp;
                    endDate.setFullYear(_endDate.substring(0,4));
                    endDate.setMonth((parseInt(_endDate.substr(5,2))-1));
                    endDate.setDate((parseInt(_endDate.substr(8,2))));
                    endDate.setHours(0,0,0);
                    endDateTimeStamp = Date.parse(endDate);//毫秒级


                    var aid = $('#aid').val();
                    if(startDateTimeStamp > endDateTimeStamp){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "开始时间必须比结束时间早！",
                            type: 'error',
                            showCloseButton: true})
                    }



                    if(!$("#startDate").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择开始时间！",
                            type: 'error',
                            showCloseButton: true})

                    }
                    if(!$("#endDate").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择结束时间！",
                            type: 'error',
                            showCloseButton: true})

                    }

                    if(!$("#name").val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请填写名称！",
                            type: 'error',
                            showCloseButton: true})
                    }


                    if(!$('#lottery_cycle').val()){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请选择抽奖频率！",
                            type: 'error',
                            showCloseButton: true})
                    }
                    if(!$('#lottery_count').val()){

                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "请填写抽奖次数！",
                            type: 'error',
                            showCloseButton: true})
                    }

                    var reg = /^\d+$/;//数字正则

                    if(!$.isNumeric($('#lottery_count').val())){

                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "抽奖频率的值必须是数字！",
                            type: 'error',
                            showCloseButton: true});
                    }else{

                        if(parseInt($('#lottery_count').val()) < 0){
                            _inputCheck = false;
                            $.globalMessenger().post({
                                message: "抽奖频率的值不能是负数！",
                                type: 'error',
                                showCloseButton: true});
                        }else{
                            if(parseInt($('#lottery_count').val()) != $('#lottery_count').val()){

                                _inputCheck = false;
                                $.globalMessenger().post({
                                    message: "抽奖频率的值必须是整数！",
                                    type: 'error',
                                    showCloseButton: true});

                            }
                        }
                    }

                    if(!$.isNumeric($('#points').val())){

                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "积分消耗的值必须是数字！",
                            type: 'error',
                            showCloseButton: true});
                    }else{

                        if(parseInt($('#points').val()) < 0){
                            _inputCheck = false;
                            $.globalMessenger().post({
                                message: "积分消耗的值必须是零或者正整数！",
                                type: 'error',
                                showCloseButton: true});
                        }else{
                            if(parseInt($('#points').val()) != $('#points').val()){

                                _inputCheck = false;
                                $.globalMessenger().post({
                                    message: "积分消耗的值必须是整数！",
                                    type: 'error',
                                    showCloseButton: true});

                            }
                        }
                    }


                    if(!_inputCheck){
                        return false;
                    }

                    aFormInput['lottery'] = new Array();
                    var _lottery_sum = 0;//所有的优惠券总概率必须小于等于100
                    $(".promotion_detail").each(function(i,object){
                        console.log($(object).is(':visible'));
                        if($(object).is(':visible')){

                            var _PROMOTION_NAME = $(object).find('.PROMOTION_NAME').attr('data');

                            if(!$(object).find('.display_name').val()){
                                _inputCheck = false;
                                $.globalMessenger().post({
                                    message: _PROMOTION_NAME + "的券名称不能为空！",
                                    type: 'error',
                                    showCloseButton: true})
                                $(object).find('.display_name').focus().css('background-color','#1abc9c');

                            }else{

                                if(!$(object).find('.lottery_chance').val()){
                                    _inputCheck = false;
                                    $.globalMessenger().post({
                                        message: _PROMOTION_NAME + "的抽奖概率不能为空！",
                                        type: 'error',
                                        showCloseButton: true})
                                    $(object).find('.lottery_chance').focus().css('background-color','#1abc9c');

                                }else{

                                    var _lottery_chance = parseInt($(object).find('.lottery_chance').val());//抽奖概率
                                    _lottery_sum = _lottery_sum + _lottery_chance;

                                    if(_lottery_chance >100 || _lottery_chance <0){
                                        _inputCheck = false;
                                        $.globalMessenger().post({
                                            message: _PROMOTION_NAME + "的抽奖概率必须大于等于0，小于等于100！",
                                            type: 'error',
                                            showCloseButton: true})
                                        $(object).find('.lottery_chance').focus().css('background-color','#1abc9c');
                                    }

                                    var _lottery = {};
                                    _lottery.PROMOTION_CODE = $(object).find('.PROMOTION_CODE').attr('data');
                                    _lottery.PROMOTION_NAME = $(object).find('.PROMOTION_NAME').attr('data');
                                    _lottery.PROMOTION_DESC = $(object).find('.PROMOTION_DESC').attr('data');
                                    _lottery.PROMOTION_TYPE = $(object).find('.PROMOTION_TYPE').attr('data');
                                    _lottery.PROMOTION_QTY = $(object).find('.PROMOTION_QTY').attr('data') || null;
                                    _lottery.PROMOTION_PIC = $(object).find('.PROMOTION_PIC').attr('data') || null;
                                    _lottery.PROMOTION_USED_TOTAL = $(object).find('.PROMOTION_USED_TOTAL').attr('data');
                                    _lottery.display_name = $(object).find('.display_name').val();
                                    _lottery.lottery_chance = $(object).find('.lottery_chance').val();
                                    aFormInput['lottery'].push(_lottery);
                                }
                            }
                        }
                    })

                    if(_lottery_sum < 0 || _lottery_sum > 100){
                        _inputCheck = false;
                        $.globalMessenger().post({
                            message: "所有的优惠券的总概率必须小于等于100！",
                            type: 'error',
                            showCloseButton: true});
                    }

                    var content = editor.document.getBody().getHtml();//编辑器内容
                    aFormInput['startDate'] = new Date($("#startDate").val()).getTime();
                    aFormInput['endDate'] = new Date($("#endDate").val()).getTime();
                    aFormInput['name'] = $("#name").val();
                    aFormInput['lottery_cycle'] = $("#lottery_cycle").val();
                    aFormInput['lottery_count'] = $("#lottery_count").val();
                    aFormInput['switcher'] = 'on';
                    aFormInput['parm'] = $('input[name="parm"]:checked').val();
                    //aFormInput['thumb'] = $('#thumb_upload').attr('src');//活动小图
                    aFormInput['pic'] = $('#pic_upload').attr('src');//活动大图
                    aFormInput['createTime'] = new Date().getTime();
                    aFormInput['points'] = parseInt($("#points").val()) || 0;//每次游戏，所消耗的积分
                    aFormInput['content'] = encodeURIComponent(content);
                    aFormInput['display_name'] = $("#display_name").val();//券名称
                    console.log(aFormInput)
                    if(_inputCheck){
                        var oLinkOptions = {} ;
                        oLinkOptions.data = [{name:'postData',value:JSON.stringify(aFormInput)},{name:'_id',value:$("#_id").val()}];
                        oLinkOptions.type = "POST";
                        oLinkOptions.url = "/lavico/shake/index:save";

                        $.request(oLinkOptions,function(err,nut){
                            if(err) throw err ;
                            nut.msgqueue.popup();
                            $.controller("/lavico/shake",null,"lazy");
                        }) ;
                    }
                }
            }
        },
        save: {
            layout: "welab/Layout",
            view: "lavico/templates/shake/info.html",
            process: function (seed, nut) {
                //console.log(seed);
                nut.view.disable();

                var postData = JSON.parse(seed.postData);

                console.log(new Date(postData.startDate-8*3600*1000));
                console.log(new Date(postData.endDate-8*3600*1000));

                postData.startDate = postData.startDate-8*3600*1000;
                postData.endDate = postData.endDate-8*3600*1000+24*3600*1000-1000;
                console.log(postData);
                if (postData.length == 0) {
                    nut.message("保存失败。数据不能为空", null, 'error');
                    return;
                }
                this.step(function(){
                    helper.db.coll("lavico/shake").update({_id: helper.db.id(seed._id)}, postData,
                        {multi: false, upsert: true},
                        this.hold(function (err, doc) {
                            if (err) {
                                throw err;
                            } else {
                                nut.message("保存成功", null, 'success');
                            }
                        }));
                });
                this.step(function(){
                    helper.db.coll("lavico/shake").update(
                        {_id: helper.db.id(seed._id)},
                        {
                            $set:{
                                'memo':'摇一摇'
                            }
                        },
                        function(err,doc){
                            console.log(doc);
                        }
                    );
                });


            }
        },
        remove: {
            process: function (seed, nut) {

                nut.view.disable();

                helper.db.coll("lavico/shake").remove({_id: helper.db.id(seed._id)}, this.hold(function (err, doc) {
                    if (err) {
                        throw err;
                    } else {
                        nut.message("删除成功", null, 'success');
                    }
                }));

            }
        },
        switcher: {
            process: function (seed, nut) {

                nut.view.disable();

                helper.db.coll("lavico/shake").update({_id: helper.db.id(seed._id)}, {$set: {switcher: seed.switcher}}, this.hold(function (err, doc) {
                    if (err) {
                        throw err;
                    } else {
                        nut.message("保存成功", null, 'success');
                    }
                }));

            }
        },
        history: {
            layout: "welab/Layout",
            view: "lavico/templates/shake/info.html",
            process: function (seed, nut) {
                var shake = {};
                var list = {};
                var perPage = 20;
                var pageNum = seed.page ? seed.page : 1;
                var then = this;
                this.step(function () {
                    helper.db.coll("lavico/shake").findOne({_id: helper.db.id(seed._id)}, this.hold(function (err, doc) {
                        shake = doc;
                    }));
                })
                this.step(function () {
                    helper.db.coll("lavico/shake/logs").find({aid: shake._id.toString()}).sort({createTime: -1}).page(perPage, pageNum, then.hold(function (err, page) {
                        list = page
                    }));
                })
                this.step(function () {
                    for (var i = 0; i < list.docs.length; i++) {
                        helper.db.coll("welab/customers").find({wechatid: list.docs[i].uid}, this.hold(function (err, doc) {
                            console.log(doc)
                        }));
                    }
                })
                this.step(function () {
                    nut.model.shake = shake;
                    nut.model.list = list;
                })
            }
        }

    }
}






