/*
 author:json
 desciption:show store list by appoint city(按指定城市选择门店列表)
 */
var middleware = require('../../lib/middleware.js');
module.exports={
    layout: "lavico/layout",
    view:"lavico/templates/store/store_num4.html",
    process:function(seed,nut){
        nut.model.city_docs=[];

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
        provinceArr[17] = ['广西壮族'];
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
        provinceArr[29] = ['宁夏回族'];
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
        cityArr[17] = ['广西壮族','南宁市','柳州市','桂林市','梧州市','北海市','防城港市','钦州市','贵港市','玉林市','百色市','贺州市','河池市','来宾市','崇左市'];
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
        cityArr[29] = ['宁夏回族','银川市','石嘴山市','吴忠市','固原市','中卫市'];
        cityArr[30] = ['海南省','海口市','三亚市','五指山市', '琼海市', '儋州市', '文昌市', '万宁市', '东方市', '定安县', '屯昌县', '澄迈县', '临高县', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县' ];
        cityArr[31] = ['台湾省','台北市', '高雄市', '基隆市', '台中市', '台南市', '新竹市', '嘉义市'];
        cityArr[32] = ['香港特别行政区','中西区', '湾仔区', '东区', '南区', '油尖旺区', '深水埗区', '九龙城区', '黄大仙区', '观塘区', '荃湾区', '葵青区', '沙田区', '西贡区', '大埔区', '北区', '元朗区', '屯门区', '离岛区' ];
        cityArr[33] = ['澳门特别行政区','澳门'];

        nut.model.provinceArr=provinceArr;
        nut.model.cityArr=cityArr;

        nut.model.wxid = seed.wxid ? seed.wxid : 'undefined'

    },
    actions:{
        //显示具体门店
        show:{
            layout: "lavico/layout",
            view:"lavico/templates/store/store_num3.html",
            process:function(seed,nut){
                nut.model.wxid = seed.wxid;

                //设置id从砍价过来
                //没设置id查询过来的
                if(seed._id) {
                    nut.model._id = seed._id;
                }else{
                    nut.model._id=null;
                }




                var cityCode=seed.CODE;

                //获取CODE-取消最后一个自添加1
                console.log("sed:"+cityCode);
                //var cityCode=seed.CODE.substring(0,seed.CODE.length-1);

                //接口读取门店列表(设置1000代表每页条数，即一次性全部返回)
                this.step(function(){
                    var jsonData={}
                    jsonData.perPage=1000;
                    jsonData.pageNum=1;
                    middleware.request('Shops',jsonData,
                        this.hold(function(err,doc){
                            if(err) throw err;
                            return JSON.parse(doc);//接口返回的都是字符串式json
                        })
                    )
                })

                this.step(function(doc){
                    //在接口列表中查找seed传送过来的cityCode
                    for(var i=0;i<doc.list.length;i++){
                        var code=(doc.list[i].CODE).replace(/\s/g,'');
                        //console.log("code:"+code);
                       // console.log("cityCode:"+cityCode);
                        if(code==cityCode){
                            console.log("ok");
                            //return searchCity=doc.list[i];//返回指定门店
                            nut.model.searchCity=doc.list[i];
                            break;
                        }
                    }
                })

            },
            viewIn:function(){
                if(log!=""){

                    var map = new BMap.Map("allmap");
                    //var point = new BMap.Point(116.331398,39.897445);
                    var point = new BMap.Point(log,lat);

                    map.centerAndZoom(point,17);

                    var geolocation = new BMap.Geolocation();

                    geolocation.getCurrentPosition(function(r){

                        r.point.lng=log;
                        r.point.lat=lat;
                        if(this.getStatus() == BMAP_STATUS_SUCCESS){
                            var mk = new BMap.Marker(r.point);
                            map.addOverlay(mk);
                            map.panTo(r.point);
                            //alert('您的位置：'+r.point.lng+','+r.point.lat);
                        }
                        else {
                            //alert('failed'+this.getStatus());

                            window.popupStyle2.on('failed'+this.getStatus(),function(event){
                                if(event == "confirm"){

                                }
                            })
                        }
                    },{enableHighAccuracy: true})
                    //关于状态码
                    //BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
                    //BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
                    //BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
                    //BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
                    //BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
                    //BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
                    //BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
                    //BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
                    //BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)
                }
            }
        },
        //搜索门店列表
        search:{
            layout:"lavico/layout",
            view:"lavico/templates/store/store_num21.html",
            process:function(seed,nut){
                var then=this;
                var cityName= seed.city.substring(0,seed.city.length-1);
                nut.model.cityName=cityName;
                nut.model.wxid = seed.wxid;
                this.step(function(){
                    var jsonData={};
                    jsonData.perPage=1000;
                    jsonData.pageNum=1;
                    middleware.request('Shops',jsonData,
                        then.hold(function(err,doc){
                            if(err) throw err;
                            return JSON.parse(doc);
                        })
                    )
                })

                this.step(function(doc){
                    var searchCity=[]
                    for(var i=0;i<doc.list.length;i++){
                        if(doc.list[i].CITY==cityName){
                           var newCODE= (doc.list[i].CODE).replace(/\s/g,'');
                            doc.list[i].CODE=newCODE;
                            searchCity.push(doc.list[i]);
                        }
                    }
                    if(searchCity.length>0){
                        nut.model.city_docs=searchCity;
                    }
                })
            }
        }
    }

}