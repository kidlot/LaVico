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

        helper.db.coll("lavico/stores").find().sort({createTime:-1}).find(this.hold(function(err,doc){
            if(err) throw err ;
            console.log(doc);
            if(doc){
                nut.model.storeList = JSON.stringify(doc.storeList);
            }else{
                nut.model.storeList = null;
            }
        }));

    }
    , viewIn: function(){

    }

    , actions: {

        readXlsx:{
            process: function(seed,nut)
            {
                var xlsx = require('node-xlsx');//读取excel文件，需要安装npm i node-xlsx

                nut.disable() ;

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

                    helper.db.coll("lavico/stores").insert(insertData, function (err, doc) {
                        if (err) {
                            throw err;
                        }
                    });
                }

                /*导入数据库*/
                this.res.end();

            }

        }

    }

}