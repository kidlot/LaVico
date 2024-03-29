var middleware = require('../../lib/middleware.js');
module.exports = {

    layout: null
    , view: "lavico/templates/hongbao/hongbao.html"

    , process: function(seed,nut)
    {
        var doc = {};

        nut.model.fromWelab = seed.fromWelab || ""

        var wxid = seed.wxid;
	
	var sharewxid = seed.sharewxid;
	
        this.step(function(){
            //oauth认证	       
        if(!wxid){
                // 通过oauth获取OPENID
                if(process.wxOauth){

                    if(!seed.code){

                        var url = process.wxOauth.getAuthorizeURL("http://"+this.req.headers.host+this.req.url,"123","snsapi_userinfo")
                        console.log("通过oauth获得CODE的url",url)
                        this.res.writeHeader(302, {'location': url }) ;

                        nut.disable();//不显示模版
                        this.res.end();
                        this.terminate();

                    }else{
                        process.wxOauth.getAccessToken(seed.code,this.hold(function(err,doc){
				console.log(err);
                            if(!err){
                                var openid = doc.data.openid						  
                                wxid = openid || undefined;
				console.log(seed.sharewxid);
				if(seed.sharewxid){
					//is_me  true or false

					if(wxid == seed.sharewxid){
						nut.model.is_me = true;
					}else{
						nut.model.is_me = false;
					}
				}else{
				        console.log("没有shareid");
					//is_me  true
					nut.model.is_me = true;
				}
				
				
				
				if(nut.model.is_me == false){			
				helper.db.coll("lavico/hongbao/gift").findOne({sharewxid:seed.sharewxid},this.hold(function(err,doc){
					if(!doc){
					nut.model.is_give = false;//是否绑定过券
					
					helper.db.coll("lavico/hongbao/detail").find({sharewxid:seed.sharewxid}).sort({createTime:-1}).page(500,seed.page||1,this.hold(function(err,page){
					
					if(page){
						list = page			
						nut.model.page = list;  
						var hongbaolist = list['docs'];
						var total_amount = 0;
						for (var i = 0; i < hongbaolist.length; i++) {
							total_amount = total_amount + hongbaolist[i]['amount'];
						}
						
						if(total_amount>800){//红包累计已满												
							nut.model.is_full = true;
						}else{
							nut.model.is_full = false;
						
						//获取userinfo
						process.wxOauth.getUser(wxid,this.hold(function(err,doc){
					   		 
						if(!err){
						    console.log("通过oauth获得信息",doc) 
						    var userinfo = doc;
							//判断是否给此用户获取过碎片
						        helper.db.coll("lavico/hongbao/detail").findOne({sharewxid:seed.sharewxid,wxid:wxid},this.hold(function(err,doc){
							    if(err){
							    console.log(err);
								throw err;
							    }else{
								if(doc){
								}else{
								 //获取碎片开始
								 //第一步：判断可获取的上线 800
								  console.log("开始获取红包");

									var ranNum = Math.floor(Math.random()*100+1);
									var caseNum = 0;
									var amount = 0;
									if(ranNum>0&&ranNum<51){
										caseNum = 1;
									}else if(ranNum>50&&ranNum<81){
										caseNum = 2;
									}else if(ranNum>80&&ranNum<91){
										caseNum = 3;
									}else if(ranNum>90&&ranNum<96){
										caseNum = 4;
									}else if(ranNum>95&&ranNum<101){
										caseNum = 5;
									}
									switch(caseNum){
										case 1:
										amount =  parseInt(Math.random()*(30-11+1)+11);
										break;
										case 2:
										amount =  parseInt(Math.random()*(50-31+1)+31);
										break;
										case 3:
										amount =  parseInt(69);
										break;
										case 4:
										amount =  parseInt(99)
										break;
										case 5:
										amount =  parseInt(199);
										break;
										default:
										amount = 11;
									}
																 								 																	
								        helper.db.coll("lavico/hongbao/detail").insert({
									    "sharewxid": seed.sharewxid,
									    "wxid": wxid,
									    "nickname": userinfo.nickname,
									    "sex":userinfo.sex,
									    "province":userinfo.province,
									    "city":userinfo.city,
									    "country":userinfo.country,
									    "headimgurl":userinfo.headimgurl,
									    "amount":amount,
									    "createtime":new Date().getTime()
									},function(err,doc){
									});
								    


								}

							    }
							}))
						    
						    
						}else{
						 console.log("通过oauth报错!!!!!!!!!!!!",err)
						}
					   }));
						}
					}					
					}))

					
					
					
					
					
					}else{
						nut.model.is_give = true;
					}
				
				
				}))
				
				
				
				}else{
					helper.db.coll("lavico/hongbao/gift").findOne({sharewxid:wxid},this.hold(function(err,doc){
					if(!doc){
						nut.model.is_give = false;//是否绑定过券
					}else{
						nut.model.is_give = true;//是否绑定过券
					}
					}))
				}
				

				
                            }
                        }))
                    }

                }
            
        }
        });

	//判断是否是注册会员
	this.step(function(){

            helper.db.coll("welab/customers").findOne({wechatid:wxid},this.hold(function(err,customers){
                var customers = customers || {}
		console.log(customers);
                nut.model.isVip = false
                nut.model.isFollow = customers.isFollow ? true : false;
                if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
                    nut.model.isVip = true
                    nut.model.memberID = customers.HaiLanMemberInfo.memberID
                }
            }))
        })

	
	//判断是否绑定券

	this.step(function(){
	    if(nut.model.is_me){
	        helper.db.coll("lavico/hongbao/gift").findOne({sharewxid:wxid},this.hold(function(err,doc){
			if(doc){			
				nut.model.is_bindcard = true;
			}else{
				nut.model.is_bindcard = false;
			}
		}))
	    
	    }else{
	    	helper.db.coll("lavico/hongbao/gift").findOne({sharewxid:seed.sharewxid},this.hold(function(err,doc){
			if(doc){			
				nut.model.is_bindcard = true;
			}else{
				nut.model.is_bindcard = false;
			}
		}))
	    
	    }

        })


	
	//获得红包的情况
	this.step(function(){
	
		var list = {};
		if(!seed.sharewxid){
			seed.sharewxid = wxid;
		}
		helper.db.coll("lavico/hongbao/detail").find({sharewxid:seed.sharewxid}).sort({createTime:-1}).page(500,seed.page||1,this.hold(function(err,page){	
		if(page){
			list = page			
			nut.model.page = list;  
			var hongbaolist = list['docs'];
			var total_amount = 0;
			for (var i = 0; i < hongbaolist.length; i++) {
				total_amount = total_amount + hongbaolist[i]['amount'];
			}
			if(total_amount>800){
				total_amount = 800;
			}
			nut.model.total_amount = total_amount;
			if(total_amount>0){
				nut.model.has_amount = true; 	
			}else{
				nut.model.has_amount = false; 	
			}
			
			
		}else{
			nut.model.has_amount = false; 	
		}
		
		})) ;
		
		
		if(!nut.model.is_me){
			if(!nut.model.is_give)	{	
				helper.db.coll("lavico/hongbao/detail").findOne({sharewxid:seed.sharewxid,wxid:wxid},this.hold(function(err,doc){
					if(doc){
						nut.model.givehongbao = doc.amount;
					}else{
						nut.model.givehongbao = 0;
					}
				
				}))
			}
		}
		
		

        })


        /*
        检查是否关注
         */


        this.step(function(){

            nut.model._id = seed._id || ""
            nut.model.wxid = wxid
            nut.model.doc = doc || {}
        })
    }
    
    , actions: {

		share: function(seed,nut){

		//判断有无分享
		 helper.db.coll("lavico/pintu/share").findOne({sharewxid:seed.sharewxid},this.hold(function(err,share){
			if(share){
			
			}else{
				helper.db.coll("lavico/pintu/share").insert({
					sharewxid : seed.sharewxid,
					time:new Date().getTime(),
					is_share:true
				},this.hold(function(err,doc){

				if(err){
				    throw err;
				}
				}))
			}
		 
		 }))

		},
		getsharecoupan: function(seed,nut){

			middleware.request('Coupon/FetchCoupon',{
                            openid:seed.wxid,
                            PROMOTION_CODE:'CQL201409030057', //海澜CRM 活动代码，由 Promotions 接口返回
                            point:0,//每次摇一摇，消耗积分
                            memo:"微信丝绒活动分享券",
			    otherPromId:"L"
                        },this.hold(function(err,doc){
				if(!err){
				doc = eval("("+doc+")");
                                helper.db.coll("lavico/pintu/share").update({sharewxid : seed.wxid}, {$set:{is_get:true,coupon:doc.coupon_no}},this.hold(function(err,doc){
                                    if(err ){
                                        console.log(err)
                                    }
                                })) ;
			
				}
			}))
		},getcoupan: function(seed,nut){
			helper.db.coll("lavico/hongbao/gift").findOne({sharewxid:seed.wxid},this.hold(function(err,doc){
			if(!doc){
				
			var list = {};
			helper.db.coll("lavico/hongbao/detail").find({sharewxid:seed.wxid}).sort({createTime:-1}).page(500,seed.page||1,this.hold(function(err,page){	
			if(page){
				list = page			
				nut.model.page = list;  
				var hongbaolist = list['docs'];
				var total_amount = 0;
				for (var i = 0; i < hongbaolist.length; i++) {
					total_amount = total_amount + hongbaolist[i]['amount'];
				}
				
				if(total_amount>0){
					//最高领取800元红包
					if(total_amount>800){					
						total_amount = 800;
					}
				var parm ='02';
				helper.db.coll("welab/customers").findOne({wechatid:seed.wxid},this.hold(function(err,customers){
					var customers = customers || {}
					if(customers.HaiLanMemberInfo && customers.HaiLanMemberInfo.memberID && customers.HaiLanMemberInfo.action == "bind"){
						middleware.request('Coupon/FetchCoupon',{
						    openid:seed.wxid,
						    PROMOTION_CODE:'CQL201409030057', //海澜CRM 活动代码，由 Promotions 接口返回
						    point:0,//每次摇一摇，消耗积分
						    memo:"微信婚庆红包",
						    otherPromId:"L",
						    parm:'01',
						    qty:total_amount
						},this.hold(function(err,doc){
							console.log(doc);
							var obj = eval("("+doc+")");
							if(obj.coupon_no!="null"){
							if(!err){
								
								helper.db.coll("lavico/hongbao/gift").insert({
								    "sharewxid": seed.wxid,
								    "amount":total_amount,
								    "createtime":new Date().getTime(),
								    "coupon_no":obj.coupon_no
								},function(err,doc){								

								
								});
							}
							}
						}))
					}else{
						middleware.request('Coupon/FetchCoupon',{
						    openid:seed.wxid,
						    PROMOTION_CODE:'CQL201409030057', //海澜CRM 活动代码，由 Promotions 接口返回
						    point:0,//每次摇一摇，消耗积分
						    memo:"微信婚庆红包",
						    otherPromId:"L",
						    parm:'02',
						    qty:total_amount
						},this.hold(function(err,doc){
							console.log(doc);
							var obj = eval("("+doc+")");
							if(obj.coupon_no!="null"){
							if(!err){
								
								helper.db.coll("lavico/hongbao/gift").insert({
								    "sharewxid": seed.wxid,
								    "amount":total_amount,
								    "createtime":new Date().getTime(),
								    "coupon_no":obj.coupon_no
								},function(err,doc){							
								
								});
							}
							}
						}))
					
					
					
					
					
					}
				}))
					
					
					
					

				
				
				}
				
			}else{

			}
			
			})) ;
				
				
				}
			
			
			
			}))
			

		}
    }, viewIn: function(){

        var timeid = setInterval(function(){
            if(typeof WeixinJSBridge =="undefined")
                return ;
	 clearTimeout(timeid) ;
         WeixinJSBridge.call('showOptionMenu');
	var img_url = "http://wx.lavicouomo.com/lavico/public/images/hongbao/share.jpg",
	url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx079e02ae6421c523&redirect_uri=http%3A%2F%2Fwx.lavicouomo.com%2Flavico%2Fhongbao%2Fhongbao%3Fsharewxid%3D"+$("#sharewxid").val()+"&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect",
	title = "LaVico婚庆季 红包“收”不停",
	content = "动动手指头 红包立马有！LaVico婚庆红包“收”不停！";
                // 朋友圈
		WeixinJSBridge.on('menu:share:timeline', function(argv){
                WeixinJSBridge.invoke('shareTimeline',{
                    "img_url":img_url,
                    "link":url,
                    "desc":title,
                    "title":content
                }, function(res) {
			alert("查找微信号”LaVico”或“朗维高”，关注朗维高微信平台，随时掌握红包金额增长情况,更有摇奖活动等你参加哦！");
			location='http://mp.weixin.qq.com/s?__biz=MjM5NjgwMzY2MQ==&mid=201071803&idx=1&sn=5e321b69e47bdf1f8e993c23ce2bcfdc#rd&ADUIN=451888737&ADSESSION=1409617470&ADTAG=CLIENT.QQ.5353_.0&ADPUBNO=26381';
                });
            });
    
		WeixinJSBridge.on('menu:share:appmessage', function(argv){
                WeixinJSBridge.invoke('sendAppMessage',{
                    "img_url":img_url,
                    "link":url,
                    "desc":content,
                    "title":title
                }, function(res) {
		alert("查找微信号”LaVico”或“朗维高”，关注朗维高微信平台，随时掌握红包金额增长情况,更有摇奖活动等你参加哦！");
		location='http://mp.weixin.qq.com/s?__biz=MjM5NjgwMzY2MQ==&mid=201071803&idx=1&sn=5e321b69e47bdf1f8e993c23ce2bcfdc#rd&ADUIN=451888737&ADSESSION=1409617470&ADTAG=CLIENT.QQ.5353_.0&ADPUBNO=26381';

                });
            });
    
    		WeixinJSBridge.on('menu:general:share', function(argv){
			var scene = 0;
			switch(argv.shareTo){
				case 'friend'  : scene = 1; break;
				case 'timeline': scene = 2; break;
				case 'weibo'   : scene = 3; break;
			}
			argv.generalShare({
				"appid"      : "",
				"img_url"    : img_url,
				"link"       : url,
				"desc"       : content,
				"title"      : title
			}, function(res){
			alert("查找微信号”LaVico”或“朗维高”，关注朗维高微信平台，随时掌握红包金额增长情况,更有摇奖活动等你参加哦！");
			location='http://mp.weixin.qq.com/s?__biz=MjM5NjgwMzY2MQ==&mid=201071803&idx=1&sn=5e321b69e47bdf1f8e993c23ce2bcfdc#rd&ADUIN=451888737&ADSESSION=1409617470&ADTAG=CLIENT.QQ.5353_.0&ADPUBNO=26381';
			});
		});
		



        },300) ;

	


	
		

	
	
	
	} 
}





