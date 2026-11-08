window.MESSAGE_HANDLER = {
    msgCallbacksMappingArr: [],
    msgInitCalled:false,
    msgObj:null,
    postKey:"uems_listener_AA",     //No I18N


    register: function(name, callback){
        let handlers = {"name":name, "callback":callback};      //No I18N
        this.msgCallbacksMappingArr.push(handlers);
        msgObj = this;
    },
    
    unregister: function(name) {
        let messageMap = this.msgCallbacksMappingArr;
        let indexToDelete = messageMap.map(function(item){ return item.name }).indexOf(name);
        msgObj.msgCallbacksMappingArr = messageMap.filter((items, index, array)=>{
            return array[index] != array[indexToDelete];
        });
    },

    init: function(){
        if(!this.msgInitCalled){
            window.addEventListener("message", this._messageHandling, false)
            window.addEventListener("storage",this._storageHandling,false)
            this.msgInitCalled = true;
        }
    },
    _handleMessageEvent: function(data, event){
        let callbacks = msgObj.msgCallbacksMappingArr;
        callbacks.forEach((items)=>{
            items.callback(data, event);
        })
    },

    _messageHandling: function(message) {
        try{
            let payloadDetails = message.data;
            if(payloadDetails.key && payloadDetails.key.startsWith(msgObj.postKey) && payloadDetails.data.name){
                if(payloadDetails.type === "selfcast" || payloadDetails.type === undefined){
                msgObj._handleMessageEvent(payloadDetails.data,message);
                }else if(payloadDetails.type === "broadcast"){
                    localStorage.setItem(payloadDetails.key, JSON.stringify(payloadDetails.data));
                    msgObj._handleMessageEvent(payloadDetails.data,message);
                }else if(payloadDetails.type === "crosscast"){
                    localStorage.setItem(payloadDetails.key, JSON.stringify(payloadDetails.data));
                }
            }
        }
        catch(err){
            alert(err.message);
        }
    },

    _storageHandling: function(event) {
        if(event.newValue != null && event.key.startsWith(msgObj.postKey)){
            messageHandler._handleMessageEvent(event.newValue, event);
            localStorage.removeItem(event.key);
        }
    },

    postMessage: function(data, type, targetOrigin = "*", frames = false, strictFrame = false){
        let key = this.postKey + "__" + new Date().getTime() + "__" + Math.floor((Math.random()*100000));
        let _payload = {
            "key" : key,        //No I18N
            "data" : data,      //No I18N
            "type" : type       //No I18N
        }
        if(frames === true){
          let frames = window.frames; // or // var frames = window.parent.frames;
          for (let i = 0; i < frames.length; i++) { 
            frames[i].postMessage(_payload, targetOrigin);
          }
        } else if (typeof frames === "string"){       //No I18N
            window.frames[frames].postMessage(_payload, targetOrigin);
        }else if(Array.isArray(frames)){
            frames.forEach(frame =>{
                window.frames[frame].postMessage(_payload, targetOrigin);
            });
        }
        if(!strictFrame){
         window.parent.postMessage(_payload, targetOrigin);
         window.postMessage(_payload);
        }
    }
}
