
module.exports = {

  layout: "welab/Layout"
  view: "lavico/templates/bargain/statistics.html"

  process: (seed, nut)->

    _page = {}
    thisb = this
    where = {action:"侃价成交"}

    startTimeStamp = new Date(seed.startDate + " 00:00:00").getTime();
    endTimeStamp = new Date(seed.stopDate + " 23:59:59").getTime();

    if (seed.startDate && seed.stopDate)
      where.createTime = {$gt:startTimeStamp,$lt:endTimeStamp}

    helper.db.coll("lavico/user/logs").find(where).sort({createTime:-1}).page(50,seed.page||1,this.hold((err,page)->

      _page = page || {}
      for o in page.docs

        ( (o) ->
          helper.db.coll("welab/customers").findOne({wechatid: o.wxid},thisb.hold( (err, doc2) ->
            o.user = doc2 || {}
          ))
          helper.db.coll("lavico/bargain").findOne({_id: helper.db.id(o.data.productID)},thisb.hold( (err, doc2) ->
            o.product = doc2 || {}
          ))
        )(o)

    )) ;

    # 每天人数

    dateList = []

    day = 60 * 60 * 24 * 1000
    jsDay = startTimeStamp
    while ( jsDay < endTimeStamp)
      dJsDay = new Date(jsDay)
      dateList.push({
        title: dJsDay.getFullYear() + "-" + (dJsDay.getMonth()+1) + "-" + dJsDay.getDate()
      })
      jsDay = jsDay + day



    for o in dateList
      d1 = new Date(o.title + " 00:00:00").getTime();
      d2 = new Date(o.title + " 23:59:59").getTime();

      ((o)->


        #参与人数:
        helper.db.coll("lavico/user/logs").aggregate([
          {$match:{action:"侃价",createTime:{$gt:d1,$lt:d2}}},
          {$group:{_id:"$wxid"}}
        ],
          thisb.hold((err,doc)->
            o.uv1 = if doc then doc.length else 0
          )
        )

        #成交人数:

        helper.db.coll("lavico/user/logs").aggregate([
          {$match:{action:"侃价成交",createTime:{$gt:d1,$lt:d2}}},
          {$group:{_id:"$wxid"}}
        ],
          thisb.hold((err,doc)->
            o.uv2 = if doc then doc.length else 0
          )
        )
      )(o)




    #参与人数:

    helper.db.coll("lavico/user/logs").aggregate([
      {$match:{action:"侃价"}},
      {$group:{_id:"$wxid"}}
    ],
      this.hold((err,doc)->

        nut.model.uv1 = if doc then doc.length else 0
      )
    )

    #成交人数:

    helper.db.coll("lavico/user/logs").aggregate([
      {$match:{action:"侃价成交"}},
      {$group:{_id:"$wxid"}}
    ],
      this.hold((err,doc)->

        nut.model.uv2 = if doc then doc.length else 0
      )
    )


    this.step(()->

      nut.model.seed = seed
      nut.model.dateList = dateList
      nut.model.page = _page || {}
    )


  viewIn : ()->

    $('#startDate').datetimepicker({
      format: 'yyyy-mm-dd',
      autoclose: true,
      minView: 2
    });

    $('#stopDate').datetimepicker({
      format: 'yyyy-mm-dd',
      autoclose: true,
      minView: 2
    });


  actions: {


    export: {

      layout:null,
      view:null,
      process: (seed,nut)->

        thisb = this

        where = {action:"侃价成交"}

        startTimeStamp = new Date(seed.startDate + " 00:00:00").getTime();
        endTimeStamp = new Date(seed.stopDate + " 23:59:59").getTime();

        if (seed.startDate && seed.stopDate)
          where.createTime = {$gt:startTimeStamp,$lt:endTimeStamp}

        _docs = {}
        helper.db.coll("lavico/user/logs").find(where).sort({createTime:-1}).toArray(this.hold((err,docs)->

          _docs = docs || {}
          for o in docs

            ( (o) ->
              helper.db.coll("welab/customers").findOne({wechatid: o.wxid},thisb.hold( (err, doc2) ->
                o.user = doc2 || {}
              ))
              helper.db.coll("lavico/bargain").findOne({_id: helper.db.id(o.data.productID)},thisb.hold( (err, doc2) ->
                o.product = doc2 || {}
              ))
            )(o)

        )) ;


        this.step(()->


          nodeExcel = require 'excel-export'

          conf ={};
          conf.cols = [{
            caption:'昵称',
            type:'string',
          },
            {
              caption:'手机号',
              type:'string',
            },
            {
              caption:'时间',
              type:'string',
            },
            {
              caption:'成交价',
              type:'string',
            },
            {
              caption:'产品名称',
              type:'string',
            }
          ];

          conf.rows = [];

          for o,i in _docs
            conf.rows.push([o.user.realname,o.user.mobile,new Date(o.createTime + 60*60*8*1000).toISOString().substr(0,10), o.data.price, o.product.name])


          result = nodeExcel.execute(conf);
          this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
          this.res.write(result, 'binary')
          this.res.end();

        )



    }

  }
}

