window.lookbook = {

    on: false,
    name: "",
    type: "",
    startDate: 0,
    stopDate: 0,
    sumProduct:0,
    page: [

    ]

    , save: function(){

        var oLinkOptions = {} ;
        oLinkOptions.data = [{name:'postData',value:JSON.stringify(this.getData())},{name:'_id',value:$("#_id").val()}];
        oLinkOptions.type = "POST";
        oLinkOptions.url = "/lavico/lookbook/form:save";

        $.request(oLinkOptions,function(err,nut){
            if(err) throw err ;

            if(nut.msgqueue[0].type=="success"){
                $.controller("/lavico/lookbook/index",null,"lazy");
            }else{
                nut.msgqueue.popup() ;
            }
        }) ;
    }

    , getData: function(){

        var postData = {}
        for(var o in this){

            if(typeof(this[o]) != "function" && o!="pic"){
                postData[o] = this[o]
            }
        }
        return postData
    }
    , addPage: function(oPage){

        var o = $(".pageList").find(".panel").eq(0).clone()
        o.find(".productList").find(".panel:gt(0)").remove()
        o.click(function(){

        })

        // data
        if(oPage){
            o.find("input[name='page.name']").val(oPage.name)
            o.find("textarea").val(oPage.detail)
            o.find("img").eq(0).attr("src",oPage.pic)

            this.page.push({pic:oPage.pic,name:oPage.name,detail:oPage.detail,_id:oPage._id,product:[]})
        }else{
            o.find("input[type='text'],textarea").val("")
            o.find("img").eq(0).attr("src","/lavico/public/images/u6.jpg")

            this.page.push({pic:undefined,name:undefined,detail:undefined,_id:this.__id(),product:[]})
        }


        $(".pageList").append(o)


        this.updateEvent(o)
        o.fadeIn()

        this.refreshCode();

        o.addProduct = function(){
            lookbook.addProduct(o.find(".addProduct"))
        }
        return o;
    }

    , addProduct: function(params){

        this.sumProduct ++

        // params = event 增加一个空产品,params为BUTTON
        // params = number 增加一个带内容的产品 arguments1 page数 arguments2 product数 arguments3 数据
        if(typeof(params) == "number"){

            var o = $(".pageList > .panel").eq(params+1).find(".productList > .panel").eq(0).clone()
            var productDiv = $(".pageList > .panel").eq(params+1).find(".productList")
            this.page[arguments[0]].product.push(arguments[2])

            o.find("input[name='page.product.name']").val(arguments[2].name)
            o.find("textarea").val(arguments[2].detail)
            o.find("img").eq(0).attr("src",arguments[2].pic)

            if(arguments[2].bigPic){
                for(var i=0 ; i<arguments[2].bigPic.length;i++){
                    lookbook.createProductBigPic(o,arguments[2].bigPic[i])
                }
            }
        }else{
            var o = params.prev().find(".panel").eq(0).clone()
            var _id = lookbook._getPageProductID(params)
            this.page[parseInt(_id.pageId)].product.push({pic:undefined,name:undefined,detail:undefined,_id:this.__id()})
            var productDiv = params.prev()

            o.find("input[type='text']").val("")
            o.find("img").eq(0).attr("src","/lavico/public/images/u6.jpg")
        }

        o.hide()
        productDiv.append(o)
        o.fadeIn()
        this.updateEvent(o)

        this.refreshCode();


    }

    , createProductBigPic: function(button){

        if(arguments.length == 1){
            var oPanel = $(button).next().find(".rowProductBigPic").eq(0).clone()
            oPanel.show()
            oPanel.attr("_num",$(button).next().find(".rowProductBigPic").length)
            $(button).next().append(oPanel)
//
            var _id = lookbook._getPageProductID($(button))
            lookbook.page[_id.pageId].product[_id.productId].bigPic = lookbook.page[_id.pageId].product[_id.productId].bigPic || []
            lookbook.page[_id.pageId].product[_id.productId].bigPic.push({"pic":""})
        }else{

            var oProduct = button
            var oPanel = oProduct.find(".rowProductBigPic").eq(0).clone()
            oPanel.show()
            oPanel.attr("_num",oProduct.find(".rowProductBigPic").length)
            oPanel.find("img").attr("src",arguments[1].pic)
            oProduct.find(".productBigPic").append(oPanel)
        }

    }

    , removeProductBigPic: function(button){

        var oPanel = $(button).parents(".rowProductBigPic")
        oPanel.fadeOut('normal', function() {

            var _id = lookbook._getPageProductID($(button))
            lookbook.page[_id.pageId].product[_id.productId].bigPic.splice(parseInt(oPanel.attr("_num"))-1,1)

            var productBigPic = $(button).parents(".productBigPic")
            oPanel.remove()

            productBigPic.find(".rowProductBigPic").each(function(i,o){

                $(o).attr("_num",i)
            })


        });

    }

    , __id: function(){
        return new Date().getTime().toString() + parseInt(Math.random() * 100000000)
    }
    , refreshCode: function(){

        $(".pageList>.panel").each(function(i,o){
            $(o).find("code[class='page']").text(i)
            $(o).find("code[class='product']").each(function(ii,oo){
                $(oo).text(ii)
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
                var _id = lookbook._getPageProductID($(this))
                window.lookbook.page[parseInt(_id.pageId)][paramName[1]] = $(this).val()
            }
            if(paramName.length == 3){
                var _id = lookbook._getPageProductID($(this))
                window.lookbook.page[parseInt(_id.pageId)].product[parseInt(_id.productId)][paramName[2]] = $(this).val()
            }
        })

        $(o).find(".removeButton").click(function(){

            var oPanel = $(this).parents(".panel").eq(0)
            oPanel.fadeOut('normal', function() {
                oPanel.remove()
                lookbook.refreshCode()
            });

            var _id = lookbook._getPageProductID($(this))
            if(!isNaN(_id.productId)){
                lookbook.page[_id.pageId].product.splice(_id.productId,1)
            }else{
                lookbook.page.splice(_id.pageId)
            }
        })
        $(o).find(".glyphicon-chevron-down").click(function(){


            var oPanel = $(this).parents(".panel").eq(0)


            // 向下移动数据
            var oPanelCode = oPanel.find("code");

            // 产品
            if(oPanelCode.length == 1){
                var nowRowProduce = parseInt(oPanelCode.eq(0).text());
                var nowRowPage = parseInt($(this).parents(".pagePanel").find("code").eq(0).text())

                var tmpRow = lookbook.page[nowRowPage-1].product[nowRowProduce-1];
                lookbook.page[nowRowPage-1].product.splice(nowRowProduce-1,1);
                lookbook.page[nowRowPage-1].product.splice(nowRowProduce,0,tmpRow);
            }else{
                // page
                var nowRow = parseInt(oPanelCode.eq(0).text());

                var tmpRow = lookbook.page[nowRow-1];
                lookbook.page.splice(nowRow-1,1);
                lookbook.page.splice(nowRow,0,tmpRow);
            }


            // 移动DIV
            oPanel.next().after(oPanel)
            lookbook.refreshCode()

        })
        $(o).find(".glyphicon-chevron-up").click(function(){

            var oPanel = $(this).parents(".panel").eq(0)


            // 向上移动数据
            var oPanelCode = oPanel.find("code");

            // 产品
            if(oPanelCode.length == 1){
                var nowRowProduce = parseInt(oPanelCode.eq(0).text());
                var nowRowPage = parseInt($(this).parents(".pagePanel").find("code").eq(0).text())

                var tmpRow = lookbook.page[nowRowPage-1].product[nowRowProduce-1];
                lookbook.page[nowRowPage-1].product.splice(nowRowProduce-1,1);
                lookbook.page[nowRowPage-1].product.splice(nowRowProduce-2,0,tmpRow);
            }else{
                // page
                var nowRow = parseInt(oPanelCode.eq(0).text());

                var tmpRow = lookbook.page[nowRow-1];
                lookbook.page.splice(nowRow-1,1);
                lookbook.page.splice(nowRow-2,0,tmpRow);
            }

            oPanel.prev().before(oPanel)
            lookbook.refreshCode()
        })
    }

    , _getPageProductID: function(oButton){

        var pageId = oButton.parents("div.pagePanel").find("code[class='page']").text()
        var productId = oButton.parents("div.productPanel").find("code[class='product']").text()

        return {pageId:parseInt(pageId)-1, productId:parseInt(productId)-1}
    }
}

window.onload = function(){


    $("input,select,textarea").change(function(e){

        if(this.name == "startDate"){
            window.lookbook[this.name] = new Date($(this).val() + " 00:00:00").getTime()
        }else if(this.name == "stopDate"){
            window.lookbook[this.name] = new Date($(this).val() + " 23:59:59").getTime()
        }else{
            window.lookbook[this.name] = $(this).val()
        }
    })

    var formData = JSON.parse($("#jsonDoc").text())
    if( formData.on != undefined){
        if(formData.page){
            for (var i=0;i<formData.page.length;i++)
            {
                lookbook.addPage(formData.page[i])
                for (var ii=0;ii<formData.page[i].product.length;ii++)
                {

                    lookbook.addProduct(i,ii,formData.page[i].product[ii])
                }
            }

            $("select[name='type']").val(formData.type)
            if(formData.on){

                $(".switch-animate").removeClass("switch-on")
                $(".switch-animate").addClass("switch-off")
            }else{

                $(".switch-animate").removeClass("switch-off")
                $(".switch-animate").addClass("switch-on")
            }
            lookbook.name = formData.name
            lookbook.detail = formData.detail
            lookbook.startDate = formData.startDate
            lookbook.stopDate = formData.stopDate
            lookbook.type = formData.type
            lookbook.on = formData.on
        }
    }else{
        lookbook.addPage().addProduct()
    }
}
