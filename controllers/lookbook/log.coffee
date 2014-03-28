
module.exports = {

  layout: "welab/Layout"
  view: "lavico/templates/lookbook/log.html"

  process: (seed, nut)->

    _page = {}
    thisb = this
    where = {action:"侃价","data.step":3}

    dTime = new Date()
    _ym = dTime.getFullYear() + "-" + (dTime.getMonth()+1)

    startTimeStamp = if seed.startDate then new Date(seed.startDate + " 00:00:00").getTime() else new Date(_ym+"-01 00:00:00").getTime();
    endTimeStamp = if seed.stopDate then new Date(seed.stopDate + " 23:59:59").getTime() else new Date(_ym+"-31 23:59:59").getTime();

    if (seed.startDate && seed.stopDate)
      where.createTime = {$gt:startTimeStamp,$lt:endTimeStamp}

    helper.db.coll("lavico/user/logs").find(where).sort({createTime:-1}).page(50,seed.page||1,this.hold((err,page)->

      _page = page || {}
      for o in page.docs

        ( (o) ->
          helper.db.coll("welab/customers").findOne({wechatid: o.wxid},thisb.hold( (err, doc2) ->
            o.user = doc2 || {}
          ))
          helper.db.coll("lavico/lookbook").findOne({_id: helper.db.id(o.data.productID)},thisb.hold( (err, doc2) ->
            o.product = doc2 || {}
          ))
        )(o)

    )) ;


    this.step(()->

      nut.model.startDate = new Date(startTimeStamp+60*60*8*1000).toISOString().substr(0,10)
      nut.model.stopDate = new Date(endTimeStamp+60*60*8*1000).toISOString().substr(0,10)
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
              helper.db.coll("lavico/lookbook").findOne({_id: helper.db.id(o.data.productID)},thisb.hold( (err, doc2) ->
                o.product = doc2 || {}
              ))
            )(o)

        )) ;


        this.step(()->


          nodeExcel = require 'excel-export'

          conf ={};
          conf.cols = [{
            caption:'OPENID',
            type:'string',
          },{
            caption:'卡号',
            type:'string',
          },{
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
            cardid = ""
            cardid = o.user.HaiLanMemberInfo.memberCardNumber if o.user.HaiLanMemberInfo

            conf.rows.push([o.wxid,cardid,o.user.realname,o.user.mobile,new Date(o.createTime + 60*60*8*1000).toISOString().substr(0,10), o.data.price, o.product.name])


          result = nodeExcel.execute(conf);
          this.res.setHeader('Content-Type', 'application/vnd.openxmlformats');
          this.res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
          this.res.write(result, 'binary')
          this.res.end();

        )



    }

  }
}

