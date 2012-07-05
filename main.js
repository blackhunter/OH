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
			last = path[i];
		}

		if(except){
			now = {};
			for(var i in data){
				now[i] = data[i];
			}
			except.forEach(function(arg){
				delete now[arg];
			});
		}else
			now = data;

		if(!(last in main)){
			main[last] = now;
			this.emit('set',path,data,null);
			return this;
		}

		var val = main[last];
		if(typeof data == 'function'){
			if(val instanceof Date)
				prev = (new Date(val.getTime()));
			else if(val instanceof Object) {
				prev = val;
				val = Object.create(val);
			}else
				prev = val;
			data(val);
			data = val;
		}else{
			prev = val;
			main[last] = now;
		}

		this.emit('set',path,data,prev);

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
			last = path[i];
		}

		this.emit('delete',path,main[last],null);
		delete main[last];
		delete this.backup[tPath];
	};
	this.on = function(event,fun,obj){
		var events = this.handler.events,
			parts = event.split(':'),
			path = parts[1].join.apply(this,parts[0].split('.')),
			i;

		for(i=0;i<path.length;i++){
			if(i>0){
				if(!('next' in events))
					events['next'] = {};
				events = events.next;
			}

			if(!(path[i] in events))
				events[path[i]] = {};
			events = events[path[i]];
		}
		if(!('arr' in events))
			events['arr'] = [];

		events['arr'].push(fun.bind(obj));
	};
	this.emit = function(event,name,now,prev){
		if(!Array.isArray(name))
			name = [name];
		var end = name.length,
			events = this.handler.events[event],
			comb = function(main,i,arr){
				if(i<end){
					if('next' in main){
						if('*' in main.next)
							comb(main['*'],i+1,arr);
						if(arr[i] in main.next)
							comb(main[arr[i]],i+1,arr);
					}
				}else{
					var j = main.arr.length;
					while(j--){
						window.db.queue.push({fuu: main.arr[j], now: now, prev: prev, name: name});
					}
				}
			}

		if(this.handler.silent || events)
			return this;

		comb(events,0,name);

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
			last = path[i];
		}

		if(reset==-1)
			reset = this.backup[tPath].length-1;
		else if(!reset){//reset
			this.backup[tPath] = [];
			return this;
		}

		this.emit('set',path,this.backup[tPath][reset],main[last]);
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
