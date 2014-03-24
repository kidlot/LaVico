module.exports={
    layout:null,
    view:"lavico/templates/score/index.html",
    process:function(seed,nut){
        this.req.session.valName="aa";
    }

}