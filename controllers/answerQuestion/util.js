var Steps = require("ocsteps") ;
exports.countor = function(controllerIns,start,end) {

    return (function (collName,name,moreCondition,model) {
        moreCondition || (moreCondition={}) ;

        if(start && end) {
            moreCondition.time = {
                $gt:start.getTime()
                , $lt:end.getTime()
            } ;
        }

        helper.db.coll(collName)
            .find(moreCondition)
            .count(this.hold(function(err,cnt){
                if(err) throw err ;
                (model||controllerIns.nut.model)[name] = cnt ;
            })) ;
    }).bind(controllerIns) ;
} ;

exports.countGroup = function(controllerIns,start,end) {

    return (function (collName,name,groupfield,moreCondition,model,limit) {
        moreCondition || (moreCondition={}) ;

        if(start && end) {
            moreCondition.time = {
                $gt:start.getTime()
                , $lt:end.getTime()
            } ;
        }

        helper.db.coll(collName).aggregate(
            [
                {$match:moreCondition},
                {$group:{
                    _id:groupfield,
                    count: {$sum: 1}
                }},
                {$limit: (limit || 20)}
            ]
            , this.hold(function(err,cnt){
                if(err) throw err ;

                var _data = {};
                _data.count = cnt.length;
                _data.countTotal = 0;

                for( var i=0;i< cnt.length ; i++){
                    _data.countTotal+=cnt[i].count;
                }
                (model||controllerIns.nut.model)[name] = _data ;
            })
        ) ;
    }).bind(controllerIns) ;
} ;

exports.countGroup = function(controllerIns,start,end) {

    return (function (collName,name,groupfield,moreCondition,model,limit) {
        moreCondition || (moreCondition={}) ;

        if(start && end) {
            moreCondition.time = {
                $gt:start.getTime()
                , $lt:end.getTime()
            } ;
        }

        helper.db.coll(collName).aggregate(
            [
                {$match:moreCondition},
                {$group:{
                    _id:groupfield,
                    count: {$sum: 1}
                }},
                {$limit: (limit || 20)}
            ]
            , this.hold(function(err,cnt){
                if(err) throw err ;

                var _data = {};
                _data.count = cnt.length;
                _data.countTotal = 0;

                for( var i=0;i< cnt.length ; i++){
                    _data.countTotal+=cnt[i].count;
                }
                (model||controllerIns.nut.model)[name] = _data ;
            })
        ) ;
    }).bind(controllerIns) ;
} ;

exports.contentGroup = function(controllerIns,start,end) {

    return (function (collName,name,groupfield,moreCondition,model,page) {
        moreCondition || (moreCondition={}) ;

        if(start && end) {
            moreCondition.time = {
                $gt:start.getTime()
                , $lt:end.getTime()
            } ;
        }

        var nPageNum = 5;
        var nSum = 0;
        helper.db.coll(collName).aggregate(
            [
                {$group:{
                    _id:groupfield,
                    count: {$sum: 1}
                }},
                {$match:moreCondition}
            ]
            , this.hold(function(err,doc){
                nSum = doc.length;
            })
        ) ;


        this.step(function(){

            helper.db.coll(collName).aggregate(
                [
                    {$group:{
                        _id:groupfield,
                        count: {$sum: 1}
                        //authors : { $addToSet : groupfield }
                    }},
                    {$match:moreCondition},
                    {$sort: {count: -1}},
                    {$skip: ((page||1)-1) * nPageNum},
                    {$limit: nPageNum}
                ]
                , this.hold(function(err,doc){
                    if(err) throw err ;

                    var sumCount = 0;
                    for( var i=0 ; i < doc.length ; i++){
                        sumCount += doc[i].count;
                    }
                    var _page = {};
                    _page.lastPage = Math.ceil(nSum / nPageNum);
                    _page.currentPage = page||1;
                    _page.otherData_SumCount = sumCount;
                    _page.docs = doc;
                    (model||controllerIns.nut.model)[name] = _page || {} ;
                })
            ) ;
        })


    }).bind(controllerIns) ;
} ;

function beginDay(day){
    return new Date(day.getFullYear() +"-"+ (day.getMonth()+1) +"-"+ day.getDate()) ;
}

exports.getLastDay = function () {
    return new Date((beginDay(new Date()).getTime() + 24*60*60*999.99)) ;
} ;

exports.getFirstDay = function () {
    return beginDay(new Date(new Date().getTime() - 24*60*60*1000*30)) ;
} ;

exports.getWeekFirstDay = function(){
    return beginDay(new Date(new Date().getTime() - 24*60*60*1000*7)) ;
}

exports.getWeekLastDay = function(){

    return new Date((beginDay(new Date()).getTime() + 24*60*60*999.99)) ;
}


//获得本周的开端日期
exports.getWeekStartDate = function() {
    var now=new Date();
    var start=new Date();
    var n=now.getDay();
    start.setDate(now.getDate()-n+1);
    return new Date(start.getFullYear() + "-" + (start.getMonth()+1) + "-" + start.getDate())
}

//获得本周的停止日期
exports.getWeekEndDate = function() {
    var now=new Date();
    var end=new Date();
    var n=now.getDay();
    end.setDate(now.getDate()-n+7);
    return new Date(end.getFullYear() + "-" + (end.getMonth()+1) + "-" + end.getDate() + " 23:59:59")
}

exports.toDate = function(date){

    var o = {};
    var _date ;
    if(typeof(date) == "string"){
        _date = new Date(date);
    }else{
        _date = date;
    }
    o.str = _date.getFullYear() +"-"+ (_date.getMonth()+1) +"-"+ (_date.getDate()<10 ? ('0'+_date.getDate()) : _date.getDate());
    o.object = new Date(o.str);
    return o ;
}
exports.toDateTime = function(date){

    var o = {};
    var _date ;
    if(typeof(date) != "Date"){
        _date = new Date(date);
    }else{
        _date = date;
    }
    o.str = _date.getFullYear() +"-"+ (_date.getMonth()+1) +"-"+ _date.getDate() + " " + _date.getHours() +":"+ _date.getMinutes() +":"+ _date.getSeconds();
    o.object = new Date(o.str);
    return o ;
}

exports.toStartAndEnd = function(date){

    var o = {};
    if(typeof(date) != "Date"){
        date = new Date(date);
    }
    o.start = new Date(date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate());
    o.end = new Date(new Date(date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate()).getTime() + 60*60*24*999.99);
    return o ;
}

exports.statByDays = function(collName,condition,start,end,cb) {

    var byDays = [] ;
    var waiting = 0 ;
    var completed = 0 ;
    var i = 0 ;

    for(var day=start;day<=end;day=new Date(day.getTime()+24*60*60*1000))
    {
        (function(day,itemidx){

            var dayEnd = new Date(day.getTime() + 24*60*60*1000) ;

            waiting ++ ;
            condition.time = {
                $gt:day.getTime()
                , $lt:dayEnd.getTime()
            } ;
            helper.db.coll(collName)
                .find(condition)
                .count(function(err,cnt){
                    if(err){
                        console.log(err) ;
                        cb && cb(err) ;
                        return ;
                    }

                    byDays[itemidx] = {
                        date: day.toISOString().substr(0,10)
                        , count: cnt
                    } ;

                    if(++completed>=waiting)
                        cb && cb(null,byDays) ;
                }) ;

        }) (day,i++) ;
    }
} ;


exports.userMessageData = function(uid,callback)
{
    var _data = {};
    var wechatid = 0;

    Steps(

        function(){

            helper.db.coll("welab/customers").findOne({_id:helper.db.id(uid)},this.hold(function(err,doc){
                if(err) throw err ;

                wechatid = doc.wechatid;
            })) ;
        },

        function(){

            // count
            helper.db.coll("welab/messages").find({from:wechatid}).count(this.hold(function(err, doc)
            {
                _data.sesseionCount = doc;
            }))

            // last
            helper.db.coll("welab/messages").find({from:wechatid}).limit(1).sort({time:-1}).toArray(this.hold(function(err, doc)
            {
                _data.sessionLastTime = doc[0] ? doc[0].time : 0;
            }))
        }

        , function(){
            callback(_data) ;
        }

    ) () ;

};
exports.userViewLogData = function(uid,callback)
{
    var _data = {};
    var wechatid = 0;

    Steps(

        function(){

            helper.db.coll("welab/customers").findOne({_id:helper.db.id(uid)},this.hold(function(err,doc){
                if(err) throw err ;

                wechatid = doc.wechatid;
            })) ;
        },

        function(){

            // view
            helper.db.coll("welab/replyViewLog").find({by:wechatid, action:"view"}).count(this.hold(function(err, doc)
            {
                _data.view = doc;
            }))

            // share
            helper.db.coll("welab/replyViewLog").find({by:wechatid, $or:[{action:"share.friend"},{action:"share.timeline"}]}).count(this.hold(function(err, doc)
            {
                _data.share = doc;
            }))

            // viewFriend
            helper.db.coll("welab/replyViewLog").find({by:wechatid, $or:[{action:"view.friend"},{action:"view.timeline"}]}).count(this.hold(function(err, doc)
            {
                _data.viewfriend = doc;
            }))
        }

        , function(){
            callback(_data) ;
        }

    ) () ;

};
exports.userFeedData = function(uid,callback)
{
    var _data = {};
    var wechatid = 0;

    Steps(

        function(){

            // followCount
            helper.db.coll("welab/feeds").find({uid:helper.db.id(uid), title:"关注"}).count(this.hold(function(err, doc)
            {
                _data.followCount = doc;
            }))
        }

        , function(){
            callback(_data) ;
        }

    ) () ;

};
