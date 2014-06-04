
function waterFall(element, space, children) {
    if (!element) return;
    space = space || 10;
    children = children || "div";	//ǰ����Ĭ�����ã��ֱ�Ϊ���Ԫ��id���������ף���Ԫ�ر�ǩ��(��Ԫ�ر�ǩ��ʹ��̫������)
    var wrap = document.getElementById(element);
    var water = wrap.getElementsByTagName(children);
    var spaceWidth = water[0].offsetWidth;	//��ȡ��Ԫ�ؿ��(offsetWidth���ȡ�鼶Ԫ�ص�padding��border)
    var wrapWidth = wrap.offsetWidth;	//��ȡ���Ԫ�ؿ��
    var colNum = Math.floor(wrapWidth / spaceWidth);	//�����ȡ���Ԫ�����ܳ�������
    var padding = Math.floor((wrapWidth - colNum * spaceWidth) / (colNum + 1));	//�������Ԫ��ʣ���Ȳ�������������
    var column = new Array();
    var length = water.length;
    var maxHeight = 0;
    for (var i = 0; i < colNum; i++) {	//��ʼ��������������г�ʼtopֵ��leftֵ
        column[i] = new Array();
        column[i].top = space;
        column[i].left = (spaceWidth * i) + padding * (i + 1);	//������о���������
    }
    for (var i = 0; i < length; i++) {	//����������Ԫ�ؼ��ٲ�������
        var index = i + 1;	//�������Ԫ�����ڵڼ���
        if (index % colNum == 0) {
            sub = colNum;
        } else {
            sub = index % colNum;
        }
        _this = water;
        _this[i].style.position = "absolute";
        _this[i].style.top = column[sub - 1].top + "px";
        _this[i].style.left = column[sub - 1].left + "px";
        column[sub - 1].top += _this[i].offsetHeight + space;	//����������¸߶��Ա㸳ֵ
    }
    for (var i = 0; i < colNum; i++) {	//��ȡ�ٲ������岼�ָ߶�
        if (column[i].top > maxHeight) maxHeight = column[i].top;
    }
    wrap.style.height = maxHeight + "px";	//�����Ԫ�ظ�ֵ�Է�ֹ������Ԫ��������Ԫ��
}