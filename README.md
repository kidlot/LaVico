

welab/customers 表说明
注册时间：registerTime 单位是毫秒
姓名：realname
用户ID: _id
微信ID: wxid
性别：gender     值：male/female
生日：birthday   单位是毫秒 getTime（）
手机号码：mobile
关注时间: followTime 单位是秒
邮箱：email
行业：profession
所属省份：province
所属城市：city
具体地址：address
喜好款式：favoriteStyle
喜好颜色：favoriteColor
最近修改时间：lastModified 单位是毫秒
会员绑定情况：HaiLanMemberInfo
	     {
		//bindInfo内字段说明
	        创建时间：createTime 单位是毫秒
		会员ID: memberID
		绑定卡号：memberCardNumber
		会员卡类型：type 值：1，2，3
		//1：白卡
		//2：VIP卡
		//3：白金VIP卡
 	        绑定状态识别： action 值：bind,unbind
		//bind:绑定状态
		//unbind:解绑状态
		绑定修改时间：lastModified 单位是毫秒
		}
//字段若有问题，请及时在群里讨论