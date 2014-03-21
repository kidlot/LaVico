module.exports={
    layout:null,
    view:"lavico/templates/AnswerQuestion/test.html",
    process:function(seed,nut){
        nut.write("<script>alert('ok');location.href='http://www.baidu.com'</script>");
    }
}