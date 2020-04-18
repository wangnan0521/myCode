Array.prototype.myMap = function (callBack, contex) {
  var oldArr = Array.prototype.slice.call(this);
  var newArr = []
  for (let i = 0; i < oldArr.length; i++) {
    newArr.push(callBack.call(contex, oldArr[i], i, oldArr))
  }
  return newArr
}

var a = [1, 2, 3]

console.log(a.myMap(function (item) {
  console.log(this)
  return item + 1;
}, {
  name: 'wangnan'
}));


Array.prototype.myReduce = function (callBack, initValue) {
  var oldArr = Array.prototype.slice.call(this);
  var startIndex = 0;
  var res = initValue;
  if (initValue === null || initValue === void(0)) {
    startIndex = 1;
    res = oldArr[0];
  }

  for (let i = startIndex; i < oldArr.length; i++) {
    res = callBack.call(null, res, oldArr[i], i, this)
  }
  return res
}

console.log(a.myReduce(function (o, v) {
  return o + v
}, 5));

Function.prototype.myApply = function (contex, args) {
  var func = this;
  var fn = Symbol('2')
  contex[fn] = func;
  var res = contex[fn](args)
  delete contex[fn]
  return res
}

var f = function () {
  console.log(this)
}
f.myApply({
  name: 'wangnan'
});

//object.create
function create(proto) {
  function F() {};
  F.prototype = proto;

  return new F();
}

console.log((create({
  name: 'wangnan'
}).__proto__));

/**
 * 实现bind 思路:将方法作为context的一个属性,调用
 */
Function.prototype.myBind = function(context){
  var func = this;
  var fn = Symbol()
  context[fn] = func;
  return context[fn];
}

var f = function(){
  console.log(this);
}
f.myBind({name: 'wangnan'})()

/**
 * 使用Array.from()实现数组的深克隆,思路 利用Array.from方法的第二个参数
 */

 function deapClone(arr){
   return Array.isArray(arr)? Array.from(arr, deapClone): arr;
 }

 console.log(deapClone([[1,2,3],[4,5,6]]))

//  white-space-collapse:discard 解决inline-block中间的空白

var obj = new Proxy({},{
  get: function(target, key, receiver){
    console.log(target, key, receiver);
    console.log(Reflect.get(target, key, receiver));
    return Reflect.get(target, key, receiver);
  },
  set: function (target, key, value, receiver) {
    console.log(target, key, value, receiver);
    console.log(Reflect.set(target, key, value, receiver));
    return Reflect.set(target, key, value, receiver);
  }
})

obj.name = 'wangnan'

//实现一个简易版的redux

const createStore = (reducer,initState)=>{
  let state = initState;
  let listeners = [];
  function subscribe(listener){
    listeners.push(listener);
    return function(){
      listeners.splice(listeners.indexOf(listener),1)
    }
  }

  function dispatch(action){
    state = reducer(state, action)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  function getState(){
    return state
  }

  return {
    getState,
    subscribe
  }
}

const reduce = (state, action)=>{
  switch(action.type){
    case 'ADD': 
    return {
      ...state,
      count: state.count+1
    }
    case 'DEL': 
    return {
      ...state,
      count: state.count-1
    }
    default:
      return state;
  }
}

let state = {
  counter: {
    count: 0
  },
  info: {
    name: '前端九部',
    description: '我们都是前端爱好者！'
  }
}
/*counterReducer, 一个子reducer*/
/*注意：counterReducer 接收的 state 是 state.counter*/
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return {
        count: state.count + 1
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count - 1
      }
    default:
      return state;
  }
}
/*InfoReducer，一个子reducer*/
/*注意：InfoReducer 接收的 state 是 state.info*/
function InfoReducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        name: action.name
      }
    case 'SET_DESCRIPTION':
      return {
        ...state,
        description: action.description
      }
    default:
      return state;
  }
}

const reducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer
});
/**
 *  combineReducers的实现  redux中只有一个总的reducer, combineReducers将所有的reducer合并为一个
 */
function combineReducers(reducers){
  const reducerKeys = Object.keys(reducers);
  return function newReducer(state = {}, action){
    const newxState = {}
    for (const key of reducerKeys) {
      const oldState = state[key]
      const newState = reducers[key](oldState, action)
      newxState[key] = newState
    }
    return newxState;
  }
}

/**
 * compose 函数的实现
 */

 function compose(...funcs){
    if (funcs.length === 1) {
      return funcs[0]
    }
    return funcs.reduce((a,b)=>
      (...args)=> a(b(...args))
    )
 }

export function formatNumber(value, allowDot, max, min) {
  if (allowDot) {
    var dotIndex = value.indexOf('.')
    if (dotIndex > -1) {
      value = value.slice(0, dotIndex + 1) + value.slice(dotIndex).replace(/\./g, '')
    }
  } else {
    value = value.split('.')[0]
  }
  var minusIndex = value.indexOf('-')
  if (minusIndex > -1) {
    value = value.slice(0, minusIndex + 1) + value.slice(minusIndex).replace(/-/g, '')
  }
  if (minusIndex > 0) {
    value = value.split('-')[0]
  }
  var regExp = allowDot ? /[^-0-9.]/g : /\D/g
  value = value.replace(regExp, '')
  if (typeof max === 'number' && value > max) {
    value = max
  }
  if (typeof min === 'number' && value < min) {
    value = min
  }
  return value
}
//自定义全局监听事件
//创建全局事件
var _wr = function(type) {
   var orig = history[type];
   return function() {
       var rv = orig.apply(this, arguments);
      var e = new Event(type);
       e.arguments = arguments;
       window.dispatchEvent(e);
       return rv;
   };
};
//重写方法
 history.pushState = _wr('pushState');
 history.replaceState = _wr('replaceState');
//实现监听
window.addEventListener('replaceState', function(e) {
  console.log('THEY DID IT AGAIN! replaceState 111111');
});
window.addEventListener('pushState', function(e) {
  console.log('THEY DID IT AGAIN! pushState 2222222');
});

