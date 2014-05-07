$(function () {
    var add = 2;
    var pageId, option, option_more = 1;
    var Arr = ['A', ' B', ' C', ' D', ' E', ' F'];

    //默认第一题单选题添加选项
    $('#option0').click(function () {
        var topic = $(this).siblings("ul").find('li').length;
        console.log(topic)
        if (6 - topic > 0) {
            for (var i = 0; i < 6 - topic; i++) {
                $(this).siblings("ul").append("<li><div class='groupTitle'><span class='lal'>D.</span><a href='javascript:void(0)' class='remove'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text' class='groupText_1' /><input type='text' class='groupText_2' />" +
                                "<input type='text' class='groupText_3' /></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file' name='file' class='file' onchange='fileSelected(this);' /><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li>");
                $(this).siblings("ul").find('li:last-child span.lal').html(Arr[topic] + '.');

                break;
            }
        }
    });

    //默认第一题多选题添加选项
    $('#option_more0').click(function () {
        var topic = $(this).siblings("ul").find('li').length;
        if (6 - topic > 0) {
            for (var i = 0; i < 6 - topic; i++) {
                $(this).siblings("ul").append("<li><div class='groupTitle'><span class='lal'>D.</span><a href='javascript:void(0)' class='remove'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li>");
                $(this).siblings("ul").find('li:last-child span.lal').html(Arr[topic] + '.');

                break;
            }
        }
    });

    //默认单选题、多选题、主观题选择
    $(".select").click(function () {
        var selVal = $(this).val();
        $(this).parent(".option").siblings(".grouping").find(".topic:eq(" + selVal + ")").show().siblings().hide();
    });

    $('#add_title').click(function () {
        //动态添加多道题目
        $('.add_topic_page1').append("<div class='page page_2' id='page" + pageId + "'><a href='javascript:void(0)' class='close'>X</a><h3>第<em class='question_num'>" + add + "</em>题</h3><label class='label'>题目：</label><input type='text'value=''placeholder='输入文本...'class='name'/><div class='option'><label class='label'>选项：</label><select class='select'><option value='0'>单选题</option><option value='1'>多选题</option><option value='2'>主观题</option></select></div><div class='grouping'><div class='topic'><span class='head_1'>分值</span><span class='head_2'>下一步</span><ul class='topic_list'><li><div class='groupTitle'>A.</div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/><input type='text'class='groupText_3'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);' /><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li><li><div class='groupTitle'>B.</div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/><input type='text'class='groupText_3'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li><li><div class='groupTitle'><span class='lal'>C.</span><a href='javascript:void(0)' class='remove'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/><input type='text'class='groupText_3'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li><li><div class='groupTitle'><span class='lal'>D.</span><a href='javascript:void(0)' class='remove'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/><input type='text'class='groupText_3'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li></ul><a href='javascript:void(0)'class='add_option'id='option" + option + "'><b>+</b>添加选项（最多6项）</a></div><div class='topic more'style='display:none'><span class='head_1'>分值</span><ul><li><div class='groupTitle'>A.</div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li><li><div class='groupTitle'>B.</div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li><li><div class='groupTitle'><span class='lal'>C.</span><a href='javascript:void(0)'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li><li><div class='groupTitle'><span class='lal'>D.</span><a href='javascript:void(0)'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file' onchange='fileSelected(this);'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li></ul><a href='javascript:void(0)'class='add_option'id='option_more" + option_more + "'><b>+</b>添加选项（最多6项）</a></div><div class='topic single'style='display:none'><span class='h25 padd_bom'><label>分值：</label><input type='text'value='0'class='w60'/></span><span class='h25'><label>字数限制：</label><input type='text'value='0'class='w60'/>~<input type='text'value='0'class='w60'/></span></div></div></div>");

        //动态添加单选题选项
        $('#option'+option).click(function () {
            var topic = $(this).siblings("ul").find('li').length;
            console.log(topic)
            if (6 - topic > 0) {
                for (var i = 0; i < 6 - topic; i++) {
                    $(this).siblings("ul").append("<li><div class='groupTitle'><span class='lal'>D.</span><a href='javascript:void(0)' class='remove'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text' class='groupText_1' /><input type='text' class='groupText_2' />" +
                                    "<input type='text' class='groupText_3' /></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file' name='file' class='file' onchange='fileSelected(this);' /><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li>");
                    $(this).siblings("ul").find('li:last-child span.lal').html(Arr[topic]+'.');

                    break;
                }               
            }          
        });

        //动态添加多选题选项
        $('#option_more' + option_more).click(function () {
            var topic = $(this).siblings("ul").find('li').length;
            if (6 - topic > 0) {
                for (var i = 0; i < 6 - topic; i++) {
                    $(this).siblings("ul").append("<li><div class='groupTitle'><span class='lal'>D.</span><a href='javascript:void(0)' class='remove'>x</a></div><div class='groupContent'><span class='groupText padd_bom'><input type='text'class='groupText_1'/><input type='text'class='groupText_2'/></span><span class='uploading'><input type='text' name='uploadFile' class='uploadFile'/><input type='file'name='file'class='file'/><span class='alert file_box'style='display:block'><img class='media-object'style='width: 64px; height: 64px;'src='/node_modules/welab/public/defaultPic.png'><span><a href='javascript:;'onclick='delPic(this)'>删除</a></span></span></span></div></li>");
                    $(this).siblings("ul").find('li:last-child span.lal').html(Arr[topic] + '.');

                    break;
                }
            }
        });

        //动态单选题、多选题、主观题选择
        $(".select").click(function () {
            var selVal = $(this).val();
            console.log(selVal)
            $(this).parent(".option").siblings(".grouping").find(".topic:eq(" + selVal + ")").show().siblings().hide();
        });

        option_more, option, pageId, add++;
    });

    //奖项设置
    $('#add_awards').click(function () {
        $('.add_topic_page2').append("<div class='page page_3' id='pageAw" + pageId + "'><a href='javascript:void(0)' class='close'>X</a><h3>奖项" + add + "</h3><div class='awardsCon'><span class='awardsTitle'>条件</span><span class='awardsRight'><span class='h25 padd_bom'><label>分值：</label><input type='text'value='0'class='w28'/>~<input type='text'value='0'class='w28'/></span><span class='h25'><label>标签：</label><input type='text'value=''class='w100'placeholder='输入标签'/></span></span></div><div class='awardsCon'><span class='awardsTitle h100'>结果</span><span class='awardsRight'><span class='h25 padd_bom'><label>获得标签：</label><input type='text'value=''class='w100'placeholder='输入标签'/></span><span class='h25 padd_bom'><label>获得积分：</label><input type='text'value=''class='w100'placeholder='输入标签'/></span><span class='h25'><label>获得礼券：</label><input type='text'value=''class='w310'placeholder='输入标签'/></span></span></div></div>");
        pageId, add++;
    });

    //删除添加的选项
    $("body").on("click", ".remove", function () {
        $(this).parents("li").remove();
    });
    //删除添加的题目
    $("body").on("click", ".close", function () {
        $(this).parents(".page").remove();
    });
});