function regexpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

exports.conditions = function (seed) {

    seed.conditions = seed[0].value;
    seed.logic = seed[1].value;

    var conditions = {};
    if (!seed.conditions)
        return;

    var _inputConditions = JSON.parse(seed.conditions);
    if (!_inputConditions || !_inputConditions.length)
        return;

    //console.log(_inputConditions) ;

    var _conditions = [];
    for (var i = 0; i < _inputConditions.length; i++) {
        var expr = _inputConditions[i];
        var item = {};



        // 处理日期
        var a = /^\d{4}-\d{1,2}-\d{1,2}$/
        if (a.test(expr[1])) {
            var _sTime = new Date(expr[1] + " 00:00:00").getTime();
            if (expr[2]&&a.test(expr[2])){
                var _tTime = new Date(expr[2] + " 23:59:59").getTime()
            }else{
                var _tTime = new Date(expr[1] + " 23:59:59").getTime()
            }
            expr[1] = {$gt:_sTime,$lt:_tTime}
            expr[2] = undefined;
        }


        switch (expr[2]) {
            case undefined :
            case 'is' :
                item[expr[0]] = expr[1];
                break;

            case 'not' :
                item['$not'] = {};
                item['$not'][expr[0]] = expr[1];
                break;

            case 'match' :
                item[expr[0]] = new RegExp(regexpEscape(expr[1]));
                break;

            case 'match' :
                item['$not'] = {};
                item['$not'][expr[0]] = new RegExp(regexpEscape(expr[1]));
                break;

            case 'startwith':
                item[expr[0]] = new RegExp('^' + regexpEscape(expr[1]));
                break;

            case 'endwith':
                item[expr[0]] = new RegExp(regexpEscape(expr[1]) + '$');
                break;

            case 'eq':
                item[expr[0]] = expr[1];
                break;
            case 'gt':
            case 'lt':
            case 'gte':
            case 'lte':
                item[expr[0]] = {};
                item[expr[0]]['$' + expr[2]] = expr[1];
                break;
            default:
                item = null;
        }

        //console.log(item)
        item && _conditions.push(item);
    }



    conditions[ seed.logic == 'and' ? '$and' : '$or' ] = _conditions;

    console.log(conditions) ;

    return conditions;
}
