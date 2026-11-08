window.HASH_HANDLER = {
    hashCallbacksMappingArr: [],
    hashInitCalled:false,
    hashObj:null,
    timerId: null,

    _debounceReturnCall: (target, method, args, delay) => { 
        let arrArgs = [];
        if(!(Array.isArray(args))){
            arrArgs.push(args);
        }
        
        return function() { 
            const context = target;
            clearTimeout(hashObj.timerId) 
            hashObj.timerId = setTimeout(() => method.apply(context, arrArgs), delay) 
        } 
    },
    
    debounce: (target, method, args, delay) => { 
        let returnFunction = hashObj._debounceReturnCall(target, method, args, delay)
        returnFunction.call()
    },
    
    register: function(name, callback){
        let handler = {"name": name, "callback":callback};  //No I18N
        hashObj = this;
        this.hashCallbacksMappingArr.push(handler);
        if(!this.hashInitCalled){
            this.hashInitCalled = true;
            this.init();
        }
    },
    unregister: function(name) {
        let hashMap = this.hashCallbacksMappingArr;
        let indexToDelete = hashMap.map(function(item){ return item.name }).indexOf(name);
        this.hashCallbacksMappingArr = hashMap.filter((items, index, array)=>{
            return array[index] != array[indexToDelete];
        })
    },

    init: function(){
        window.addEventListener('hashchange', this.handleURLChange, false);
        window.addEventListener('load', this.handleURLChange, false);
    },

    handleURLChange: function(event){
        let changeEvent = {
            href: window.location.href,
            pathname: window.location.pathname,
            hash: window.location.hash,
            origin: window.location.origin,
            eventType: event.type
        }
        let callbacks = hashObj.hashCallbacksMappingArr;
        hashObj.debounce(callbacks, hashObj._callbackFunction, changeEvent, 100)
    },

    _callbackFunction: function (changeEvent) {
        this.forEach((items)=>{
            items.callback(changeEvent);
        })
    }
}
