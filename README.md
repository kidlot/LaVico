## 关于用户信息记录的说明

#一共三个地方
- lavico/user/log 表 。这里存的是最详细的操作记录。如 XX时间第一次砍价，XX时间第二次砍价。XX时间成交（三条记录）
- welab/feeds 表。 用来存储可以在welab里“动态”中可以看到的消息  。如 XX人今天砍价了，您是不是也要来？。“记录注册，绑定，解绑的事件”
- welab/customers 表。 不同模块创建一个数组类型的字段，用于方便模块的统计页面。如 精英搭配  lookbook:[{name:'衣服',createDate:1111111},{},{}]


<h2>welab/customers 表说明</h2>
<b>David.xu负责编辑</b><br/>
registerTime 注册时间:绑定and注册时间写入 单位是毫秒<br/>
unRegisterTime 注销绑定时间：取消时写入 单位是毫秒<br/>
isRegister 是否注册：绑定、注册时写入true。解绑时false 单位是布尔值<br/>

注册时间：registerTime 单位是毫秒<br/>
姓名：realname<br/>
用户ID: _id<br/>
微信ID: wechatid<br/>
微信头像地址:headimgurl<br/>
关注时间:followTime<br/>
最近会话时间:lastMessageTime<br/>
会话数:messageCount<br/>
标签:tags<br/>
备注：remarks<br/>
性别：gender     值：male/female<br/>
生日：birthday   单位是毫秒<br/>
手机号码：mobile<br/>
关注时间: followTime 单位是秒<br/>
isFollow:true/false<br/>
排名：ranking?<br/>
邮箱：email<br/>
行业：profession<br/>
所属省份：province<br/>
所属城市：city<br/>
具体地址：address<br/>
喜好款式：favoriteStyle<br/>
喜好颜色：favoriteColor<br/>
最近修改时间：lastModified 单位是毫秒<br/>
会员绑定情况：HaiLanMemberInfo<br/>
	     {<br/>
		//HaiLanMemberInfo<br/>
	        创建时间：createTime 单位是毫秒<br/>
		会员ID: memberID<br/>
		绑定卡号：memberCardNumber<br/>
		会员卡类型：type 值：1，2，3<br/>
		//1：白卡<br/>
		//2：VIP卡<br/>
		//3：白金VIP卡<br/>
 	        绑定状态识别： action 值：bind,unbind<br/>
		//bind:绑定状态<br/>
		//unbind:解绑状态<br/>
		}<br/>
摇一摇活动：shake记录<br/>
{<br/>
   0:{<br/>
      "aid": "536f35d08a79fdec096fe1ff",活动ID<br/>
      "uid": "oTVLcjkJrVNhwsUyYBxYHn-NU_Qc",微信ID<br/>
      "points": NumberInt(0),消耗积分<br/>
      "memberID": NumberInt(16426780),会员memberID<br/>
      "createDate": 1402970887391,获取时间<br/>
      "memo": "来张优惠券",备注<br/>
      "promotion_code": "CQL201404010004"，活动号码<br/>
      "promotion_name": "返店券",券名称<br/>
      "promotion_desc": "无限制现金券通用活动",券描述<br/>
      "promotion_qty": "500",券金额<br/>
      "display_name": "现金券",后台设置的显示的名称<br/>
      "lottery_chance": "90",当前券的获取概率（最大为100）<br/>
      "coupon_no": "AV1404016103"券号码<br/>
   },<br/>
   1:{},<br/>
   2:{},<br/>
   ...<br/>
}<br/>

<h2>lavico/user/logs表</h2>
所有日后可能产生数据统计需求的地方，都要预先把数据记录到lavico/user/logs表中。

必填字段 createTime,wxid,action,data(对象)

helper.db.coll("lavico/user/logs").insert({createTime:new Date().getTime(),wxid:seed.wxid,action:"侃价交易成功",data:{prodoctID:seed._id}}, (err, doc)->)


数据库：

lavico/activity： 记录所有的优惠券的信息，需要从远端拉取出。
<h2>lavico/user/lastId表</h2>
<b>David.xu负责编辑</b><br/>

自动更新用户会员信息的记录
David.xu编辑

<h2>关于“解绑失败”或者获取优惠券“找不到对应的人员，请检查”的问题</h2>
<b>David.xu负责编辑</b><br/>

此问题往往就是，welab保存的用户信息（绑定memberID的信息），没有和朗维高CRM数据库同步。

如何解决？

可以先帮此用户解绑，然后重新绑定。


