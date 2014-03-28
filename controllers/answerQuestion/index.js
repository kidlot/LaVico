module.exports={
    layout:null,
    view:"lavico/templates/answerQuestion/index.html",
    process:function(seed,nut){
        this.req.session.valName="aa";
    }

}