/**
 * Created by David Xu on 3/14/2014.
 * 会员 - 我的会员卡 - 收藏清单
 * controllers/member/card_member/info.js
 */

var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:null,

    view:'lavico/templates/member/card_member/info.html',

    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : '1237';//预先定义微信ID
        nut.model.wxid = wxid ;

    },

    viewIn:function(){

        $('#submit').click(function(){

            var realname = $('#realname').val();
            var gender = $('#gender').val();
            var birthday = $('#birthday').val();
            var mobile = $('#mobile').val();
            var email = $('#email').val();
            var profession = $('#profession').val();
            var province = $('#province').val();
            var city = $('#city').val();
            var address = $('#address').val();
            var favoriteStyle = $('#favoriteStyle').val();
            var favoriteColor = $('#favoriteColor').val();

            $.ajax({
                url:'/lavico/member/card_member/info:Modified',
                type:'POST',
                data:{
                    'realname':realname,
                    'gender':gender,
                    'birthday':birthday,
                    'mobile':mobile,
                    'email':email,
                    'profession':profession,
                    'province':province,
                    'city':city,
                    'address':address,
                    'favoriteStyle':favoriteStyle,
                    'favoriteColor':favoriteColor,
                }}).done(function(data){
                    console.log(data);
                });


        });
    },

    actions:{
        Modified:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disabled = true ;
                console.log(seed.realname);
                helper.db.coll('welab/customers').insert({
                    'realname':seed.realname,
                    'gender':seed.gender,
                    'birthday':seed.birthday,
                    'mobile':seed.mobile,
                    'email':seed.email,
                    'profession':seed.profession,
                    'province':seed.province,
                    'city':seed.city,
                    'address':seed.address,
                    'favoriteStyle':seed.favoriteStyle,
                    'favoriteColor':seed.favoriteColor,
                },function(err, doc){

                });

            }
        }
    }

}