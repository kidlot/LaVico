/**
 * Created by David Xu on 7/23/14.
 */
var http = require('http');
var fs = require('fs');
var Application = require('opencomb/lib/core/Application.js');
module.exports = {

    layout: "welab/Layout"
    , view: "lavico/templates/QRstore/index.html"

    , process: function (seed, nut) {

        if(helper.db.coll("lavico/stores")){
            helper.db.coll("lavico/stores").find().sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){
                if(err) throw err ;

                if(doc&&doc[0]&&doc[0].storeList){
                    nut.model.storeList = JSON.stringify(doc[0].storeList);
                }else{
                    nut.model.storeList = null;
                }
            }));
        }


    }
    , viewIn: function(){
        $('[name=store]:checkbox').attr("checked",false);

    }

    , actions: {

        readXlsx:{
            process: function(seed,nut)
            {
                var xlsx = require('node-xlsx');//读取excel文件，需要安装npm i node-xlsx
                var uploadType = seed.uploadType || 'rewrite';
                nut.disable() ;
                var storeOldList;



                var urlArr = seed.url.split('/');
                var folder = Application.singleton.rootdir;

                var url = folder + seed.url;
                var obj = xlsx.parse(url);
                var info = JSON.stringify(obj);


                this.res.writeHead(200,{"Content-Type":"application/json"});

                this.res.write(info);

                if(obj&&obj.worksheets&&obj.worksheets[1]&&obj.worksheets[1].data){

                    var _result = obj.worksheets[1].data;
                    var _storeKey = [];
                    var _store = [];
                    var storeList = [];
                    for(var _i=0;_i<_result.length&&(_result[_i]&&_result[_i][0]&&_result[_i][0].value);_i++){
                        if(_i==0){
                            //生成键值
                            for(var _j=0;_j<_result[_i].length;_j++){
                                if(_result[_i][_j]&&_result[_i][_j].value){
                                    _storeKey[_j] = _result[_i][_j].value;
                                }
                            }
                            storeList.push(_storeKey);
                            _storeKey = [];
                        }else{
                            for(var _j=0;_j<_result[_i].length;_j++){
                                if(_result[_i][_j]&&_result[_i][_j].value){
                                    _store[_j] = _result[_i][_j].value;
                                }
                            }
                            storeList.push(_store);
                            _store = [];
                        }

                    }
                    //console.log(storeList);
                    var insertData = {};
                    insertData.createTime = new Date().getTime();
                    insertData.storeList = storeList;//门店数据
                    if(uploadType == 'rewrite'){

                        console.log('rewrite')
                        console.log(storeList);
                        helper.db.coll("lavico/stores").insert(insertData, function (err, doc) {
                            if (err) {
                                throw err;
                            }
                        });

                    }
                    else if(uploadType == 'appendTo'){

                        console.log('appendTo');
                        console.log('++++++storeList+++++++');
                        console.log(storeList);
                        console.log('++++++storeList+++++++');

                        this.step(function(){
                            helper.db.coll("lavico/stores").find().sort({createTime:-1}).limit(1).toArray(this.hold(function(err,doc){
                                if(err) throw err ;

                                if(doc&&doc[0]&&doc[0].storeList){
                                    storeOldList = doc[0].storeList;
                                }else{
                                    storeOldList = null;
                                }
                            }));
                        })

                        this.step(function(){
                            console.log('++++++storeOldList+++++++');
                            console.log(storeOldList);
                            console.log('++++++storeOldList+++++++');

                            if(storeOldList&&storeOldList.length>0&&storeList.length>0){
                                storeOldList[0] = storeList[0];


                                for(var _i=0;_i<storeList.length;_i++){
                                    var j = storeList[_i][0];//要修第几个
                                    if(typeof storeOldList[j] == 'undefined'){
                                        if(j>storeOldList.length){

                                            for(var k=storeOldList.length;k<=j;k++){
                                                if(typeof storeOldList[k] =='undefined'){
                                                    storeOldList[k] = [];
                                                }
                                            }

                                            storeOldList[j] = storeList[_i];

                                        }else{
                                            storeOldList[j] = storeList[_i];
                                        }
                                    }else{
                                        storeOldList[j] = storeList[_i];
                                    }
                                    console.log(j);
                                }

//                                for(var _i=0;_i<storeOldList.length;_i++){
//                                    if(storeOldList[_i]==undefined){
//                                        for(var _j=0;_j<storeOldList[_i].length;_j++){
//                                            if(_j=0){
//                                                storeOldList[_i][0] = _i;
//
//                                            }else{
//                                                storeOldList[_i][_j] = null;
//                                            }
//                                        }
//                                    }
//                                }
                            }

                            insertData.storeList = storeOldList;

                            console.log(insertData);
                            console.log('++++++insertData+++++++');
                            console.log(insertData);
                            console.log('++++++insertData+++++++');
                            helper.db.coll("lavico/stores").insert(insertData, function (err, doc) {
                                if (err) {
                                    throw err;
                                }
                            });
                        });


                    }else{
                        //
                    }


                }

                    /*导入数据库*/
                this.res.end();

            }

        }

        ,downImage:{
            process: function(seed,nut)
            {
                var url = seed.url;
                this.res.writeHead(200,{"Content-Type":"application/octet-stream"});
                var imageData = fs.readFileSync(url);
                this.res.write(imageData);
                this.res.end();
            }
        }

        ,exports: {

            process: function(seed,nut)
            {
                var EasyZip=require('easy-zip').EasyZip;

                nut.view.disable() ;

                var ids = seed.ids.split(',');

                console.log(ids);

                var then = this;

                var _end = function(res){
                    nut.disable();
                    var data = JSON.stringify(res);
                    then.res.writeHead(200, { 'Content-Type': 'application/json' });
                    then.res.write(data);
                    then.res.end();
                    return false;
                }

                if(!process.wxApi){
                    _end({err:1,msg:"必须是服务号"})
                }

                var qr = []
                var folder = Application.singleton.rootdir + "/public/qr/" ;

                // 目标是否存在
                fs.exists(folder,this.hold(function(is){
                    if(!is){
                        fs.mkdir(folder,this.hold(function(){
                        }))
                    }
                }))

                var zip4 = new EasyZip();

                // 获取 ticket
                this.step(function(){

                    for(var i=0 ; i<= ids.length ; i++){

                        (function(i){
                            fs.exists(folder + i + ".jpg", then.hold(function (is) {
                                if (!is) {
                                    process.wxApi.createLimitQRCode(i, then.hold(function(err,result){
                                        if(err) console.log(err)

                                        console.log("get ticket",i)
                                        qr.push({code:i,ticket:result.ticket})
                                    }));
                                }
                            }))

                        })(ids[i])
                    }

                })

                // 下载文件
                this.step(function(){

                    this.each(qr,function(i,o){

                        var hold = this.hold()

                        var options = {
                            host: 'mp.weixin.qq.com',
                            port: 80,
                            path: "/cgi-bin/showqrcode?ticket=" + o.ticket,
                            method: 'GET'
                        };

                        var req = http.request(options, function (res) {
                            res.setEncoding('binary');
                            var body = '';
                            res.on('data', function (data) {
                                body += data;
                            });
                            res.on('end', function () {

                                fs.writeFile(folder+qr[i].code+".jpg", body, 'binary', function (err) {
                                    if (err) throw err;
                                    console.log("save qr",o.code)

                                    hold()
                                });

                            })
                        });
                        req.end()
                    })
                })

                // 打包
                this.step(function(){

                    var exec = require('child_process').exec;
//                    var files = []

                    var aQr = ids;



                    this.each(aQr,function(i,o){

                        var holdDo = this.hold()
                        exec("zip -qj "+folder+"_"+ids.join("")+".zip "+folder+o+".jpg", function (error, stdout, stderr) {
                            if (error !== null) {
                                console.log('exec error: ' + error);
                            }
                            console.log("save zip",o)
                            holdDo()
                        });
                    })

                })

                // 读取打包后的文件
                this.step(function(){

                    console.log("ok")

                    fs.readFile(folder+"_"+ids.join("")+".zip", this.hold(function (error, fileData) {
                        if (error) {
                            console.log(error)
                        }
                        return fileData;
                    }));

                })

                // 下载
                this.step(function(fileData){

                    this.res.setHeader('Content-Disposition', 'attachment; filename="qr.zip"');
                    this.res.write(fileData,"binary");
                    this.res.end();
                })
            }
        }
    }

}