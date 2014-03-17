
module.exports = {
    layout:null,
    view:'lavico/templates/member/card_blank/index.html',
    process:function(seed,nut){
        nut.model.wxid = seed.wxid;
    },
    viewIn:function(){
        var wxid = $('#wxid').val();
        $('#register').click(function(){
            window.location.href='/lavico/member/card_blank/register?wxid='+wxid;
        });
        $('#bind').click(function(){
            window.location.href='/lavico/member/card_blank/bind?wxid='+wxid;
        });
        $('#store').click(function(){
            window.location.href='/lavico/member/card_member/store/index?wxid='+wxid;
        });
    }
}