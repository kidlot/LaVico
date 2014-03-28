window.lookbook = {

    on: false,
    name: "",
    type: "",
    startDate: 0,
    stopDate: 0,
    page: [

    ]

    , save: function(){

        var oLinkOptions = {} ;
        oLinkOptions.data = [{name:'postData',value:JSON.stringify(this)},{name:'_id',value:$("#_id").val()}];
        oLinkOptions.type = "POST";
        oLinkOptions.url = "/lavico/lookbook/form:save";

        $.request(oLinkOptions,function(err,nut){
            if(err) throw err ;

            nut.msgqueue.popup() ;
            //$.controller("/lavico/lookbook/index",null,"lazy");
        }) ;
    }

    , addPage: function(oPage){

        var o = $(".pageList").find(".panel").eq(0).clone()
        o.find("input[type='text'],textarea").val("")
        o.find("img").attr("src","/lavico/public/images/u6.jpg")
        o.find(".productList").find(".panel:gt(0)").remove()
        o.click(function(){

        })
        $(".pageList").append(o)
        this.updateEvent(o)
        o.fadeIn()

        this.refreshCode();
        this.page.push({product:[{}]})
    }

    , addProduct: function(oButton){

        var o = $(oButton).prev().find(".panel").eq(0).clone()
        o.hide()
        o.find("input[type='text']").val("")
        o.find("img").attr("src","/lavico/public/images/u6.jpg")
        $(oButton).prev().append(o)
        o.fadeIn()
        this.updateEvent(o)

        this.refreshCode();

        var _id = lookbook._getPageProductID(oButton)
        this.page[parseInt(_id.pageId)].product.push({})
    }

    , refreshCode: function(){

        $(".pageList>.panel").each(function(i,o){
            $(o).find("code[class='page']").text(i)
            $(o).find("code[class='product']").each(function(ii,oo){
                $(oo).text(ii+1)
            })
        })
    }

    , updateEvent: function(o){

        $(o).find("input,select,textarea").change(function(e){

            var paramName = this.name.split(".")

            if(paramName.length == 1){
                window.lookbook[this.name] = $(this).val()
            }
            if(paramName.length == 2){
                var _id = lookbook._getPageProductID(this)
                window.lookbook.page[parseInt(_id.pageId)][paramName[1]] = $(this).val()
            }
            if(paramName.length == 3){
                var _id = lookbook._getPageProductID(this)
                window.lookbook.page[parseInt(_id.pageId)].product[parseInt(_id.productId)][paramName[2]] = $(this).val()
            }
        })

        $(o).find(".glyphicon-remove").click(function(){

            var oPanel = $(this).parents(".panel").eq(0)
            oPanel.fadeOut('normal', function() {
                oPanel.remove()
                lookbook.refreshCode()
            });

            var _id = lookbook._getPageProductID(this)
            if(!isNaN(_id.productId)){
                lookbook.page[_id.pageId].product.splice(_id.productId,1)
            }else{
                lookbook.page.splice(_id.pageId)
            }
        })
        $(o).find(".glyphicon-chevron-down").click(function(){

            var oPanel = $(this).parents(".panel").eq(0)
            oPanel.next().after(oPanel)
            lookbook.refreshCode()
        })
        $(o).find(".glyphicon-chevron-up").click(function(){

            var oPanel = $(this).parents(".panel").eq(0)
            oPanel.prev().before(oPanel)
            lookbook.refreshCode()
        })
    }

    , _getPageProductID: function(oButton){

        var pageId = $(oButton).parents("div.pagePanel").find("code[class='page']").text()
        var productId = $(oButton).parents("div.productPanel").find("code[class='product']").text()

        return {pageId:parseInt(pageId)-1, productId:parseInt(productId)-1}
    }
}

lookbook.addPage()