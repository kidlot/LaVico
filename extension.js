//微信调用
var wechatapi = require("welab/lib/wechat-api.js") ;
//事件队列
var aSteps = require("./lib/aSteps.js");

exports.onload=function(application){
    //微信入口
    wechatapi.registerReply(9,function(msg,req,res,next){
        //如果
        if (msg.MsgType == "text" && msg.Content=="lv") {
            //测试：添加记录（需要更新表结构）
            helper.db.coll("lavigo/getScore").insert(
                {title:"快乐生活从现在开始",
                    description:"这是所有年轻人的生活方式",
                    prizeSet:"一等奖50寸彩电一台，二等将100%参与奖",
                    relife:"出现问题，请拨打110",
                    options:
                        [{optionTitle:"三粒扣西服扣子正式场合的正确系法是",
                            optionType:"1",//1单选 2复选 3简答
                            optionID:101,
                            choose:[{
                                chooseID:101001,
                                chooseTitle:"系上面两颗，中间一颗",
                                choosePicUrl:""
                            }]
                        }
                        ],
                    titlePicUrl:"http://pic11.nipic.com/20101111/1656608_112354048507_2.jpg",
                    url:"http://www.baidu.com",
                    isMan:false,
                    manScore:-1
                },function(err, doc) {
                    //返回受影响行数
                    return eval(doc).length;
                });
            //console.log(util.insertGetScore());
                res.reply("进入录入选项");
        }else{
            next();
        }
    });

    wechatapi.registerReply(9,function(msg,req,res,next){

        if (msg.MsgType == "text" && msg.Content=="xx") {
            //helper.db.coll("lavigo/getScore").find({}.toArray(),function(err,cursor){
            helper.db.coll("lavigo/getScore").find().toArray(function(err,cursor){
                var replyArr=[];
                for(var i=0;i<cursor.length;i++){
                    var json={
                        title:cursor[i].title,
                        description:cursor[i].description,
                        picurl:cursor[i].titlePicUrl,
                        url:cursor[i].url
                    }
                    replyArr.push(json);
                }
                //replyArr=replyArr.substring(0,replyArr.length-1);
                //replyArr+="]";
                console.log(replyArr);
                res.reply(replyArr);
            });


        }
    });
}
