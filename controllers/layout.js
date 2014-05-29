/**
 * Created by A on 5/5/14.
 * LAYOUT
 */
module.exports = {
    layout: null,
    view: "lavico/templates/layout.html",
    process: function (seed, nut) {

    },
    viewIn:function(){

        /*掩藏分享按钮Start*/
        function onBridgeReady(){
            document.addEventListener('WeixinJSBridgeReady', function onBridgeReady()  {
                WeixinJSBridge.call('hideOptionMenu');
            });
        }
        function hideShareButton(){
            if (typeof WeixinJSBridge == "undefined"){
                if( document.addEventListener ){
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                }else if (document.attachEvent){
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            }else{
                onBridgeReady();
            }
        }
        /*掩藏分享按钮End*/
    }
}