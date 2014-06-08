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
                        list.docs[i].count = _doc2.length;
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
                            list.docs[i].total = doc.length;
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
            console.log('~~~~~~~~');
            console.log(list);
        });

    },
    actions: {
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
                    shake = shake ? shake : {};
                    doc = JSON.stringify(list);

                    nut.model.list = list;
                    nut.model.shake = shake;
                    nut.model.doc = doc;
                    nut.model.lottery = JSON.stringify(shake.lottery);

//                    var _lottery = shake.lottery;
//                    for(var _i;_i<_lottery.length;_i++){
//                        var _str = _lottery[_i].aid;
//                        _lottery[_i]._str = _lottery[_i].aid;
//                    }

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

                var lottery_input = $("#lottery_input").val();
                if (lottery_input) {
                    $("#lottery_cycle  option").each(function () {
                        if ($(this).val() == lottery_input) {
                            $(this).attr("selected", "true");
                        }
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






