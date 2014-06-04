var middleware = require('lavico/lib/middleware.js');//引入中间件

module.exports = {

    layout:'lavico/layout',

    view:'lavico/templates/member/card_member/info.html',

    process:function(seed, nut){

        var wxid = seed.wxid ? seed.wxid : 'undefined';//预先定义微信ID
        this.step(function(){
            if(wxid == 'undefined'){
                nut.disable();//不显示模版
                this.res.writeHead(200, { 'Content-Type': 'application/json' });
                this.res.write('{"error":"wxid_is_empty"}');
                this.res.end();
                this.terminate();
            }
        });
        this.step(function(){
            helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err, doc){
                if(!doc){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"error":"wxid_no_bind_to_welab"}');
                    this.res.end();
                    this.terminate();
                }
            }));
        });
        this.step(function(){
            nut.model.wxid = wxid;
            nut.model.memberUrl = "/lavico/member/index?wxid="+wxid;
        });
        this.step(function(){
          helper.db.coll('welab/customers').findOne({wechatid:wxid},this.hold(function(err,doc){
            if(doc){

              /*查找用户，记录用户的memberID*/
              if(doc.HaiLanMemberInfo && doc.HaiLanMemberInfo.memberID){
                  nut.model.memberID = doc.HaiLanMemberInfo.memberID;
              }else{
                  //如果还不存在，一般不可能发生这种情况
                  nut.disable();//不显示模版
                  this.res.writeHead(200, { 'Content-Type': 'application/json' });
                  this.res.write('{"error":"memberID_no_found"}');
                  this.res.end();
                  this.terminate();
              }
              nut.model.mobile = doc.mobile ? doc.mobile : '';
              nut.model.realname = doc.realname ? doc.realname : '';
              if(doc.birthday){
                  var date =  new Date(parseInt(doc.birthday));
                  nut.model.birthday_year = date.getFullYear() + '年';
                  nut.model.birthday_month = (date.getMonth() + 1) + '月';
                  nut.model.birthday_date = date.getDate() +'日';
              }else{
                  nut.model.birthday_year = '1970年';
                  nut.model.birthday_month = '1月';
                  nut.model.birthday_date = '1日';
              }

              if(doc.gender){
                 nut.model.gender = (doc.gender && doc.gender == 'male') ? '男' : ((doc.gender && doc.gender == 'female') ? '女' : '' );
              }else{
                 nut.model.gender = '男';
              }

              nut.model.is_send = 1;            
            }
            /*其他个人信息，也就是需要审核的信息*/
            /*
            * 电子邮件：email
            * 行业：profession
            * 所属省份：province
            * 所属城市：city
            * 具体地址：address
            * 喜好款式：favoriteStyle
            * 喜好颜色：favoriteColor
            * */

            if(doc.hasOwnProperty('email')){
                //电子邮件
                nut.model.email = doc.email;
            }else{
                nut.model.email = '';
            }

            if(doc.hasOwnProperty('profession')){
                //行业
                nut.model.profession = doc.profession;
            }else{
                nut.model.profession = '请选择行业';
            }

            if(doc.hasOwnProperty('province')){
                //所属省份
                nut.model.province = doc.province;
            }else{
                nut.model.province = '请选择';
            }

            if(doc.hasOwnProperty('city')){
                //所属城市
                nut.model.city = doc.city;
            }else{
                nut.model.city = '请选择';
            }

            if(doc.hasOwnProperty('address')){
                //具体地址
                nut.model.address = doc.address;
            }else{
                nut.model.address = '';
            }

            if(doc.hasOwnProperty('favoriteStyle')){
                //喜好款式
                nut.model.favoriteStyle = doc.favoriteStyle;
            }else{
                nut.model.favoriteStyle = '请选择';
            }

            if(doc.hasOwnProperty('favoriteColor')){
                //喜好颜色
                nut.model.favoriteColor = doc.favoriteColor;
            }else{
                nut.model.favoriteColor = '';
            }

          }));
        });

    },

    viewIn:function(){

        $('#loading').hide();//隐藏加载框

        /*掩藏分享按钮*/
        window.hideShareButtion.on();

        /*设计前端JS*/
        if($("#profession").val()=='请选择行业'){
            $("#select_profession").parent().find("input").val($("#select_profession").val());
        }

        if($("#select_favoriteStyle").val()=='请选择'){
            $("#select_favoriteStyle").parent().find("input").val($("#select_favoriteStyle").val());
        }

        $("#select_profession").change(function(){
            $(this).parent().find("input").val($(this).val());
        });

        $("#select_profession").click(function(){
            $(this).parent().find("input").val($(this).val());
        });

        $("#select_favoriteStyle").change(function(){
            $(this).parent().find("input").val($(this).val());
        });

        $("#select_favoriteStyle").click(function(){
            $(this).parent().find("input").val($(this).val());
        });

        $(".goon_btn").click(function(){
            $(".fade2").css("display","none");
        });

        $("#email").blur(function(){
            var email = $(this).val();
            if(!email || !/^[a-zA-Z0-9_\.]+@[a-zA-Z0-9-]+\.[a-zA-Z]+$/.test(email)){
                window.popupStyle2.on("邮箱格式错误",function(event){});
                return false;
            }
        });

        $('#goon_btn').click(function(){
            window.location.href ="/lavico/member/index?wxid="+$('#wxid').val();
        });

        /*省市联动效果*/
        var province = document.getElementById('select_province');
        var province_input = document.getElementById('province');
        var city     = document.getElementById('select_city');
        /*设置默认数值*/
        if($("#province").val()=='请选择'){
            //请选择
            $("#province").val("北京市");
        }
        if($("#city").val()=='请选择'){
            //请选择
            $("#city").val("北京市");
        }

        //省份
        var provinceArr = [];
        provinceArr[0] = ['北京市'];
        provinceArr[1] = ['天津市'];
        provinceArr[2] = ['上海市'];
        provinceArr[3] = ['重庆市'];
        provinceArr[4] = ['河北省'];
        provinceArr[5] = ['河南省'];
        provinceArr[6] = ['云南省'];
        provinceArr[7] = ['辽宁省'];
        provinceArr[8] = ['黑龙江省'];
        provinceArr[9] = ['湖南省'];
        provinceArr[10] = ['安徽省'];
        provinceArr[11] = ['山东省'];
        provinceArr[12] = ['新疆维吾尔自治区'];
        provinceArr[13] = ['江苏省'];
        provinceArr[14] = ['浙江省'];
        provinceArr[15] = ['江西省'];
        provinceArr[16] = ['湖北省'];
        provinceArr[17] = ['广西壮族自治区'];
        provinceArr[18] = ['甘肃省'];
        provinceArr[19] = ['山西省'];
        provinceArr[20] = ['内蒙古自治区'];
        provinceArr[21] = ['陕西省'];
        provinceArr[22] = ['吉林省'];
        provinceArr[23] = ['福建省'];
        provinceArr[24] = ['贵州省'];
        provinceArr[25] = ['广东省'];
        provinceArr[26] = ['青海省'];
        provinceArr[27] = ['西藏'];
        provinceArr[28] = ['四川省'];
        provinceArr[29] = ['宁夏回族自治区'];
        provinceArr[30] = ['海南省'];
        provinceArr[31] = ['台湾省'];
        provinceArr[32] = ['香港特别行政区'];
        provinceArr[33] = ['澳门特别行政区'];

        //市县,每个数组第一个元素为省份,其他的为这个省份下的市县
        var cityArr = [];
        cityArr[0] = ['北京市','北京市'];
        cityArr[1] = ['天津市','天津市'];
        cityArr[2] = ['上海市','上海市'];
        cityArr[3] = ['重庆市','重庆市'];
        cityArr[4] = ['河北省','石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'];
        cityArr[5] = ['河南省','郑州市','开封市','洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '济源市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'];
        cityArr[6] = ['云南省','昆明市',' 曲靖市','玉溪市','保山市','昭通市','丽江市','思茅市','临沧市','楚雄彝族自治州','红河哈尼族彝族自治州','文山壮族苗族自治州','西双版纳傣族自治州','大理白族自治州','德宏傣族景颇族自治州','怒江傈僳族自治州','迪庆藏族自治州'];
        cityArr[7] = ['辽宁省','沈阳市' ,'大连市' ,'鞍山市' ,'抚顺市' ,'本溪市' ,'丹东市' ,'锦州市' ,'营口市' ,'阜新市' ,'辽阳市' ,'盘锦市' ,'铁岭市' ,'朝阳市' ,'葫芦岛市'];
        cityArr[8] = ['黑龙江省','哈尔滨市','齐齐哈尔市','鸡西市','鹤岗市','双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'];
        cityArr[9] = ['湖南省','长沙市', '株洲市','湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'];
        cityArr[10] = ['安徽省','合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市','阜阳市','宿州市', '巢湖市', '六安市', '亳州市', '池州', '宣城市'];
        cityArr[11] = ['山东省','济南市','青岛市','淄博市','枣庄市','东营市','烟台市','潍坊市','济宁市','泰安市','威海市','日照市','莱芜市','临沂市','德州市','聊城市','滨州市','菏泽市'];
        cityArr[12] = ['新疆维吾尔自治区','乌鲁木齐市', '克拉玛依市', '吐鲁番地区', '哈密地区', '昌吉回族自治州 ', '博尔塔拉蒙古自治州 ', '巴音郭楞蒙古自治州 ', '阿克苏地区', '克孜勒苏柯尔克孜自治州 ', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市' ];
        cityArr[13] = ['江苏省','南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市' ];
        cityArr[14] = ['浙江省','杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'];
        cityArr[15] = ['江西省','南昌市','景德镇市','萍乡市','九江市','新余市','鹰潭市','赣州市','吉安市','宜春市','抚州市','上饶市'];
        cityArr[16] = ['湖北省','武汉市','黄石市','十堰市', '宜昌市', '襄樊市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州','仙桃市', '潜江市', '天门市', '神农架林区'];
        cityArr[17] = ['广西壮族自治区','南宁市','柳州市','桂林市','梧州市','北海市','防城港市','钦州市','贵港市','玉林市','百色市','贺州市','河池市','来宾市','崇左市'];
        cityArr[18] = ['甘肃省','兰州市','嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'];
        cityArr[19] = ['山西省','太原市','大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市' ];
        cityArr[20] = ['内蒙古自治区','呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟' ];
        cityArr[21] = ['陕西省','西安市','铜川市','宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市' ];
        cityArr[22] = ['吉林省','长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'];
        cityArr[23] = ['福建省','福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市' ];
        cityArr[24] = ['贵州省','贵阳市','六盘水市', '遵义市', '安顺市', '铜仁地区', '黔西南布依族苗族自治州', '毕节地区', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'];
        cityArr[25] = ['广东省','广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','梅州市','汕尾市','河源市','阳江市','清远市','东莞市','中山市','潮州市','揭阳市','云浮市'];
        cityArr[26] = ['青海省','西宁市' ,'海东地区', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'];
        cityArr[27] = ['西藏','拉萨市','昌都地区', '山南地区', '日喀则地市', '那曲地区', '阿里地区', '林芝地区' ];
        cityArr[28] = ['四川省','成都市','自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'];
        cityArr[29] = ['宁夏回族自治区','银川市','石嘴山市','吴忠市','固原市','中卫市'];
        cityArr[30] = ['海南省','海口市','三亚市','五指山市', '琼海市', '儋州市', '文昌市', '万宁市', '东方市', '定安县', '屯昌县', '澄迈县', '临高县', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县' ];
        cityArr[31] = ['台湾省','台北市', '高雄市', '基隆市', '台中市', '台南市', '新竹市', '嘉义市'];
        cityArr[32] = ['香港特别行政区','中西区', '湾仔区', '东区', '南区', '油尖旺区', '深水埗区', '九龙城区', '黄大仙区', '观塘区', '荃湾区', '葵青区', '沙田区', '西贡区', '大埔区', '北区', '元朗区', '屯门区', '离岛区' ];
        cityArr[33] = ['澳门特别行政区','澳门'];

        //生成省份
        for(var key in provinceArr) {
            var provinceOption = document.createElement('option');
            provinceOption.value = provinceOption.text = provinceArr[key];
            province.options.add(provinceOption);

        }

        //省份改变市'
        $("#select_province").click(function(){
            $(this).parent().find("input").val($(this).val());
            $('#select_city').empty();
            var _value = $(this).val();
            for(var _i = 0;_i < cityArr.length; _i ++){
                if(_value == cityArr[_i][0]){
                    var _cityArr = cityArr[_i];
                    for(var _j = 1; _j < _cityArr.length;_j++){
                        if(_j == 1){
                            $('#city').val(_cityArr[1]);
                        }

                        $("#select_city").prepend("<option value='"+_cityArr[_j]+"'>"+_cityArr[_j]+"</option>")
                    }
                }
            }
        });
        $("#select_province").change(function(){
            $(this).parent().find("input").val($(this).val());
            $('#select_city').empty();
            var _value = $(this).val();
            for(var _i = 0;_i < cityArr.length; _i ++){
                if(_value == cityArr[_i][0]){
                    var _cityArr = cityArr[_i];
                    for(var _j = 1; _j < _cityArr.length;_j++){
                        if(_j == 1){
                            $('#city').val(_cityArr[1]);
                        }

                        $("#select_city").prepend("<option value='"+_cityArr[_j]+"'>"+_cityArr[_j]+"</option>")
                    }
                }
            }
        });
        $("#select_city").click(function(){
            $(this).parent().find("input").val($(this).val());
        });
        $("#select_city").change(function(){
            $(this).parent().find("input").val($(this).val());
        });

        /*后端开发JS*/
        $('#submit').click(function(){

            var email = $('#email').val();
            var profession = $('#profession').val();
            var province = $('#province').val();
            var city = $('#city').val();
            var address = $('#address').val();
            var favoriteStyle = $('#favoriteStyle').val();
            var favoriteColor = $('#favoriteColor').val();
            var wxid = $("#wxid").val();

            if(!email || !/^.+@.+\..+$/.test(email)){
              window.popupStyle2.on("邮箱格式错误",function(event){});
              return false;
            }
            if(!profession || profession == "请选择行业"){
              window.popupStyle2.on("请输入行业",function(event){});
              return false;
            }

            if(!province || province =="请选择"){
              //alert('请输入省份');
              window.popupStyle2.on("请输入省份",function(event){});
              return false;
            } 
            if(!city || province =="请选择"){
              window.popupStyle2.on("请输入城市",function(event){});
              return false;
            } 
            if(!address){
              window.popupStyle2.on("请输入地址",function(event){});
              return false;
            }
            if(!(/[\u4e00-\u9fa5]{3,}/).test(address)){
                //判断是否为汉字
                window.popupStyle2.on("请输入有效的地址,至少三个汉字",function(event){});
                return false;
            }
            if(!favoriteStyle){
                window.popupStyle2.on("请输入喜好款式",function(event){});
                return false;
            } 
            if(!favoriteColor){
                window.popupStyle2.on("请输入喜欢颜色",function(event){});
                return false;
            }

            if(!(/[\u4e00-\u9fa5]+/).test(favoriteColor)){
                //判断是否为汉字
                window.popupStyle2.on("请输入有效的颜色，如黑色",function(event){});
                return false;
            }

            $("#loading").show();
            $.get('/lavico/member/card_member/info:Modified',
              {
                'wxid':wxid,
                'email':email,
                'profession':profession,
                'province':province,
                'city':city,
                'address':address,
                'favoriteStyle':favoriteStyle,
                'favoriteColor':favoriteColor,
                'memberID':$('#memberID').val()
              },
              function(data){
                $("#loading").hide();

                if(data.success == true){

                  window.popupStyle2.on("提交成功，积分将在信息审核通过后发放到您的账户中",function(event){
                      window.location.href="/lavico/member/index?wxid="+wxid;
                  });

                }else if(data.success == false){
                   if((/[\u4e00-\u9fa5]+/).test(data.info)){
                       //如果输出的是汉字
                      //alert(data.info);
                      window.popupStyle2.on(data.info,function(event){});

                   }else if(data.info == 'missing_parameter'){
                      window.popupStyle2.on("提交失败，请稍后再尝试，有可能丢失参数",function(event){});
                   }else{
                      window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                   }

                }else{
                  window.popupStyle2.on("网络不稳定，请稍后再尝试",function(event){});
                }
            });
        });
    },

    actions:{
        /*自动更新个人资料*/
        updateUserInfo:{
            layout:null,
            view:null,
            process:function(seed,nut){
                nut.disable();//不显示模版
                var lastid = 0;//保存先前的lastid
                var nowLastid = 0;//保存当前的lastid
                var dataJson; //远端返回数据，也就是需要更新的的数据列表
                var memberIDArr = [];//本地需要更新的用户memberID
                var _list;//dataJson.list,type:array,远端返回数据，也就是需要更新的的数据列表
                var list;//过滤不需要的数据，处理之后的数据
                this.step(function(){
                    //console.log(helper.db.coll('lavico/user/lastId'));

                });
                this.step(function(){
                    var data_request = {};

                    helper.db.coll('lavico/user/lastId').findOne({},this.hold(function(err, doc){
                        if(!doc){

                            helper.db.coll("lavico/user/lastId").insert(
                                {
                                    'lastid': 0
                                    , 'lastModified': new Date().getTime()

                                }
                                , {$safe:true}
                                , function(err){ err&&console.log(err) }
                            ) ;
                        }
                    }));
                });

                this.step(function(){
                    helper.db.coll('lavico/user/lastId').find({}).sort({lastModified:-1}).limit(1).toArray(this.hold(function(err, doc){
                        lastid = doc[0].lastid;

                    }));
                });
                //搜索需要的更新的memberID
                this.step(function(){
                    helper.db.coll('welab/customers').find(
                        {
                            $and:
                                [
                                    {"HaiLanMemberInfo":{$exists:true}},
                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                ]
                        }
                    ).toArray(this.hold(
                        function(err,doc){
                            //console.log(doc);
                            for(var _i=0; _i<doc.length;_i++){
                                memberIDArr.push(doc[_i].HaiLanMemberInfo.memberID);
                            }
                            //console.log(memberIDArr);
                        }
                    ));
                });
                this.step(function(){

                    if(lastid == 0){
                        //初始化数据
                        var data_request = {};
                            middleware.request("System/FieldChange",
                            data_request,
                            this.hold(function(err,doc){
                                dataJson = JSON.parse(doc);
                                //console.log(dataJson);
                                //插入数据库
                                helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                    $set:{
                                        'data':dataJson,
                                        'lastModified':new Date().getTime()
                                    }
                                },this.hold(function(err, doc) {
                                    err&&console.log(err);
                                }));
                                //插入数据库
                                _list = dataJson.list;//临时数组
                                list = [];
                                for(var _i=0 ; _i<_list.length; _i++){
                                    if(_list[_i].TABLE_NAME == 'PUB_MEMBER_PSN'){
                                        list.push(_list[_i]);
                                    }
                                }
                                //console.log(list);
                                //console.log(_list.length);
                                //console.log(list.length);
                                //实际更新的数据
                                helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                    $set:{
                                        'updateData':list,
                                        'lastModified':new Date().getTime()
                                    }
                                },this.hold(function(err, doc) {
                                    err&&console.log(err);
                                }));
                                //实际更新的数据
                            }));

                    }else{
                        //数据

                        var data_request = {
                            "lastid":lastid
                        };
                        middleware.request("System/FieldChange"
                            ,data_request
                            ,this.hold(
                                function(err,doc){

                                    dataJson = JSON.parse(doc);
                                    //console.log(dataJson);
                                    //插入数据库
                                    if(dataJson.list.length == 0){
                                        //如果返回的是空，也就是{"list":[]}
                                        nut.disable();//不显示模版
                                        this.res.writeHead(200, { 'Content-Type': 'application/json' });
                                        this.res.write('{"success":true,"info":"lastid_is_'+lastid+'","end":true}');
                                        this.res.end();
                                        this.terminate();
                                    }else{


                                        helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                            $set:{
                                                'data':dataJson,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                            err&&console.log(err);
                                        }));
                                        //插入数据库
                                        _list = dataJson.list;//临时数组
                                        list = [];
                                        for(var _i=0 ; _i<_list.length; _i++){
                                            if(_list[_i].TABLE_NAME == 'PUB_MEMBER_PSN'){
                                                list.push(_list[_i]);
                                            }
                                        }
                                        //console.log(list);
                                        //console.log(_list.length);
                                        //console.log(list.length);
                                        //实际更新的数据
                                        helper.db.coll('lavico/user/lastId').update({"lastid":lastid},{
                                            $set:{
                                                'updateData':list,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                            err&&console.log(err);
                                        }));
                                        //实际更新的数据



                                    }

                                }
                        ));
                    }
                });
                //最后一步，更新数据
                this.step(function(){
                    //暂时屏蔽此更新
                    //memberIDArr.length
                    //console.log(memberIDArr);
                    //console.log(list);
                    for(var _i=0;_i<memberIDArr.length;_i++){
                        for(var _j=0;_j<list.length;_j++){

                            var _last_id = list[_j].PK_PUB_FIELD_CHANGEHIS;//当前更新的lastid
                            var _table_name = list[_j].TABLE_NAME;//更新的表名字
                            var _field_name = list[_j].FIELD_NAME;//更新的字段名字
                            var _member_id = list[_j].RK_VALUE;//更新的memberid
                            var _new_value = list[_j].NEW_VALUE;//更新之后最新值


                            if(memberIDArr[_i] == _member_id){
                                //console.log('memberIDArr['+_i+']:'+memberIDArr[_i]);
                                //console.log('_member_id:'+_member_id);
                                //console.log('_field_name:'+_field_name);
                                //console.log('_new_value:'+_new_value);

                                //FIELD_NAME 字段名字 : MEM_PSN_CNAME -->会员姓名（中文）
                                /*
                                *
                                *"realname": "田丰",MEM_PSN_CNAME
                                *"gender": "male",MEM_PSN_SEX
                                *"birthday": 830707200000,MEM_PSN_BIRTHDAY DATE +++++++
                                *"mobile": "13964011581",MOBILE_TELEPHONE_NO
                                *"email": "zealair@gmail.com",MEM_PSN_EMAIL
                                 "profession": "广告",MEM_INDUSTRY
                                 "province": "上海",PROVINCE
                                 "city": "上海",CITY
                                 "address": "天钥桥路909号3号楼606",MEM_PSN_ADDRESS
                                 "favoriteStyle": "修身、立体剪裁",MEM_PSN_HOPPY
                                 "favoriteColor": "黑色、蓝色、白色",MEM_PSN_COLOR
                                 */
                                if(_field_name == 'MEM_PSN_CNAME'){

                                    helper.db.coll('welab/customers').update({
                                        $and:
                                            [
                                                {"HaiLanMemberInfo":{$exists:true}},
                                                {"HaiLanMemberInfo.memberID":{$exists:true}},
                                                {"HaiLanMemberInfo.memberID":_member_id}
                                            ]
                                    },{
                                            $set:{
                                                'realname':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_PSN_SEX'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'gender':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_PSN_BIRTHDAY'){
                                    //格式：05-3月 -14 04.51.44.000000000 下午
                                    //格式：13-3月 -14 09.02.46.000000000 上午
                                    var _time = _new_value;
                                    var _time = "05-3月 -14 04.51.44.000000000 下午";
                                    var _timeArr = _time.split(" ");// 在每个逗号(,)处进行分解
                                    console.log(_timeArr);//["05-3月", "-14", "04.51.44.000000000", "下午"];

//                                    helper.db.coll('welab/customers').find(
//                                        {
//                                            $and:
//                                                [
//                                                    {"HaiLanMemberInfo":{$exists:true}},
//                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
//                                                ]
//                                        }
//                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
//                                            $set:{
//                                                'birthday':_new_value,
//                                                'lastModified':new Date().getTime()
//                                            }
//                                        },this.hold(function(err, doc) {
//                                        err&&console.log(err);
//                                    }));

                                }
                                else if(_field_name == 'MOBILE_TELEPHONE_NO'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'mobile':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_PSN_EMAIL'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'email':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));

                                }
                                else if(_field_name == 'MEM_INDUSTRY'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'profession':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'PROVINCE'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'province':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'CITY'){

                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'city':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'MEM_PSN_ADDRESS'){
                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'address':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'MEM_PSN_HOPPY'){
                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'favoriteStyle':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else if(_field_name == 'MEM_PSN_COLOR'){
                                    helper.db.coll('welab/customers').find(
                                        {
                                            $and:
                                                [
                                                    {"HaiLanMemberInfo":{$exists:true}},
                                                    {"HaiLanMemberInfo.memberID":{$exists:true}}
                                                ]
                                        }
                                    ).update({"HaiLanMemberInfo.memberID":memberIDArr[_i]},{
                                            $set:{
                                                'favoriteColor':_new_value,
                                                'lastModified':new Date().getTime()
                                            }
                                        },this.hold(function(err, doc) {
                                        err&&console.log(err);
                                    }));
                                }
                                else{
                                    //忽略其他情况
                                }


                            }
                        }
                    }
                    nowLastid = _list[_list.length-1].PK_PUB_FIELD_CHANGEHIS;//保存最新的lastid

                });

                this.step(function(){
                    //console.log(lastid);
                    //console.log(nowLastid);
                    if(lastid < nowLastid){
                        helper.db.coll("lavico/user/lastId").insert(
                            {
                                'lastid': nowLastid
                                ,'lastModified': new Date().getTime()

                            }
                            , {$safe:true}
                            , function(err){ err&&console.log(err) }
                        );
                    }

                });
                this.step(function(){
                    nut.disable();//不显示模版
                    this.res.writeHead(200, { 'Content-Type': 'application/json' });
                    this.res.write('{"success":true,"info":"lastid_is_'+nowLastid+'","end":false}');
                    this.res.end();
                    this.terminate();
                });
            }
        },
        Modified:{
            layout:null,
            view:null,
            process:function(seed,nut){

              var memberID = seed.memberID || 'undefined';
              var email = seed.email || 'undefined';
              var profession = seed.profession || 'undefined';
              var province = seed.province || 'undefined';
              var city = seed.city || 'undefined';
              var address = seed.address || 'undefined';
              var favoriteStyle = seed.favoriteStyle || 'undefined';
              var favoriteColor = seed.favoriteColor || 'undefined';
              var wxid = seed.wxid || 'undefined';

              this.step(function(){

                  if(memberID == 'undefined'){
                      nut.disable();//不显示模版
                      this.res.writeHead(200, { 'Content-Type': 'application/json' });
                      this.res.write('{"success":false,"error":"memberID_no_found"}');
                      this.res.end();
                      this.terminate();
                  }
                  if(email == 'undefined'  || profession == 'undefined'  || province == 'undefined' || city == 'undefined' || address == 'undefined' || favoriteStyle == 'undefined' || favoriteColor == 'undefined'){
                      nut.disable();//不显示模版
                      this.res.writeHead(200, { 'Content-Type': 'application/json' });
                      this.res.write('{"success":false,"error":"missing_parameter"}');
                      this.res.end();
                      this.terminate();
                  }

              });

              this.step(function(){

                nut.disabled = true ;

                var data_submit_checekd = {
                    'email':seed.email,
                    'industry':seed.profession,//行业
                    'province':seed.province,
                    'city':seed.city,
                    'addr':seed.address,
                    'hoppy':seed.favoriteStyle,
                    'color':seed.favoriteColor
                }
                var data_submit_inserted = {
                    'email':seed.email,
                    'profession':seed.profession,//行业
                    'province':seed.province,
                    'city':seed.city,
                    'address':seed.address,
                    'favoriteStyle':seed.favoriteStyle,
                    'favoriteColor':seed.favoriteColor
                 }
                /*提交审核*/
                //console.log(data_submit_checekd);
                middleware.request("Member/SaveInfo/"+memberID,
                  data_submit_checekd,
                  this.hold(function(err,doc){
                      //console.log(doc);
                      dataJson = JSON.parse(doc);

                      /*记录用户操作行为*/
                      helper.db.coll("welab/feeds").insert(
                          {
                              'createTime':new Date().getTime(),
                              'wxid':seed.wxid,
                              'memberid':seed.memberID,
                              'action':"info",
                              'user':"welab",
                              'request':data_submit_checekd,
                              'reponse':dataJson
                          },
                          function(err, doc){
                              err&&console.log(err);
                          }
                      );


                      if(dataJson.success == true){

                          /*更新个人资料*/
                          helper.db.coll('welab/customers').update({wechatid:seed.wxid},{
                              $set:data_submit_inserted
                          },this.hold(function(err, insert_doc) {
                              err&console.log(insert_doc);
                          }));

                          this.res.writeHead(200, { 'Content-Type': 'application/json' });
                          this.res.write('{"success":true,"info":""}');
                          this.res.end();
                          this.terminate();

                      }else if(dataJson.success == false){

                          if((/[\u4e00-\u9fa5]+/).test(dataJson.error)){
                              var _error = dataJson.error;
                          }else{
                              var _error = 'missing_parameter';
                          }
                          this.res.writeHead(200, { 'Content-Type': 'application/json' });
                          this.res.write('{"success":false,"info":"'+_error+'"}');
                          this.res.end();
                          this.terminate();

                      }else{

                          this.res.writeHead(200, { 'Content-Type': 'application/json' });
                          this.res.write('{"success":false,"info":"network_error"}');
                          this.res.end();
                          this.terminate();

                      }

                  }));
                });

            }
        }
    }

}
function contains(arr, obj) {
    var i = arr.length;
    while(i--){
        if(arr[i] == obj){
            return true;
        }
    }
    return false;
}