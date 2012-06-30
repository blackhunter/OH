//deepth set('name.prop') aby nie trzeba bylo tworzyc za duzo obiektow
//set.except aby pominac przy zapisie ale ujac w event
window.db = function(path){
	return new window.db.handler(path);
}

window.db.handler = function(obj){
	this.handler = {
		events: {},
		back: {},
		cloned: false
	};

	this.backup = {};
	this.get = obj;
	this.set = function(name,data,except){
		var back = this.handler.back,
			prev = {},
			handle, i;

		if(typeof name == 'string') {
			handle = name;
			name = {};
			name[handle] = data;
		}else{
			except = data;
		}

		for(i in name){
			var prop = window.db.comp(this.get,i.split('.')),
				main = prop[0],
				ele = prop[1],
				val = main[ele],
				now;

			if(except==true){
				//window.db.emit(i,name[i],prev,'set',this.hand.name,this.hand.mark);
				continue;
			}else if(except){
				now = Object.create(name[i]);
				//deepth clean??
				except.forEach(function(arg){
					delete name[i][arg];
				});
			}else
				now = name[i];

			if(!(i in main)){
				//window.db.emit(i,now,null,'init',this.hand.name,this.hand.mark,this.hand.mark);
				this.main[ele] = now;
				continue;
			}

			if(val instanceof Date)
				prev = (new Date(val.getTime()));
			else if(val instanceof Object) {
				prev = val;
				val = Object.create(val);
			}else    prev = val;

			if(typeof name[i] == 'function')
				name[i](val);
			else
				main[i] = name[i];

			//window.db.emit(i,now,prev,'set',this.hand.name,this.hand.mark);

			if(i in back){
				if(!this.backup[i])
					this.backup[i] = [prev];
				else if((back[i]+1)==this.backup[i].unshift(prev))
					this.backup[i].pop();
			}
		}
		return this;
	};
	this.delete = function(name){
		var param = window.db._parse(this.get,name),
			i = param.main.length;

		while(i--){
			param.last[i].forEach(function(prop){
				//emit
				delete param.main[i][prop];
			});
			param.main[i][param.last[i]]
		}
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
	this.emit = function(event,name){
		if(!(event in this.handler.events))
			return

		var events = this.handler.events[event],
			deep = function(prev,args){
				var curr = args.shift();
				if(!args.length){
					var c = prev+curr,
						n = prev+'*';

					if(c in events)
						events[c]();
					if(n in events)
						events[n]();
				}else{
					deep(prev+'*.',args.slice());
					deep(prev+curr+'.',args)
				}
			};

		if(!Array.isArray(name))
			name = name.split('.');

		deep('',name);
	};
	this.back = function(reg,reset){
		var name = {},
			i;

		if(reg in this.backup)
			name[reg] = reset;
		else{
			reg = window.db._exp(reg);
			for(i in this.backup){
				if(reg.test(i))
					name[i] = reset;
			}
		}

		for(i in name){
			if(name[i]==-1)
				name[i] = this.backup[i].length-1;
			else if(!name[i]){//reset
				this.backup[i] = [];
				continue;
			}

			//window.db.emit(i,this.backup[i][name[i]],this.get[i],'backup',this.hand.name,this.hand.mark);
			var prop = window.db.comp(this.get,i);
			prop[0][prop[1]] = this.backup[i][name[i]];
			this.backup[i].splice(0,name[i]+1);
		}

		return this;
	};
	this.setBack = function(name,ile){
		if(ile)
			this.handler.back[name] = ile;
		else{
			delete  this.handler.back[name];
			delete  this.backup[name];
		}
	}
	this.clone = function(){
		var clone = new window.db.handler(this.get);
		clone.handler.cloned = {};
		return clone;
	};
};

function k(main,path){
	var parts = path.split('.'),
		parents = [],
		childs = [];

	for(var i=0; i<parts.length-1;i++){
		if(parts[i]=='*')
			Object.keys(main)
		else
		main = main[parts[i]];
	}
	parents.push(main);
	childs.push()
	return {
		main: main,
		name: parts[i]
	};
}

window.db._parse = function(main,path){
	var parts = path.split('.'),
		end = parts.length-1,
		all = {main: [], last:[]};

	var grow = function(main,steps,i){
			if(steps[i]=='*'){
				var args = Object.keys(main);
				if(end==i){
					all.main.push(main);
					all.last.push(args);
					return;
				}

				args.forEach(function(prop){
					if(prop in main)
						grow(main[prop],steps,i+1);
				});
			}else if(steps[i] in main){
				if(end==i){
					all.main.push(main);
					all.last.push([steps[i]]);
					return;
				}else
					grow(main[steps[i]],steps,i+1);
			}
		}

	grow(main,parts,0);
	return all;
}

window.db.comp = function(main,array){

	for(var i=0; i<array.length-1;i++){
		main = main[array[i]];
	}
	return [main,array[i]];
}

window.db._exp = function(regExp){
	return new RegExp('^'+regExp.replace(/\./g,'\\.').replace(/\*/g,'[^\\.]+')+'$');
}