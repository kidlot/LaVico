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

        helper.db.coll("welab/reply").findOne({followAutoReply:true},this.hold(function(err,doc){
            if(err) throw err ;
            nut.model.doc = doc||{}
        }));

    }
    , viewIn: function(){

    }

    , actions: {

        exports: {

            process: function(seed,nut)
            {
                var EasyZip=require('easy-zip').EasyZip;

                nut.view.disable() ;

                var then = this;

                var _end = function(res){
                    nut.disable();
                    var data = JSON.stringify(res);
                    then.res.writeHead(200, { 'Content-Type': 'application/json' });
                    then.res.write(data);
                    then.res.end();
                    return false;
                }
                if(!seed.min){
                    _end({err:1,msg:"最小值不能为空"})
                }
                if(!seed.max){
                    _end({err:1,msg:"最大值不能为空"})
                }
                if(!process.wxApi){
                    _end({err:1,msg:"必须是服务号"})
                }
                var min = parseInt(seed.min)
                var max = parseInt(seed.max)

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

                    for(var i=min ; i<= max ; i++){

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

                        })(i)
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

                    var aQr = []
                    for(var i=min ; i<= max ; i++){
                        aQr.push(i)
                    }


                    this.each(aQr,function(i,o){

                        var holdDo = this.hold()
                        exec("zip -qj "+folder+min+"_"+max+".zip "+folder+o+".jpg", function (error, stdout, stderr) {
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

                    fs.readFile(folder+min+"_"+max+".zip", this.hold(function (error, fileData) {
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
        ,readXlsx:{
            process: function(seed,nut)
            {
                var xlsx = require('node-xlsx');//读取excel文件，需要安装npm i node-xlsx

                nut.disable() ;

                var urlArr = seed.url.split('/');
                var folder = Application.singleton.rootdir;

                var url = folder + seed.url;
                var obj = xlsx.parse(url);
                var info = JSON.stringify(obj);

                //console.log(url);
                //console.log(obj);
                console.log(info);
                this.res.writeHead(200,{"Content-Type":"application/json"});
                this.res.write(info);
                this.res.end();

            }

        }

    }

}