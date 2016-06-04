(function(window, document) {
	/**
	 * 框架上下文，所有的方法都挂在该上下文对象中
	 * @type {Object}
	 */
	var Ze = {};

	/**
	 * 类型判断，封装这个代码是为了减少代码量
	 * @param  {mixed}  type 需要判断的类型，如string、array等
	 * @return {Boolean}      是否为该类型
	 */
	var isType = function(type) {
	    type = '[object ' + type + ']';
	    return function(o) {
	        return Object.prototype.toString.call(o) === type;
	    };
	};

	/**
	 * 方法别名
	 */
	var slice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;
	var defineProp = Object.defineProperty;

	// 类型判断
	var isFunc = Ze.isFunc = isType('Function');
	var isBool = Ze.isBool = isType('boolean');
	var isObj = Ze.isObj = function (o) {return typeof o === 'object'; };
	var isUndef = Ze.isUndef = function (o) {return typeof o === 'undefined'; };
	var isNull = Ze.isNull = isType(null);
	var isArr = Ze.isArr = isType('Array');
	var isStr = Ze.isStr = isType('String');
	var isRegExp = Ze.isRegExp = isType('RegExp');
	var isNum = Ze.isNum = isType('Number');
	var isEl = Ze.isEl = function (dom) { return dom && dom.nodeType && dom.nodeType === 1;}
	var isEmptyObj = Ze.isEmptyObj = function (obj) {for (var key in obj) { return false; } return true; };

	/**
	 * 对对象进行扩展，只支持对象与对象之间
	 * @param  {Object} origin   被扩展对象
	 * @param  {Object} source   要扩展进来的对象
	 * @param  {boolean} override 是否覆盖原来的值，默认为否
	 * @return {null}
	 */
	function extend (origin, source, override) {
		if (!isObj(source)) {
			return;
		}

		for (var key in source) {
			if (!origin[key] || override) {
				origin[key] = source[key];
			}
		}
	};
	Ze.extend = extend;

	/**
	 * 工具类
	 *
	 * 直接在原型链修改添加方法
	 */
	
	// String.prototype
	var stringFn = String.prototype;

	/**
	 * 去除字符串两边空白
	 */
	if (isUndef(stringFn.trim)) {
		stringFn.trim = function() {
			return this.replace(/(^\s*)|(\s*$)/g, '');
		};
	}

	// Array.prototype
	var arrayFn = Array.prototype;

	/**
	 * 数组indexOf,ie6以下不支持
	 */
	if (isUndef(arrayFn.indexOf)) {
		arrayFn.indexOf = function (searchElement, fromIndex) {
			var array = this;
			var len = array.length;

			var index = -1;
			fromIndex = fromIndex * 1;
			fromIndex = fromIndex && fromIndex < len ? fromIndex : 0;

			for (var i = fromIndex; i < len; i++) {
				if (array[i] === searchElement) {
					index = i;
					break;
				}
			}

			return index;
		};
	}

	/**
	 * 数组forEach方法,ie9以下不支持
	 */
	if (isUndef(arrayFn.forEach)) {
		arrayFn.forEach = function(cb, context) {
			var array = this;
			for (var i = 0, len = array.length; i < len; i++) {
			 	if (isFunc(cb) && hasOwn.call(array, i)) {
			 		cb.call(context || window, array[i], i, array);
			 	}
			}
		};
	}

	/**
	 * 使用点位符格式化字符串，如 format('{0}:{1}', 'liuzesen', '123') --> 'liuzesen:123'
	 * 或者 format('{name}:{value}', {name: 'liuzesen', value: '123'}) --> 'liuzesen:123'
	 * @param  {string} text 字符串
	 * @return {string}      格式化后的字符串
	 */
	function format (text) {
		var context;

		if (typeof arguments[1] == 'object' && arguments[1]) {
			context = arguments[1];
		} else {
			context = slice.call(arguments, 1);
		}

		return String(text).replace(/\{?\{([^{}]+)}}?/g, replace(context));
	}

	/**
	 * 替换方法
	 * @param  {mixed} context 上下文
	 * @return {null}         无
	 */
	function replace (context) {
		return function (tag, name) {
			if (tag.substring(0, 2) == '{{' && tag.substring(tag.length - 2) == '}}') {
				return '{' + name + '}';
			}

			if (!context.hasOwnProperty(name)) {
				return tag;
			}

			if (isFunc(context[name])) {
				return context[name]();
			}

			return context[name];
		}
	}
	Ze.format = format;

	/**
	 * html编码
	 * @param  {string} s             要编码的字符串
	 * @param  {boolean} encodeNewLine 是否需要编码换行符
	 * @return {string}               编码后的字符串
	 */
	function htmlencode (s, encodeNewLine) {
	    s = s.replace(/&/g, '&amp;')
	    	.replace(/</g, '&lt;')
	    	.replace(/>/g, '&gt;')
	    	.replace(/'/g, '&quot;');

/*	    if (encodeNewLine) {
	        s = s.replace(/\r\n/g, '<br />')
	        	.replace(/\r/g, '<br />')
	        	.replace(/\n/g, '<br />');
	    }*/

	    return s;
	};
	Ze.htmlencode = htmlencode;

	/**
	 * html解码
	 * @param  {string} s             需要解码的字符串
	 * @param  {boolean} encodeNewLine 是否需要解码换行
	 * @return {string}               无
	 */
	function htmldecode (s, encodeNewLine) {
	    s = s.replace(/&amp;/g, '&')
	    	.replace(/&lt;/g, '<')
	    	.replace(/&gt;/g, '>')
	    	.replace(/&quot;/g, '\'');

/*	    if (encodeNewLine) {
	        s = s.replace(/<br\s*\/?>/g, '\n');
	    }*/

	    return s;
	};
	Ze.htmldecode = htmldecode;

	/**
	 * IE浏览器判断，只支持到ie10
	 * @param  {integer}  min ie的最小版本
	 * @param  {integer}  max ie的最大版本
	 * @return {Boolean}     是否为该范围内的ie浏览器
	 */
	var isIE = function (min, max) {
		var nav = navigator.userAgent.toLowerCase();
		var isIE = nav.indexOf('msie') != -1;
		if (!isIE) { return false; }
		min = min ? min : 0;
		max = max ? max : min;
		var ieVer = parseInt(nav.split('msie')[1]);
		return ieVer >= min && ieVer <= max;
	}
	Ze.isIE = isIE;

	/**
	 * 简单事件绑定支持
	 */
	var MEvent = function () {};

	MEvent.prototype = {
		/**
		 * 绑定事件
		 * @param  {string} event 事件名称
		 * @param  {function} fct   事件方法
		 * @return {null}       无
		 */
		on: function (event, fct) {
			var me = this;
			me._events = me._events || {};
			me._events[event] = me._events[event] || [];
			me._events[event].push(fct);
		},

		/**
		 * 解绑事件
		 * @param  {string} event 事件名称
		 * @param  {function} fct   事件方法
		 * @return {null}       无
		 */
		off: function (event, fct) {
			var me = this;
			me._events = me._events || {};
			if (event in me._events === false) return;
			me._events[event].splice(me._events[event].indexOf(fct), 1);
		},

		/**
		 * 触发事件，如果某个事件返回false,则会中断之后的事件执行
		 * @param  {string} event 事件名称
		 * @return {boolean}       事件执行的状态
		 */
		trigger: function (event) {
			var me = this;
			me._events = me._events || {};
			if (event in me._events === false) return;
			for (var i = 0; i < me._events[event].length; i++) {
				var res = me._events[event][i].apply(me, slice.call(arguments, 1));
				if (res === false) {
					return res;
				}
			}
		}
	};

	/**
	 * 将事件功能绑定到某个对象上
	 * @param  {object | function} destObject 方法或者对象
	 * @return {object | function}            绑定完成后的对象
	 */
	MEvent.mixin = function (destObject) {
		var props = ['on', 'off', 'trigger'];

		for (var i = 0; i < props.length; i ++) {
			if (isFunc(destObject)) {
				destObject.prototype[props[i]]  = MEvent.prototype[props[i]];

			} else {
				destObject[props[i]] = MEvent.prototype[props[i]];

			}
		}

		return destObject;
	};
	Ze.event = MEvent;

	/**
	 * 简单DOM操作
	 *
	 * 对外能够通过Ze.$使用
	 */
	var isIE68 = isIE(6, 8);

	var Dom = function (el) {
		this.el = el;
	};

	var $ = function (el) {
		return new Dom(el);
	};

	/**
	 * 设置/读取dom的属性
	 * @param  {string} k key
	 * @param  {string} v value
	 * @return {mixed}   若v 为空则返回该属性的value，否则返回原型链对象
	 */
	Dom.prototype.attr = function (k, v) {
		var el = this.el;
		if (k && v) {
			el.setAttribute(k, v);
			return this;
		} else {
			return el.getAttribute(k);
		}
    };

    /**
     * 判断是否拥有某class
     * @param  {string}  className class名称
     * @return {Boolean}           是否拥有
     */
    Dom.prototype.hasClass = function (className) {
		var regex = new RegExp('(\\s|^)' + className + '(\\s|$)');
		return this.el.className.match(regex);
    };

    /**
     * 添加类
     * @param {string} className 类名
     */
    Dom.prototype.addClass = function (className) {
		if (!this.hasClass(className)) {
			this.el.className += ' ' + className;
		}
		return this;
    };

    /**
     * 删除类
     * @param  {string} className 类名
     * @return {object}           原型链类
     */
    Dom.prototype.removeClass = function (className) {
    	var el = this.el;
		if (this.hasClass(className)) {
			var regex = new RegExp('(\\s*|^)' + className + '(\\s|$)');
			el.className = el.className.replace(regex, ' ');
		}
		return this;
    };

    /**
     * 设置/获取样式
     * @param  {object | string} cssObj 样式名值对或者字符串
     * @return {string | object}        如果cssObj是字符串，返回的是样式值，如果是对象的话则是设置样式
     */
    Dom.prototype.css = function (cssObj) {
    	var el = this.el;
		if (isObj(cssObj)) {
			for (var i in cssObj) {
				el.style[i] = cssObj[i];
			}

			return this;
		} else {
			// currentStyle兼容IE获取计算后的CSS样式值，getComputeStyle是标准获取计算后的CSS值
			return el.currentStyle ? el.currentStyle[cssObj] : getComputedStyle(el, null)[cssObj];
		}
    };

    /**
     * 创建一个fragment dom对象，用于多个dom生成，减少使用多少createElement
     * @param  {string} domStr dom字符串
     * @return {dom}        dom对象
     */
    function createFragment (domStr) {
    	var divTemp = document.createElement('div'),
    	nodes = null,
    	fragment = document.createDocumentFragment();

    	divTemp.innerHTML = domStr;

    	nodes = divTemp.childNodes;
    	for (var i = 0, len = nodes.length; i < len; i++) {
    		fragment.appendChild(nodes[i].cloneNode(true));
    	}

    	return fragment;
    }
    Dom.prototype.fragment = createFragment;

    /**
     * 往dom中添加dom
     * @param  {string}	position	添加的位置,before是在dom的开始，after是在dom的结尾
     * @param  {string} domStr		dom字符串	
     * @return {string | object}   如果没有参数，则返回innerHTML,
     * 如果是传入一个参数，则会被当作domStr处理，并简单使用innerHTML = domStr功能，
     * 如果传入两个参数，则返回原型链对象
     */
	Dom.prototype.html = (function () {
		var isIE69 = isIE(6, 9);
		var notHasAjacentHTML = !('insertAdjacentHTML' in document.createElement('div'));

		return function (position, domStr) {
			var me = this;
			var el = me.el;

			if (position && (domStr || (domStr === ''))) {
				if (isIE69 || notHasAjacentHTML) {
					var fragment = createFragment(domStr);

					switch (position) {
						case 'before':
							el.insertBefore(fragment, el.firstChild);
							break;
						case 'after':
							el.appendChild(fragment);
							break;
						default:
							break;
					}

				} else {
					switch (position) {
						case 'before':
							position = 'afterbegin';
							break;
						case 'after':
							position = 'beforeend';
							break;
						default:
							break;
					}
					el.insertAdjacentHTML(position, domStr);
				}

				return me;
			} else {
				domStr = position;
				if (domStr || domStr === '') {
					el.innerHTML = domStr;

				} else {
					return me.innerHTML;
				}				
			}
		};
	})();

	/**
	 * 为dom节点添加事件
	 * @param {element}  obj       dom对象
	 * @param {string}  eventName 事件名称
	 * @param {function}  cbFn      事件回调函数
	 * @param {Boolean} isCapture 是否捕获型事件，默认为否，即使用冒泡事件
	 */
	function addEvent (obj, eventName, cbFn, isCapture) {
		if (obj.addEventListener) { // ie9以上支持，chrome, safari, ff，this绑定的是obj
			obj.addEventListener(eventName, cbFn, isCapture);
		} else if (obj.attachEvent) { // ie6-8, this绑定的是全局
			obj.attachEvent('on' + eventName, cbFn);
		} else {
			obj['on' + eventName] = cbFn;
		}
	}

	/**
	 * 事件绑定
	 * @param  {string}   eventName 事件名称
	 * @param  {Function} cb        事件回调函数
	 * @return {object}             原型链类
	 */
	Dom.prototype.on = function (eventName, cb) {
		var me = this;
		var el = me.el;

		var cbWrap = function (event) {
			var e = event || window.event;

			// 事件操作封装
			var eventObj = {
				e: e,
				target: e.target || e.srcElement,
				preventDefault: function () {
					if (e.preventDefault) {
						e.preventDefault(); // 标准
					} else {
						e.returnValue = false; //IE 
					}
				},

				stopPropagation: function () {
					if (e.stopPropagation) {
						e.stopPropagation();
					} else {
						e.cancelBubble = true;
					}
				}
			};

			cb.call(el, eventObj);
		};

		me._events = me._events || {};
		me._events[eventName] = me._events[eventName] || [];
		me._events[eventName].push(cbWrap);

		addEvent(el, eventName, cbWrap);

		return me;
	};

	/**
	 * 解除事件
	 * @param  {string} event 事件名称
	 * @return {object}       返回原型链类
	 */
	Dom.prototype.off = function (event) {
		var me = this;
		var el = me.el;
		var removeEventListener = el.removeEventListener || el.detachEvent;
		var eventName = el.removeEventListener ? event : ('on' + event);

		if (me._events && me._events[event]) {
			var events = me._events[event];

			for (var i = 0, len = events.length; i < len; i++) {
				removeEventListener.call(el, eventName, events[i], false);
			}
		}
		
		return me;
	};

	/**
	 * 事件代理
	 * @param  {Function}   selector 选择器方法，返回true则代表代理处理
	 * @param  {string}   type     事件类型
	 * @param  {Function} fn       回调函数
	 * @return {object}            返回原型链类
	 */
	Dom.prototype.delegate = function (selector, type, fn) {
		var me = this;

		me.on(type, function(e) {
			var parent = e.target;

			while(parent && me.el !== parent) {
				if (selector(parent)) {
					fn.call(parent, e);
					break;
				}

				parent = parent.parentNode;
			}
		});

		return me;
	};
	Ze.$ = $;

	/**
	 * 遍历非文字节点，使用广度搜索
	 * @param  {element}   doms     非文字节点
	 * @param  {Function} callback 回调函数
	 * @return {null}            无
	 */
	function domTreeWalk (doms, callback) {
		if (!isFunc(callback)) {
			throw new Error('callback must be a function');
		}

		if (!('length' in doms)) {
			doms = [doms];
		}

		doms = slice.call(doms);

		while(doms.length) {
			var dom = doms.shift(),
			ret = callback(dom);

			if (ret) {
				continue;
			}

			if (dom.childNodes && dom.childNodes.length) {
				var tempArr;
				if (isIE68) {
					tempArr = [];
					for (var i = 0, len = dom.childNodes.length; i < len; i++) {
						tempArr.push(dom.childNodes[i]);
					}					
				} else {
					tempArr = dom.childNodes;
				}

				doms = slice.call(tempArr).concat(doms);
			}
		}
	}

	/**
	 * 通过'a.b.c'这样的字符串获取某个对象的值
	 * @param  {object} data 目标对象
	 * @param  {string} keys key的点字符串，如a.b，获取的就是对象a下b的值
	 * @return {mixed}      对应的值
	 */
	function getData (data, keys) {
		if (isStr(keys)) {
			keys = keys.split('.');
		}

		var temp = data;
		for (var i = 0, len = keys.length; i < len && temp; i++) {
			temp = temp[keys[i]];
		}

		return isUndef(temp) ? null : temp;
	}

	/**
	 * 为某对象根据如a.b的值设置一个值，如果递归的过程找不到对象则会创建一个对象
	 * @param {object} data  对象
	 * @param {string} keys  如a.b这样的字符串
	 * @param {null} value 无
	 */
	function setData (data, keys, value) {
		if (isStr(keys)) {
			keys = keys.split('.');
		}

		var temp = data;
		var i = 0;
		var len = keys.length;
		for (i = 0; i < len-1; i++) {
			if (!temp[keys[i]]) {
				temp[keys[i]] = {};
			}

			temp = temp[keys[i]];
		}

		temp[keys[i]] = value;
	}

	/**
	 * 将对象里的key转化为如a.b这样的字符串
	 * @param  {object} obj    目标对象
	 * @param  {array} resArr 用于存储这些字符串的数组，递归是会使用
	 * @param  {string} prefix 命名空间前缀
	 * @return {null}        无
	 */
	function obj2Dot (obj, resArr, prefix) {
		if (!isObj(obj) || !isArr(resArr)) {
			return;
		}

		prefix = prefix ? prefix : '';

		for (var key in obj) {
			if (isObj(obj[key]) && !isArr(obj[key])) {
				obj2Dot(obj[key], resArr, prefix + key + '.');
			} else {
				resArr.push({
					key: prefix + key,
					val: obj[key]
				});
			}
		}
	}

	/**
	 * 判断两个值是否相等，若新值！！为false并且不为boolean则直接返回false，即不相等
	 * @param  {mixed} newValue 新值 
	 * @param  {mixed} oldValue 旧值
	 * @return {boolean}          是否相等
	 */
	function notSame (newValue, oldValue) {
		if (!newValue && newValue !== false) {
			return false;
		}

		if (isArr(newValue)) {
			if (isArr(oldValue)) {
				return newValue.toString() !== oldValue.toString();
			}
			return true;
		} else {
			return newValue !== oldValue;
		}
	}

	/**
	 * 模型
	 * @param {object} data 模型的原始数据
	 */
	function Model (data) {
		this.data = data;
		this._bindCbs = {
			'set': MEvent.mixin({}),
			'push': MEvent.mixin({}),
			'delete': MEvent.mixin({}),
			'splice': MEvent.mixin({})
		};

		if (defineProp) {
			extend(data, this, true);
			return data;
		}
	}
	Model.prototype.get = function (key) {
		var me = this;
		return getData(me.data, key);
	};
	Model.prototype.set = function (key, newValue) {
		var me = this;

		var keyArr;
		if (isStr(key)) {
			keyArr = [{
				key: key,
				val: newValue
			}];
		} else if (isObj(key)) {
			keyArr = [];
			obj2Dot(key, keyArr);
		} else {
			throw new Error('key must be a string or array');
		}

		keyArr.forEach(function (keyVal) {
			var oldValue = getData(me.data, keyVal.key);
			setData(me.data, keyVal.key, keyVal.val);

			if (notSame(keyVal.val, oldValue)) {
				me._bindCbs.set.trigger(keyVal.key, keyVal.val, oldValue);
			}
		});
	};
	function createGetterSetter (defaultValue, cb) {
		var value = defaultValue;

		return {
			get: function () {
				return value;
			},
			set: function (newValue) {
				cb && cb(value, newValue);
				value = newValue;
			},
			configurable: true,
			enumerable: true	
		};
	}
	function useDefineProperty (data, keys, prefix) {
		var me = this;
		prefix = prefix ? prefix : '';

		if (isStr(keys)) {
			keys = keys.split('.');
		}

		var temp = data;
		for (var i = 0, len = keys.length; i < len; i++) {
			if (!keys[i+1] || (keys[i+1] && !isObj(temp[keys[i]]))) {
				(function (parentKey) {
					var defaultVal = keys[i+1] ? {} : data[keys[i]];
					defineProp(temp, keys[i], createGetterSetter(defaultVal, function (oldValue, newValue) {
						if (notSame(newValue, oldValue)) {
							if (isObj(newValue)) {
								for (var key in newValue) {
									var nextKey = prefix + parentKey + '.' + key;
									useDefineProperty.call(me, newValue, key, prefix + parentKey + '.');
									me._bindCbs.set.trigger(nextKey, newValue[key], oldValue && oldValue[key]);
								}
							}
							me._bindCbs.set.trigger(prefix + parentKey, newValue, oldValue);
						}
					}));					
				})(keys.slice(0, i+1).join('.'));
			}

			temp = temp[keys[i]];
		}
	}
	Model.prototype.on = function (event, key, cb) {
		var eventCbs = this._bindCbs[event];
		eventCbs && eventCbs.on(key, cb);
		event === 'set' && defineProp && useDefineProperty.call(this, this.data, key);
	};
	Model.prototype.off = function (event, key, cb) {
		var eventCbs = this._bindCbs[event];
		eventCbs && eventCbs.off(key, cb);
	};
	Model.prototype.push = function (key, newValue) {
		var me = this;

		var oldValue = getData(me.data, key);

		if (!isArr(oldValue)) {
			throw new Error(key + ' must be an array');
		}

		var newValue = isArr(newValue) ? newValue : slice.call(arguments, 1);
		oldValue.push.apply(oldValue, newValue);
		me._bindCbs.push.trigger(key, newValue);
	};
	Model.prototype.pop = function (key) {
		this.splice(key, -1, 1);
	};
	Model.prototype.splice = function (key, index, len) {
		var me = this;

		var arr = getData(me.data, key);

		if (!isArr(arr)) {
			throw new Error(key + ' must be an array');
		}

		index = index < 0 ? arr.length + index : index;
		arr.splice(index, len);
		me._bindCbs.splice.trigger(key, index, len, slice.call(arguments, 3));
	};
	Model.prototype.updateAll = function () {
		var me = this;

		if (isEmptyObj(me.data)) {
			return;
		}

		// 事件列表
		bindCbs = me._bindCbs.set._events;

		for (var bindCbKey in bindCbs) {
			var data = getData(me.data, bindCbKey);
			if (data !== null) {
				me._bindCbs.set.trigger(bindCbKey, data, null);
			}
		}
	}

	/**
	 * 视图，只支持id选择器
	 * @param {string} dom id
	 */
	function View (dom) {
		var me = this;
		me.el = document.getElementById(dom);
	}

	var prefix = Ze.prefix = 'n-';

	var priority = Ze.priority = {
		high: 600,
		normal: 400,
		low: 200
	}

	var directives = {};
	function directive (names, execObj) {
		var namesArr = names.split('|');

		namesArr.forEach(function (name) {
			if (directives[prefix + name]) {
				throw new Error('should not have the same name directive: ' + name);
			}

			if (isObj(execObj)) {
				if (isUndef(execObj.priority)) {
					execObj.priority = priority.normal;
				}

			} else if (isFunc(execObj)) {
				execObj = {
					priority: priority.normal,
					parse: execObj
				}

			} else {
				throw new Error('the directive execFunc must be a function or object');

			}

			directives[prefix + name] = execObj;			
		});
	}
	Ze.directive = directive;

	function VM (config) {
		var me = this;

		var model = me.model = new Model(config.model || {});

		if (!config.view) {
			throw new Error('a VM must have view');
		}
		var view = me.view = new View(config.view);

		me.methods = config.methods || {};

		domTreeWalk(view.el, function (childNode) {
			var attrs = childNode.attributes;

			if (!attrs) {
				return;
			}

			var priorityList = [];
			for (var i = 0, len = attrs.length; i < len; i++) {
				var attr = attrs[i];
				var execName = attr.name;
				var execValue = attr.value;
				var execObj = directives[execName];

				if (isObj(execObj)) {
					priorityList.push({
						execName: execName,
						execValue: execValue,
						execObj: execObj
					});
				}
			}

			priorityList.sort(function (a, b) {
				return b.execObj.priority - a.execObj.priority;
			});

			priorityList.forEach(function (pri) {
				pri.execObj.parse.call(me, pri.execValue, childNode, model, view, pri.execName);				
			});
		});

		model.updateAll();
	}
	Ze.VM = VM;

	function isInputElement (dom) {
		// button, text, password, hidden, reset, submit, image
		// file
		//  checkbox   radio
		return dom.nodeName.toLowerCase() === 'input';
	}
	function isSelectElement (dom) {
		return dom.nodeName.toLowerCase() === 'select';
	}

	var hasOninput = (function () {
		var el = document.createElement('input');
		return 'oninput' in el;
	})();
	
	directive('bind-once', function (attrValue, dom, model, view) {
		var handler;
		if (isInputElement(dom)) {
			var type = dom.type.toLowerCase();

			if (type === 'radio') {
				handler = function (newValue, oldValue) {
					if (newValue === dom.value) {
						dom.checked = true;
					}
				};

			} else if (type === 'checkbox') {
				handler = function (newValue, oldValue) {
					var domValue = dom.value;
					if (newValue.indexOf(domValue) !== -1) {
						dom.checked = true;
					}
				};

			} else {
				handler = function (newValue, oldValue) {
					dom.value = newValue;
				};
			}

		} else if (isSelectElement(dom)) {
			var isMulti = dom.multiple;

			var optionsMap = {};
			var prefix = '_';
			for (var i = 0, len = dom.options.length; i < len; i++) {
				optionsMap[prefix + dom.options[i].value] = dom.options[i];
			}

			handler = function (newValue, oldValue) {
				if (isMulti) {
					for (var i = 0, len = newValue.length; i < len; i++) {
						var option = optionsMap[prefix + newValue[i]];
						option && (option.selected = true);
					}
				} else {
					var option = optionsMap[prefix + newValue];
					option && (option.selected = true);
				}
			};

		} else {
			var filterMethod = view._filter;
			delete view._filter;
			handler = function (newValue, oldValue) {
				if (isFunc(filterMethod)) {
					newValue = filterMethod(newValue);
				}

				dom.innerHTML = newValue;
			};

		}

		model.on('set', attrValue, function onceHandler (newValue, oldValue) {
			handler && handler(newValue, oldValue);
			model.off('set', attrValue, onceHandler);
		});
	});

	directive('bind', {
		priority: priority.normal,
		parse: function (attrValue, dom, model, view) {
			var handler;
			if (isInputElement(dom)) {
				var type = dom.type.toLowerCase();

				if (type === 'radio') {
					$(dom).on('change', function () {
						model.set(attrValue, dom.value);
					});

					if (isIE68) {
						$(dom).on('click', function () {
							dom.blur();
							dom.focus();
						});
					}

					handler = function (newValue, oldValue) {
						if (newValue === dom.value) {
							dom.checked = true;
						}
					};

				} else if (type === 'checkbox') {
					$(dom).on('change', function () {
						var domValue = dom.value;

						if (dom.checked) {
							model.push(attrValue, domValue);
						} else {
							var idx = model.get(attrValue).indexOf(domValue);
							model.splice(attrValue, idx, 1);
						}
					});

					handler = function (newValue, oldValue) {
						var domValue = dom.value;
						if (newValue.indexOf(domValue) !== -1) {
							dom.checked = true;
						}
					};

				} else {
					if (hasOninput) {
						$(dom).on('input', function () {
							model.set(attrValue, dom.value);
						});	

					} else {
						dom.onpropertychange = function () {
							model.set(attrValue, dom.value);
						};
					
					}

					handler = function (newValue, oldValue) {
						dom.value = newValue;
					};
				}
			} else if (isSelectElement(dom)) {
				var isMulti = dom.multiple;

				var optionsMap = {};
				var prefix = '_';
				for (var i = 0, len = dom.options.length; i < len; i++) {
					optionsMap[prefix + dom.options[i].value] = dom.options[i];
				}

				$(dom).on('change', function () {
					var selectedValue;

					if (isMulti) {
						selectedValue = [];
						for (var i = 0, len = dom.options.length; i < len; i++) {
							if (dom.options[i].selected) {
								selectedValue.push(dom.options[i].value);
							}
						}

					} else {
						selectedValue = dom.options[dom.options.selectedIndex].value;

					}

					model.set(attrValue, selectedValue);
				});

				handler = function (newValue, oldValue) {
					if (isMulti) {
						for (var i = 0, len = newValue.length; i < len; i++) {
							var option = optionsMap[prefix + newValue[i]];
							option && (option.selected = true);
						}
					} else {
						var option = optionsMap[prefix + newValue];
						option && (option.selected = true);
					}
				};

			} else {
				var filterMethod = view._filter;
				delete view._filter;
				handler = function (newValue, oldValue) {
					if (isFunc(filterMethod)) {
						newValue = filterMethod(newValue);
					}

					dom.innerHTML = newValue;
				};

			}

			model.on('set', attrValue, function (newValue, oldValue) {
				handler && handler(newValue, oldValue);
			});
		}
	});

	directive('template', {
		priority: priority.high,
		parse: function (attrValue, dom, model, view) {
			view._tmpl = document.getElementById(attrValue).innerHTML.trim();
		}
	});

	directive('repeat', function (attrValue, dom, model, view) {
		var tmpl = view._tmpl;

		if (!tmpl) {
			return;
		}

		var $dom = $(dom);

		model.on('set', attrValue, function (newValue, oldValue) {
			var domStr = '';
			for (var i = 0, len = newValue.length; i < len; i++) {
				domStr += format(tmpl, newValue[i]);
			}

			$dom.html(domStr);
		});

		model.on('push', attrValue, function (newValue) {
			var domStr = '';
			for (var i = 0, len = newValue.length; i < len; i++) {
				domStr += format(tmpl, newValue[i]);
			}

			$dom.html('after', domStr);		
		});

		model.on('splice', attrValue, function (index, len, newValue) {
			var childNodes = dom.childNodes;
			var targetChild = childNodes[index];
			var lastIndex = index + len;
			var lastChild = childNodes[lastIndex];

			for (var i = 0; i < len; i++) {
				dom.removeChild(childNodes[--lastIndex]);
			}

			var domStr = '';
			for (var i = 0, len = newValue.length; i < len; i++) {
				domStr += format(tmpl, newValue[i]);
			}

			domStr && dom.insertBefore(createFragment(domStr), lastChild);
		});
	});

	directive('on', function (attrValue, dom, model, view) {
		var me = this;
		var attr = attrValue.split(',');
		var eventName = attr[0];
		var eventMethod = attr[1];

		$(dom).on(eventName, function (e) {
			me.methods[eventMethod] && me.methods[eventMethod].call(this, e);
		});
	});

	directive('delegate', function (attrValue, dom, model, view) {
		var me = this;
		var attr = attrValue.split(',');
		var delegateSelector = attr[0];
		var eventName = attr[1];
		var eventMethod = attr[2];

		$(dom).delegate(function (node) {
			return $(node).hasClass(delegateSelector);
		},
		eventName, 
		function (e) {
			me.methods[eventMethod] && me.methods[eventMethod].call(this, e);
		});
	});

	var displayMap = {};
	function defaultDisplay (nodeName) {
		if (!displayMap[nodeName]) {
			var display, element;
			element = document.createElement(nodeName);
			document.body.appendChild(element);
			display = $(element).css('display');
			element.parentNode.removeChild(element);
			display == 'none' && (display = 'block');
			displayMap[nodeName] = display;
		}

		return displayMap[nodeName];
	}
	directive('show|hide', function (attrValue, dom, model, view, attrName) {
		var isHide = (attrName === Ze.prefix + 'hide');

		model.on('set', attrValue, function (newValue, oldValue) {
			newValue = isHide ? !newValue : newValue; 

			if (newValue) {
				$(dom).css({
					display: defaultDisplay(dom.nodeName)
				});
			} else {
				$(dom).css({
					display: 'none'
				});
			}
		});
	});

	var filters = {};
	Ze.helper = function (filterName, filterFunc) {
		if (isFunc(filterFunc)) {
			filters[filterName] = filterFunc;
		}
	};
	directive('filter', {
		priority: priority.high,
		parse: function (attrValue, dom, model, view) {
			var me = this;

			var filterMethod = filters[attrValue] || me.methods[attrValue];
			view._filter = function (value) {
				if (isFunc(filterMethod)) {
					return filterMethod(value);
				}
			};
		}
	});

	directive('scroll', function (attrValue, dom, model, view) {
		var me = this;
		var scrollMethod = me.methods[attrValue];
		var lastScrolltop = dom.scrollTop;

		var t;
		var time = 100;
		function scrollHandle (force) {
		    var nowScrolltop = dom.scrollTop;

		    t = setTimeout(scrollHandle, time);

		    if (force || lastScrolltop !== nowScrolltop) {
		    	var swipeDirect = nowScrolltop > lastScrolltop ? 'up' : 'down';

		    	var handle = {
		    		direct: swipeDirect,

		    		atBottom: function (delta, cb) {
		    			delta = delta ? delta : 0;
		    			if ((dom.scrollHeight - (dom.scrollTop + dom.offsetHeight)) <= delta) {
		    				isFunc(cb) && cb();
		    			}
		    		},

		    		atTop: function (delta, cb) {
		    			if (dom.scrollTop <= delta) {
		    				isFunc(cb) && cb();
		    			}
		    		},

		    		stopListen: function () {
		    			clearTimeout(t);
		    		},

		    		beginListen: function () {
		    			scrollHandle();
		    		}
		    	};

		    	scrollMethod && scrollMethod.call(me, handle);
		    }
		    
		    lastScrolltop = nowScrolltop;
		}

		scrollHandle();			
	});

	directive('class', function (attrValue, dom, model, view) {
		var parse = attrValue.split(':');
		var key = parse[0];
		var classes = parse[1];
		var $dom = $(dom);

		model.on('set', key, function (newValue, oldValue) {
			if (newValue) {
				$dom.addClass(classes);
			} else {
				$dom.removeClass(classes);
			}
		});		
	});

	window.Ze = Ze;
})(window, document);