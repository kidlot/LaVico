timeOut = 60 * 15 * 1000

exports.next = (req)->
  req.session.aSteps.nStep = req.session.aSteps.nStep + 1
  if req.session.aSteps.steps[req.session.aSteps.nStep]
    req.session.next(_constructor(req.session.aSteps.steps[req.session.aSteps.nStep]), timeOut);
  else
    console.log("已经没有下一步了")

exports.again = (req)->
  req.session.next(_constructor(req.session.aSteps.steps[req.session.aSteps.nStep]), timeOut);

exports.start = (aFuncs, req)->
  req.session.aSteps = {}
  req.session.aSteps.steps = aFuncs
  req.session.aSteps.nStep = 0
  req.session.next(_constructor(req.session.aSteps.steps[0]), timeOut);

# quit
exports._quit = (params, req, res)->
  if params.Content == 'quit' || params.Content == '取消' || params.Content == '退出'
    res.reply("取消成功");
    delete req.session.registeration;
    return true;
  else
    return false;

_constructor = (func)->
  return (params, req, res, next, mainNext)->
    return if exports._quit(params, req, res)
    if params.Event == "CLICK"
      delete req.session.registeration;
      mainNext()
      return
    if typeof(func)!=undefined
      func(params, req, res, next)
