(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Voir = factory();
  }
}(this, function () {
    return {
      install: function(Vue, options){
        Vue.mixin({
          created: function(){
            options.store.vue = this;
          }
        })
        Vue.prototype.dispatch = options.store.dispatch;
      },
      createStore: function(initialState,mutators){
        var ret = {
          isDispatching:false,
        	state:initialState,
          subscribers:[],
          subscribe: function(fn){
            ret.subscribers.push(fn);
          },
          notify:function(action){
            for(var i=0;i<ret.subscribers.length;i++){
              ret.subscribers[i](action,ret.getState())
            }
          },
          getState:function(){
            return ret.state;
          },
          setState:function(state){
            ret.vue._data.state = state
          },
          dispatch: function(name,data){
            var n = name.split(":");
            ret.processAction({type:n[0],data:data,message:n[1]});
          },
          processAction: function(action){
            if(ret.isDispatching === true){
              throw Error("Dispatching an action while dispatch in progress is not allowed")
            }
            ret.isDispatching = true;
          	for(var j = 0 ; j < mutators.length; j++){
            	mutators[j](ret.state,action,ret.dispatch);
            }
            ret.isDispatching = false;
            ret.notify(action);
          }
        };

        const isStarted = false;
        const isJump = false;

        if(window && window.__REDUX_DEVTOOLS_EXTENSION__){
          const devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect();
          devTools.subscribe(function(message) {
            if (message.type === 'START') {
              isStarted = true;
              var state = JSON.parse(JSON.stringify(ret.getState()));
              devTools.init(state)
            } else if (message.type === 'STOP') {
              isStarted = false;
            } else if (message.type === 'ACTION') { // Received a store action from Dispatch monitor
              store.processAction(JSON.parse(message.payload));
            } else if (message.type === 'DISPATCH' && message.payload.type === "JUMP_TO_STATE") { // Received a store action from Dispatch monitor
              var state = JSON.parse(message.state);
              debugger;
              ret.vue.$data.state = state;
            } else if (message.type === 'DISPATCH' && message.payload.type === "TOGGLE_ACTION") { // Received a store action from Dispatch monitor
              var state = JSON.parse(message.state);
              debugger;
            }
          });

          ret.subscribe(function(action,state) {
            if (!isStarted) return;
            var state = JSON.parse(JSON.stringify(ret.getState()));
            action.type = action.type+(action.message?(":"+action.message):"")
            devTools.send(action, store.getState());
          });
        }

      	return ret;
      }
    };
}));
