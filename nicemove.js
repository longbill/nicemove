
(function() {

var sys = function() {
	var ua = navigator.userAgent,
		b = ua.match(/iPhone/i),
		c = ua.match(/iPad/i),
		h = ua.match(/iPod/i),
		h = b || c || h,
		e = /Android/.test(ua),
		d = /WebKit/.test(ua),
		k = /Chrome/.test(ua),
		g = /webOS|TouchPad/.test(ua),
		q = /BlackBerry|RIM/.test(ua),
		f = -1;
	e && (f = ua.split("Android")[1], f = parseFloat(f.substring(0, f.indexOf(";"))));
	var l = -1;
	h && (l = parseFloat(ua.match(/os ([\d_]*)/i)[1].replace("_", ".")));
	var r = 
	{
		touch: "ontouchstart" in window,
		multiTouch: "ongesturestart" in window || q && d,
		translate3d: d && !e || 4 <= f
	};
	var m = r.touch || /Mobile|Tablet/i.test(ua);
	var ie = /MSIE/.test(ua);
	var p = ie && m;
	return {
		is: 
		{
			iPad: c,
			mobile: m,
			iOS: h,
			android: e,
			iPhone: b,
			wechat: ua.match(/MicroMessenger/i),
			webOS: g,
			BB: q,
			playBook:  q && /PlayBook/i.test(ua),
			ie: ie,
			ieMobile: p,
			webkit: d,
			chrome: k
		},
		supports: r,
		androidVersion: f,
		iOSVersion: l,
		devicePixelRatio: window.devicePixelRatio || 1
	}
}();


/**
 * useful utilities
 */
var utils = function() {
	var prefix, transformName, transitionName;
	
	function trans(el, v) {
		el.style[transformName] = v;
	}

	(function(html) {
		var g = [
			["transform", "", "transition"],
			["WebkitTransform", "-webkit-", "WebkitTransition"],
			["MozTransform", "-moz-", "MozTransition"],
			["OTransform", "-o-", "OTransition"],
			["msTransform", "-ms-", "msTransition"]
		];
		for (var i = g.length; i--;) {
			if ("undefined" != typeof html.style[g[i][0]]) {
				var f = g[i];
				transformName = f[0];
				prefix = f[1];
				transitionName = "undefined" != typeof html.style[f[2]] ? f[2] : "";
				break;
			}
		}
	})(document.documentElement);

	return {
		/**
		 * set css transform property
		 * transform(el, properties)
		 * example:
		 * 		transform(element, 'rotate(90deg)')
		 */
		transform: trans,

		/**
		 * set css translate property, use 3d translate if possible
		 * transform2(element, horizontal px, vertical px, <scale>)
		 */
		transform2: function(el, x, y, scale) {
			var v = sys.supports.translate3d ? "translate3d(" + x + "px," + y + "px,0px)" : "translate(" + x + "px," + y + "px)";
			if (scale) v += " scale(" + scale + ")";
			trans(el, v);
		},

		/**
		 * set css transition property
		 * transition(element, transition keys, animation properties, <delay>)
		 * example:
		 * 		transition(el, 'opacity', 'ease .3s')
		 */
		transition: function(el, key, animation, delay) {
			if ("transform" == key) key = prefix + key;
			el.style[transitionName] = key + " " + animation;
			if (delay) el.style[prefix + "transition-delay"] = delay + "ms";
		},

		/**
		 * clear css transition property
		 */
		resetTransition: function(el) {
			el.style[transitionName] = '';  // "all 0.0001ms linear"
			el.style[prefix + "transition-delay"] = "0";
		},

		/**
		 * delegate events
		 */
		delegate: function(a, b) {
			var c = Array.prototype.slice.call(arguments);
			c.splice(0, 2);
			return function() {
				b.apply(a, c.length ? c : Array.prototype.slice.call(arguments));
			}
		}
	}
}();


var math = function() {
	return {
		clamp: function(a, b, c) {
			return a > c ? c : a < b ? b : a;
		},
		distance: function(x1, y1, x2, y2) {
			return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
		},
		addPointOnLine: function(x, y, c, k, g) {
			return {
				x: c + (x - c) * g,
				y: k + (y - k) * g
			}
		}
	}
}();

/**
 * get the proper next frame function
 */
var requestAnimFrame = function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a, b) { window.setTimeout(a, 1E3 / 60); }
}();


function RBand() {
	this.max = this.min = this.contPos = this.v = this.p = 0;
	this.isBouncy = this.isMoving = false;
	this.vObj = 
	{
		pos: 0,
		v: 0,
		isMoving: false
	}
};

RBand.prototype.set = function(a) {
	this.p = a;
	this.v = 0
};

RBand.prototype.setBounds = function(a, b) {
	this.min = a;
	this.max = b
};

RBand.prototype.update = function(isDraggingPos, dragX, targetX) {
	if (isDraggingPos) {
		this.v = dragX - this.p;
		this.p = dragX;
		if (this.contPos < this.min || this.contPos > this.max) this.v *= 0.5;
		this.contPos += this.v;
		this.isMoving = true
	} else {
		this.isMoving = 0.1 < Math.abs(this.v);
		this.v *= 0.97;
		var a = this.contPos + this.v;
		var b = this.isBouncy ? a : this.contPos;
		if (void 0 !== targetX) {
			var c = this.velo(b, targetX, this.v);
			a = c.pos;
			this.v = c.v;
			this.isMoving = c.isMoving;
		} else if (a < this.min) {
			var c = this.velo(b, this.min, this.v);
			a = c.pos;
			this.v = c.v;
			this.isMoving = c.isMoving;
		} else if (a > this.max) {
			var c = this.velo(b, this.max, this.v);
			a = c.pos;
			this.v = c.v;
			this.isMoving = c.isMoving;
		}
		this.contPos = a;
	}
	return this.contPos
};

RBand.prototype.velo = function(a, b, c) {
	this.vObj.isMoving = 0.5 < Math.abs(b - a) || 0.5 < Math.abs(c);
	if (this.vObj.isMoving) {
		c = 0.74 * (c + 0.04 * (b - a));
		a += c;
		this.vObj.pos = a;
		this.vObj.v = c;
	} else {
		this.vObj.v = 0;
		this.vObj.pos = b;
	}
	return this.vObj;
};



function _nicemove(el, scrollHorizontal, scrollVertical, options) {
	this.isRunning = false;
	this.holder = this.content = null;
	this.minY = this.minX = this.contentY = this.contentX = 0;
	this.maxY = this.maxX = 1;
	this.numPages = 0;
	this.bounds = {};
	this.selectedPageIndex = 0;
	this.onPageChanged = null;
	this.slideCompleteTimeout = -1;
	this.onPageChangedMotionComplete = null;
	this.isPagedY = this.isPagedX = this.doScrollY = this.doScrollX = this.hasPageChanged = false;
	this.rBandY = this.rBandX = null;
	this.startDel = utils.delegate(this, this.onTouchStart);
	this.endDel = utils.delegate(this, this.onTouchEnd);
	this.moveDel = utils.delegate(this, this.onTouchMove);
	this.updateDel = utils.delegate(this, this.update);
	this.time = this.dragY = this.dragX = 0;
	this.timeThresh = 60;
	this.ignore = {x:0, y:0};
	this.isDraggingPos = false;
	this.touchStartPoint = { x: -1, y: -1 };
	this.vLocked = this.hLocked = this.isMoving = false;
	this.dragScaleV = this.dragPrevScale = this.dragScale = this.gestureStartDist = this.moveThresh = 0;
	this.isGesturing = false;
	this.dragAngleV = this.dragPrevAngle = this.dragAngle = 0;
	this.touches = null;
	this.isActive = this.isTouched = false

	this.handle = el;
	if (scrollHorizontal) this.rBandX = new RBand;
 	if (scrollVertical) this.rBandY = new RBand;
	this.doScrollX = scrollHorizontal;
	this.doScrollY = scrollVertical;
	if (!scrollHorizontal || !scrollVertical) this.moveThresh = 1;
	this.content = el;
	this.holder = el.parentNode;
	if (options) for (var e in options) this[e] = options[e];
	(this.isPagedX || this.isPagedY) && (this.numPages = el.children.length);
	this.activate(true);
	this.resize();
	sys.is.android && (this.timeThresh = 100)
};

_nicemove.prototype.activate = function(a) {
	this.handle[a ? "addEventListener" : "removeEventListener"](sys.supports.touch ? "touchstart" : "mousedown", this.startDel, false);
	this.isActive = a;
	this.isDraggingPos && this.dragEnd(this.dragX, this.dragY, {})
};

_nicemove.prototype.remove = function() {
	this.pause();
	this.activate(false);
	this.listenForMoveAndEnd(false);
	utils.resetTransition(this.content);
	this.content = this.holder = this.onPageChanged = null
};

_nicemove.prototype.slideTo = function(x, y, ms, easing) {
	void 0 == ms && (ms = 350);
	utils.resetTransition(this.content);
	utils.transform2(this.content, -x, -y);
	utils.transition(this.content, "transform", ms + "ms " + (easing || ""));
	var e = this;
	setTimeout(function(){ e.pause(); }, 0);
	clearTimeout(this.slideCompleteTimeout);
	this.slideCompleteTimeout = setTimeout(function() {
		utils.resetTransition(e.content)
	}, ms + 1);
	this.doScrollX && (this.rBandX.contPos = this.contentX = -x);
	this.doScrollY && (this.rBandY.contPos = this.contentY = -y)
};

_nicemove.prototype.toPageIndex = function(a, b, c) {
	this.slideTo(this.bounds.width * a, this.contentY, b, c);
	this.pageChanged(a)
};

_nicemove.prototype.play = function() {
	!this.isRunning && this.isActive && (this.isRunning = true, this.update())
};

_nicemove.prototype.pause = function() {
	this.isRunning = false
};

_nicemove.prototype.listenForMoveAndEnd = function(isRemove) {
	var method = isRemove ? "addEventListener" : "removeEventListener";
	document[method](sys.supports.touch ? "touchmove" : "mousemove", this.moveDel, false);
	document[method](sys.supports.touch ? "touchend" : "mouseup", this.endDel, false);
};

_nicemove.prototype.resize = function(a) {
	var b = this.contentX / (this.maxX - this.minX),
		c = this.contentY / (this.maxY - this.minY);
	if (!a) a = {
		x: 0,
		y: 0,
		width: this.holder.offsetWidth,
		height: this.holder.offsetHeight
	};

	this.bounds = a;
	if (this.isPagedX) {
		this.content.style.width = this.numPages * a.width + "px";
		for (var h = this.numPages; h--;)
		this.content.children[h].style.width = a.width + "px"
	}
	this.minX = a.width - this.content.offsetWidth;
	this.minY = a.height - this.content.offsetHeight;
	this.isPagedX && (this.minX = a.width - this.numPages * this.bounds.width);
	this.maxX = a.x;
	this.maxY = a.y;
	this.doScrollX && (this.maxX <= this.minX && (this.minX = this.maxX = 0), this.rBandX.setBounds(this.minX, this.maxX), this.contentX = this.rBandX.contPos = (this.maxX - this.minX) * b, this.rBandX.v = 0);
	this.doScrollY && (this.maxY <= this.minY && (this.minY = this.maxY = 0), this.rBandY.setBounds(this.minY, this.maxY), this.contentY = this.rBandY.contPos = (this.maxY - this.minY) * c, this.rBandY.v = 0);
	utils.transform2(this.content, this.contentX, this.contentY)
};

_nicemove.prototype.update = function() {
	if (this.isRunning) {
		requestAnimFrame(this.updateDel);
		if (this.isMoving) this.move();

		var a = this.rBandY && this.rBandY.isMoving;
		if (!(this.rBandX && this.rBandX.isMoving || a) && (this.pause(), this.hasPageChanged && this.onPageChangedMotionComplete)) this.onPageChangedMotionComplete({
			target: this,
			index: this.selectedPageIndex
		})
	}
};

_nicemove.prototype.setSnap = function(a, b, c, h, e) {
	a += 0.5 * c;
	var d = 0.65 * c;
	b = math.clamp(45 * b, -d, d);
	b = -Math.floor((a + b) / c);
	b = math.clamp(b, 0, this.numPages - 1);
	this.pageChanged(b);
	return math.clamp(-b * c, h, e);
};

_nicemove.prototype.pageChanged = function(a) {
	if (a != this.selectedPageIndex) {
		if (this.onPageChanged) this.onPageChanged({
			target: this,
			index: a,
			oldIndex: this.selectedPageIndex
		});
		this.selectedPageIndex = a;
		this.hasPageChanged = true
	}
};

_nicemove.prototype.move = function() {
	if ( (!this.vLocked || this.freeMove) && this.doScrollX) {
		this.contentX = this.rBandX.update(this.isDraggingPos, this.dragX, this.targetX);
	}

	if ( (!this.hLocked || this.freeMove) && this.doScrollY) {
		this.contentY = this.rBandY.update(this.isDraggingPos, this.dragY, this.targetY);
	}

	utils.transform2(this.content, this.contentX, this.contentY)
};

_nicemove.prototype.findDir = function() {
	if (0 == this.moveThresh) {
		this.pause();
		this.isMoving = true;
		this.move();
	} else {
		var diffX = this.dragX - this.touchStartPoint.x;
		var diffY = this.dragY - this.touchStartPoint.y;
		if (
				Math.abs(diffX) > this.moveThresh
			||
				Math.abs(diffY) > this.moveThresh
		) {
			var a = Math.abs(Math.atan2(diffY, diffX));
			this.hLocked = a < 0.25 * Math.PI || a > 0.75 * Math.PI;
			this.vLocked = !this.hLocked;
			if (this.hLocked && this.doScrollX || this.vLocked && this.doScrollY ) {
				if (!this.isMoving) {
					if (this.rBandX) this.rBandX.p -= this.vLocked ? 0 : diffX > 0 ? -1*this.moveThresh : this.moveThresh;
					if (this.rBandY) this.rBandY.p -= this.hLocked ? 0 : diffY > 0 ? -1*this.moveThresh : this.moveThresh;
				}
				this.pause();
				this.isMoving = true;
				this.move();
			} else {
				this.dragEnd(this.dragX, this.dragY);
				if (this.doScrollX && !this.anchor) {
					a = this.setSnap(this.contentX, this.rBandX.v, this.bounds.width, this.minX, this.maxX);
					this.slideTo(-a, 0, 300, "0,0,0,1");
				}
			}
		}
	}
};

_nicemove.prototype.dragStart = function(a, b, c) {
	this.hasPageChanged = false;
	utils.resetTransition(this.content);
	this.isDraggingPos = true;
	this.dragX = a;
	this.ignore.x = 0;
	this.ignore.y = 0;
	this.dragY = b;
	this.doScrollX && this.rBandX.set(this.dragX);
	this.doScrollY && this.rBandY.set(this.dragY);
	this.time = this.getTimeStamp(c);
	this.touchStartPoint.x = this.dragX;
	this.touchStartPoint.y = this.dragY;
	this.isMoving = false;
	this.pause()
};

_nicemove.prototype.dragChange = function(a, b, evt) {
	this.dragX = a;
	this.dragY = b;
	this.time = this.getTimeStamp(evt);
	this.isMoving ? this.move() : this.findDir();
	return this.isMoving;
};

_nicemove.prototype.dragEnd = function(a, b, c) {
	this.isDraggingPos = false;
	this.listenForMoveAndEnd(false);
	if (this.getTimeStamp(c) - this.time > this.timeThresh && this.doScrollX) {
		 this.rBandX.set(this.dragX);
		 if (this.doScrollY) this.rBandY.set(this.dragY);
	}
	if (this.isPagedX) {
		this.targetX = this.setSnap(this.contentX, this.rBandX.v, this.bounds.width, this.minX, this.maxX);
	}
	if (this.isPagedY) {
		this.targetY = this.setSnap(this.contentY, this.rBandY.v, this.bounds.height, this.minY, this.maxY);
	}

	if (this.anchor) {
		if (this.anchor.left) {
			this.targetX = this.contentX > this.anchor.left ? this.anchor.left : this.contentX > 0 ? 0 : undefined;
		}
		if (this.anchor.right && this.targetX === undefined) {
			var b = this.minX - this.contentX;
			this.targetX =  b > this.anchor.right ? this.minX - this.anchor.right : b > 0 ? this.minX : undefined;
		}
		if (this.anchor.top) {
			this.targetY = this.contentY > this.anchor.top ? this.anchor.top : this.contentY > 0 ? 0 : undefined;
		}
		if (this.anchor.bottom && this.targetY === undefined) {
			var b = this.minY - this.contentY;
			this.targetY =  b > this.anchor.bottom ? this.minY - this.anchor.bottom : b > 0 ? this.minY : undefined;
		}
	}
	this.play();
	delete window.NiceMove.moving_instance;
};

_nicemove.prototype.getTimeStamp = function(a) {
	return a && void 0 != a.timeStamp && 0 < a.timeStamp ? a.timeStamp : (new Date).getTime()
};

_nicemove.prototype.gestureStart = function(a, b) {
	this.isGesturing = true;
	this.dragScale = this.dragPrevScale = a;
	this.dragAngle = this.dragPrevAngle = b;
	this.dragAngleV = 0;
	this.isDraggingAngle = true
};

_nicemove.prototype.gestureChange = function(a, b) {
	this.dragScale = a;
	this.dragAngle = b
};

_nicemove.prototype.gestureEnd = function() {
	this.isGesturing = false;
};

_nicemove.prototype.onTouchStart = function(a) {
	this.isTouched = true;
	if ("mousedown" == a.type) a = this.mouseToTouchEvent(a);
	if (1 == a.touches.length)
		this.dragStart(a.touches[0].pageX, a.touches[0].pageY, a);
	else if (2 <= a.touches.length) {
		var b = a.touches[0].pageX,
			c = a.touches[0].pageY,
			h = a.touches[1].pageX,
			e = a.touches[1].pageY,
			d = math.addPointOnLine(b, c, h, e, 0.5);
		this.dragStart(d.x, d.y, a);
		this.gestureStartDist = math.distance(b, c, h, e);
		this.gestureStart(1, Math.atan2(c - e, b - h))
	}
	this.touches = a.touches;
	this.listenForMoveAndEnd(true)
};

_nicemove.prototype.onTouchMove = function(a) {
	if (window.NiceMove.moving_instance && window.NiceMove.moving_instance != this) return;
	if ("mousemove" == a.type) {
		if (!this.isTouched) return;
		a = this.mouseToTouchEvent(a)
	}
	var eventHandled = true;
	if (1 == a.touches.length) {
		eventHandled = this.dragChange(a.touches[0].pageX, a.touches[0].pageY, a);
	}
	else if (2 <= a.touches.length) {
		var b = a.touches[0].pageX,
			c = a.touches[0].pageY,
			h = a.touches[1].pageX,
			e = a.touches[1].pageY,
			d = math.addPointOnLine(b, c, h, e, 0.5);
		this.dragChange(d.x, d.y, a);
		this.gestureChange(math.distance(b, c, h, e) / this.gestureStartDist, Math.atan2(c - e, b - h))
	}
	this.touches = a.touches;


	if (eventHandled) {
		a.preventDefault();
		if (!window.NiceMove.moving_instance) window.NiceMove.moving_instance = this;
		if (this.onFirstMove && typeof this.onFirstMove == 'function'){
			this.onFirstMove.call(this.handle);
			delete this.onFirstMove;
		}
	}
};

_nicemove.prototype.onTouchEnd = function(a) {
	this.touches = a.touches;
	if ("mouseup" == a.type)
		this.isTouched = false, this.dragEnd(a.pageX, a.pageY, a);
	else if (0 == a.touches.length) {
		var b, c;
		!sys.supports.multiTouch && a.changedTouches && 1 == a.changedTouches.length ? (b = a.changedTouches[0].pageX, c = a.changedTouches[0].pageY) : (b = this.dragX, c = this.dragY);
		this.dragEnd(b, c, a);
		this.gestureEnd();
	}
	else if (1 == a.touches.length)
		this.dragStart(a.touches[0].pageX, a.touches[0].pageY, a), this.gestureEnd();
	else
		this.onTouchStart(a);
};

_nicemove.prototype.mouseToTouchEvent = function(a) {
	a.touches = [{
		pageX: a.pageX,
		pageY: a.pageY
	}];
	return a
};

_nicemove.sys = sys;
_nicemove.utils = utils;

window.NiceMove = _nicemove;



})();






