window.db = function(path){
	return new window.db.handler(path);
}
window.db.queue = [];
window.db.interval = null;
window.db.handler = function(obj){
	this.handler = {
		events: {},
		back: {},
		cloned: false,
		silent: false
	};

	this.backup = {};
	this.get = obj;
	this.set = function(path,data,except){
		var back = this.handler.back,
			prev = {},
			now;

		var main = this.get,
			last = path,
			tPath = path;

		if(Array.isArray(path)){
			for(var i=0;i<path.length-1;i++){
				main = main[path[i]];
			}

			tPath = path.join('.');
			last = path[i+1];
		}

		if(except){
			now = Object.create(data);
			except.forEach(function(arg){
				delete data[arg];
			});
		}else
			now = data;

		if(!(last in main)){
			this.emit('init',last,now,null);
			this.main[last] = now;
			return this;
		}

		var val = main[last];

		if(val instanceof Date)
			prev = (new Date(val.getTime()));
		else if(val instanceof Object) {
			prev = val;
			val = Object.create(val);
		}else    prev = val;

		if(typeof data == 'function')
			data(val);
		else
			main[last] = data;

		this.emit('set',last,now,prev);

		if(tPath in back){
			if(!this.backup[tPath])
				this.backup[tPath] = [prev];
			else if((back[tPath]+1)==this.backup[tPath].unshift(prev))
				this.backup[tPath].pop();
		}

		return this;
	};
	this.delete = function(path){
		var main = this.get,
			last = path,
			tPath = path;

		if(Array.isArray(path)){
			for(var i=0;i<path.length-1;i++){
				main = main[path[i]];
			}

			tPath = path.join('.');
			last = path[i+1];
		}

		this.emit('delete',last,main[last],null);
		delete main[last];
		delete this.backup[tPath];
	};
	this.on = function(event,name,fun,obj){
		var events = this.handler.events;
		if(typeof name == 'function'){
			obj = fun;
			fun = name;
			name = '*';
		}

		if(!(event in events))
			events[event] = {};

		events[event][name] = fun.bind(obj);
	};
	this.emit = function(event,name,now,prev){
		if(this.handler.silient)
			return this;

		var events = this.handler.events[event];

		window.db.queue.push({fuu: events[name], now: now, prev: prev, name: name});

		if(!window.db.interval){
			window.db.interval = setInterval(function() {
				if(window.db.queue[0]){
					var b = window.db.queue.shift();
					b.fuu(b.now, b.prev, b.name);
				}else{
					clearInterval(window.db.interval);
					window.db.interval = null;
				}
			}, 0);
		}

		return this;
	};
	this.back = function(path,reset){
		var main = this.get,
			last = path,
			tPath = path;

		if(Array.isArray(path)){
			for(var i=0;i<path.length-1;i++){
				main = main[path[i]];
			}

			tPath = path.join('.');
			last = path[i+1];
		}

		if(reset==-1)
			reset = this.backup[tPath].length-1;
		else if(!reset){//reset
			this.backup[tPath] = [];
			return this;
		}

		this.emit('set',i,this.backup[tPath][reset],main[last]);
		main[last] = this.backup[tPath][reset];
		this.backup[tPath].splice(0,reset+1);

		return this;
	};
	this.setBack = function(name,ile){
		if(ile)
			this.handler.back[name] = ile;
		else{
			delete  this.handler.back[name];
			delete  this.backup[name];
		}
	};
	this.s = function(ok){
		if(!ok)
			ok = !this.handler.silent;

		this.handler.silent = !!ok;
		return this;
	}
	this.clone = function(){
		var clone = new window.db.handler(this.get);
		clone.handler.cloned = {};
		return clone;
	};
};
