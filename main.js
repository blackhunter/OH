//w path obiekt zamias lokalizacji zeby nie zasmiecac dom kiedy nie trzeba
//deepth set('name.prop') aby nie trzeba bylo tworzyc za duzo obiektow
//set.except aby pominac przy zapisie ale ujac w event
//event deepts listener aby nie mieszac eventow glebokich z plytkimi
window.db = function(){

}

window.db.handler = function(obj){
	this.handler = {
		events: {},
		back: {}
	};

	this.backup = {};
	this.get = obj;
	this.set = function(name,value){
		var main = this.get,
			back = this.handler.back,
			prev = {},
			handle, i;

		if(typeof name == 'string') {
			handle = name;
			name = {};
			name[handle] = data;
		}

		for(i in name) {
			if(!(i in main)){
				//if(!this.self.q)
				//	window.db.emit(i,name[i],null,'init',this.hand.name,this.hand.mark,this.hand.mark);
				//if(!this.options.save[i])
				//	this.get[i] = name[i];
				continue;
			}

			if(main[i] instanceof Date)
				prev = (new Date(main[i].getTime()));
			else if(main[i] instanceof Object) {
				prev = main[i];
				main[i] = Object.create(main[i]);
			} else    prev = main[i];

			if(typeof name[i] == 'function')
				name[i](main[i]);
			else
				main[i] = name[i];

			if(i in back){
				if(!this.backup[i])
					this.backup[i] = [prev];
				else if((back[i]+1)==this.backup[i].unshift(prev))
					this.backup[i].pop();
			}

			//window.db.emit(i,this.get[i],prev,'set',this.hand.name,this.hand.mark);
		}

		return this;
	};
	this.delete = function(name){
		if(typeof  name == 'string'){
			if(name=='*')
				name = Object.keys(this.get);
			else
				name = [name];
		}

		var i = name.length;
		while(i--){
			if(name[i] in this.get){
				//emit
				delete this.get[name[i]];
			}
		//else?
		}
	};
	this.on = function(event,name,fun,obj){
		var events = this.handler.events;
		if(typeof name == 'function'){
			fun = name;
			name = '*';
		}

		if(!(event in events))
			events[event] = {};

		events[event][name] = fun.bind(obj);
	};
	this.emit = function(event,name){	//z samym name gdy nie chcemy zapisywać, zamiast set po prostu emit!
		var events = this.handler.events;
		if(event in events){
			if('*' in events[event])
				events[event]['*']();
			if(name in events[event])
				events[event][name]();
		}
	};
	this.back = function(name,reset){
		if(name == '*'){
			reset = name;
			name = {};
			for(var i in this.options.backup){
				name[i] = reset;
			}
		}else if(typeof name == 'object'){
			for(var i in name){
				if(!(i in this.options.backup))
					throw new Error('You try backup not allowed field!');
			}
		}else{
			if(!(name in this.options.backup))
				throw new Error('You try backup not allowed field!');
			var hang = {};
			hang[name] = reset;
			name = hang;
		}

		for(var i in name){
			if(name[i]==-1)
				name[i] = this.backup[i].length-1;
			else if(!name[i]){//reset
				this.backup[i] = [];
				continue;
			}

			//window.db.emit(i,this.backup[i][name[i]],this.get[i],'backup',this.hand.name,this.hand.mark);

			this.get[i] = this.backup[i][name[i]];
			this.backup[i].splice(0,name[i]+1);
		}

		return this;
	};
	this.clone = function(){};
}