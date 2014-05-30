exports.getOpenid = function(req,res,code,cbUrl,cbFunc){

    // 从SESSION中读取OPENID
    if(req.session.oauthTokenInfo){

        console.log("从SESSION中读取OPENID",req.session.oauthTokenInfo.openid)
        cbFunc({openid:req.session.oauthTokenInfo.openid})

    }else{

        // 通过oauth获取OPENID
        if(process.wxOauth){

            if(!code){

                var url = process.wxOauth.getAuthorizeURL(cbUrl,"123","snsapi_base")
                console.log("通过oauth获得CODE的url",url)
                res.writeHeader(302, {'location': url })  ;

            }else{

                process.wxOauth.getAccessToken(code,function(err,doc){

                    if(!err){
                        var openid = doc.openid
                        wxid = openid || undefined;
                        console.log("通过oauth获得信息",doc)
                        req.session.oauthTokenInfo = doc;
                        cbFunc({openid:req.session.oauthTokenInfo.openid})
                    }else{
                        console.log("通过oauth获得ID超时。",err)
                        res.writeHeader(302, {'location': cbUrl})  ;
                    }
                })
            }

        }else{
            cbFunc({err:1,msg:"不是认证服务号！"})
        }
    }

}