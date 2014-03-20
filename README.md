

<h2>welab/customers 表说明</h2>
注册时间：registerTime 单位是毫秒<br/>
姓名：realname<br/>
用户ID: _id<br/>
微信ID: wxid<br/>
性别：gender     值：male/female<br/>
生日：birthday   单位是毫秒 getTime（）<br/>
手机号码：mobile<br/>
关注时间: followTime 单位是秒<br/>
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
		绑定修改时间：lastModified 单位是毫秒<br/>
		}<br/>
//字段若有问题，请及时在群里讨论<br/>

申请绑定-测试链接：
http://127.0.0.1:8080/lavico.middleware/MemberBind?openid=oBf_qJTu0Vn5nFlXFSVpCIbKIk8o&MOBILE_TELEPHONE_NO=18616845116&MEM_OLDCARD_NO=L201403191126&MEM_PSN_CNAME=徐大卫


解除绑定-测试链接：http://127.0.0.1:8080/lavico.middleware/MemberUnbind?openid=oBf_qJTu0Vn5nFlXFSVpCIbKIk8o&MEMBER_ID=9123084

