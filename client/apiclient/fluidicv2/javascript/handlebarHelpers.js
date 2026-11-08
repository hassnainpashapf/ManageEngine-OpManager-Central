//$Id$			
Handlebars.registerHelper('compare', function(lvalue, rvalue, options) { //No I18N
	if (arguments.length < 3)
	{
		throw new Error("Handlerbars Helper 'compare' needs 2 parameters"); //No I18N
	}
	operator = options.hash.operator || "=="; //No I18N

	var operators = {
		'==':       function(l,r) { return l == r; }, //No I18N
		'===':      function(l,r) { return l === r; }, //No I18N
		'!=':       function(l,r) { return l != r; }, //No I18N
		'<':        function(l,r) { return l < r; }, //No I18N
		'>':        function(l,r) { return l > r; }, //No I18N
		'<=':       function(l,r) { return l <= r; }, //No I18N
		'>=':       function(l,r) { return l >= r; }, //No I18N
		'typeof':   function(l,r) { return typeof l == r; } //No I18N
	}

	if (!operators[operator])
	{
		throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator); //No I18N
	}
	
	var result = operators[operator](lvalue,rvalue);
	if( result ) 
	{
		return options.fn(this);
	} 
	else 
	{
		return options.inverse(this);
	}

});
Ember.Handlebars.registerHelper('ifCond', function(a, b, options) {//No I18N
  return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    return result === b;
  });
});
Handlebars.registerHelper('ifEquals', function(a, b, options) { //No I18N
	
	var val = Ember.Handlebars.get(this,b, options);
	b = val == undefined ? b : val;
	
    return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    	return result == b;
      });
});

Handlebars.registerHelper('ifSizeEqual', function(a, b, options) { //No I18N
	
    return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    	
    	return (result != undefined && result != "" && result.length == b ) ;
    	
	});
});

Handlebars.registerHelper('ifSizeGr', function(a, b, options) { //No I18N
	
    return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    	
    	return (result != undefined && result != "" && result.length > b ) ;
    	
	});
});

Handlebars.registerHelper('ifEqualsOR', function(a,b,operator,c,d,options){ //No I18N
  // a should be model in the respective template
  // b and c should be model in the respective template or 'hardCodedValue'
  // d should be 'hardCodedValue'
  var id = options.contexts[0];
  b = id.get(b) == undefined ? b : id.get(b);
  c = id.get(c) == undefined ? false : id.get(c);
  return Ember.Handlebars.bind.call(options.contexts[0],a,options,true,function(result){
    switch(operator){
        case '&&':
          return (result===b && c===d);
        break;
        case '||':
          return (result===b || c===d);
        break;
      }
    });
});

Ember.Handlebars.registerHelper('contains', function(a, b, options) {//No I18N
     return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    return result !== undefined && result.indexOf(b) > -1;
  });
});
Ember.Handlebars.registerHelper('ifNotEq', function(a, b, options) {//No I18N
  
  var br = b;
  return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    result = String(result);
    br = String(br);
    return result !== br;
  });
});

Ember.Handlebars.registerHelper('if_or', function(a, b, oper, c, d, options) {//No I18N
  Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    a = result;
  });

 /* Ember.Handlebars.bind.call(options.contexts[0], b, options, true, function(result) {
    b = result;
  });*/

   Ember.Handlebars.bind.call(options.contexts[0], c, options, true, function(result) {
    c = result;
  });
/*
    Ember.Handlebars.bind.call(options.contexts[0], d, options, true, function(result) {
    d = result;
  });*/
  

     return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
       
       if(oper !== undefined)
      {
        switch(oper)
        {
          case "||":
             return (a === b || c === d);
           break;
          case "&&":
              return (a === b && c === d);
            break;
        }
      }
      else
      {
        return result === b;
      }

  });
   /* if(oper !== undefined)
    {
      switch(oper)
      {
        case "||":
            console.log(a,b,c,d);
           if(a == b || c == d) // Or === depending on your needs
              return opts.fn(this);
          else
              return opts.inverse(this);
         break;
      }
    }
    else
    {*/
      /*if(a == b) // Or === depending on your needs
          return opts.fn(this);
      else
          return opts.inverse(this);*/
   // }
});

Ember.Handlebars.registerHelper('getObjectProp', function(prop, context, options) { //No I18N
	var val = Ember.Handlebars.get(this,prop, options);
  	if (options && options.fn) {
    	return val ? options.fn(val) : options.inverse(context);
  	}
  	return val[context];
});

Ember.Handlebars.registerHelper('resolveProperty',function(funcName,param,options){//No I18N
  return window[funcName](Ember.Handlebars.get(this,param,options));
});

Ember.Handlebars.registerHelper('ifNot_and', function(a, b, oper, c, d, options) {//No I18N
	  Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
	    a = result;
	  });

	 /* Ember.Handlebars.bind.call(options.contexts[0], b, options, true, function(result) {
	    b = result;
	  });*/

	   Ember.Handlebars.bind.call(options.contexts[0], c, options, true, function(result) {
	    c = result;
	  });
	/*
	    Ember.Handlebars.bind.call(options.contexts[0], d, options, true, function(result) {
	    d = result;
	  });*/
	  

	     return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
	       
	       if(oper !== undefined)
	      {
    	   switch(oper)
           {
             case "||":
                return (a != b || c != d);
              break;
             case "&&":
                 return (a != b && c != d);
               break;
           }
	      }
	      else
	      {
	        return result != b;
	      }

	  });
	   /* if(oper !== undefined)
	    {
	      switch(oper)
	      {
	        case "||":
	            console.log(a,b,c,d);
	           if(a == b || c == d) // Or === depending on your needs
	              return opts.fn(this);
	          else
	              return opts.inverse(this);
	         break;
	      }
	    }
	    else
	    {*/
	      /*if(a == b) // Or === depending on your needs
	          return opts.fn(this);
	      else
	          return opts.inverse(this);*/
	   // }
	});

Ember.Handlebars.registerHelper('unless-in-array', function(array, index, options) {//No I18N
  return Ember.Handlebars.bind.call(options.contexts[0], array, options, true, function(result) {
    var arrayToCheck = result;
    // Parse string if it's a JSON array string
    if (typeof result === 'string') {
      try {
        arrayToCheck = JSON.parse(result);
      } catch (e) {
        // If parsing fails, treat as empty array
        arrayToCheck = [];
      }
    }
    if (!arrayToCheck || !Array.isArray(arrayToCheck)) {
      return true; // render (unless condition false)
    }
    return arrayToCheck.indexOf(index) === -1; // render if index NOT in array
  });
});

Handlebars.registerHelper("xif", function (expression, options) { //No I18N
  return Handlebars.helpers.x.apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("x", function(expression, options) { //No I18N
 var result;
 var context = this;
 //with(context) {
   result = (function() {
     try {
       return true;
       //return eval(expression);
     } catch (e) {
       log.warn('•Expression: {{x \'' + expression + '\'}}\n•JS-Error: ', e, '\n•Context: ', context); //No I18N
     }
   }).call(context); // to make eval's lexical this=context
 //}
 return result;
});
  
Handlebars.registerHelper("z", function () { //No I18N
  var options = arguments[arguments.length - 1]
  delete arguments[arguments.length - 1];
  return Handlebars.helpers.x.apply(this, [Array.prototype.slice.call(arguments, 0).join(''), options]);
});

Handlebars.registerHelper("zif", function () { //No I18N
  var options = arguments[arguments.length - 1]
  delete arguments[arguments.length - 1];
  return Handlebars.helpers.x.apply(this, [Array.prototype.slice.call(arguments, 0).join(''), options]) ? options.fn(this) : options.inverse(this);
});


util = {

  // a helper to safely access object properties, think ot as a lite xpath accessor
  // usage: 
  // var greeting = util.prop( { a: { b: { c: { d: 'hi'} } } }, 'a.b.c.d');
  // greeting -> 'hi'

  prop: function() {
      if (typeof props == 'string') {
        props = props.split('.');
      }
      if (!props || !props.length) {
        return obj;
      }
      if (!obj || !Object.prototype.hasOwnProperty.call(obj, props[0])) {
        return null;
      } else {
        var newObj = obj[props[0]];
        props.shift();
        return util.prop(newObj, props);  
      }
  },
  
  isNumber: function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  },
  daysInMonth: function (m, y) {
    y = y || (new Date()).getFullYear();
    return /8|3|5|10/.test(m) ? 30 : m == 1 ? (!(y % 4) && y % 100) || !(y % 400) ? 29 : 28 : 31;
  },
  uppercaseFirstLetter: function (str) {
    str || (str = '');
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  hasNumber: function (n) {
    return !isNaN(parseFloat(n));
  },
  truncate: function (str, len) {
    if (typeof str != 'string') 
    {
      return str;
    }
    len = util.isNumber(len) ? len : 20;
    return str.length <= len ? str : str.substr(0, len - 3) + '...';
  }
};

// a helper to execute any util functions and get its return
// usage: {{u 'truncate' this.title 30}} to truncate the title 
Handlebars.registerHelper('u', function() { //No I18N
    var key = '';
    var args = Array.prototype.slice.call(arguments, 0);
    
  if (args.length) {
        key = args[0];
        // delete the util[functionName] as the first element in the array
        args.shift();
        // delete the options arguments passed by handlebars, which is the last argument
        args.pop();
    }
  if (util.hasOwnProperty(key)) {
    // notice the reference to util here
    return typeof util[key] == 'function' ?
      util[key].apply(util, args) :
      util[key];
  } else {
    log.error('util.' + key + ' is not a function nor a property'); //No I18N
  }
});

// a helper to execute any util function as an if helper, 
// that util function should have a boolean return if you want to use this properly
// usage: {{uif 'isNumber' this.age}} {{this.age}} {{else}} this.dob {{/uif}}
Handlebars.registerHelper('uif', function() { //No I18N
  var options = arguments[arguments.length - 1];
  return Handlebars.helpers.x.apply(this, arguments) ? options.fn(this) : options.inverse(this);
});

// a helper to execute any global function or get global.property
// say you have some globally accessible metadata i.e 
// window.meta = {account: {state: 'MA', foo: function() { .. }, isBar: function() {...} } }
// usage: 
// {{g 'meta.account.state'}} to print the state

// or will execute a function
// {{g 'meta.account.foo'}} to print whatever foo returns
Handlebars.registerHelper('g', function() { //No I18N
    var path, value;
  if (arguments.length) {
    path = arguments[0];
    delete arguments[0];
        
    // delete the options arguments passed by handlebars
    delete arguments[arguments.length - 1];
  }
  
  // notice the util.prop is required here  
  value = util.prop(window, path);
  if (typeof value != 'undefined' && value !== null) {
    return typeof value == 'function' ? //No I18N
      value.apply({}, arguments) :
      value;
  } else {
    log.warn('window.' + path + ' is not a function nor a property'); //No I18N
  }
});

// global if 
// usage: 
// {{gif 'meta.account.isBar'}} // to execute isBar() and behave based on its truthy or not return
// or just check if a property is truthy or not
// {{gif 'meta.account.state'}} State is valid ! {{/gif}}
Handlebars.registerHelper('gif', function() { //No I18N
  var options = arguments[arguments.length - 1];
  return Handlebars.helpers.g.apply(this, arguments) ? options.fn(this) : options.inverse(this);
});

// just an {{#each}} warpper to iterate over a global array, 
// usage say you have: window.meta = { data: { countries: [ {name: 'US', code: 1}, {name: 'UK', code: '44'} ... ] } }
// {{geach 'meta.data.countries'}} {{this.code}} {{/geach}}

Handlebars.registerHelper('geach', function(path, options) { //No I18N
  var value = util.prop(window, arguments[0]);
  if (!_.isArray(value))
  {
    value = [];
  }
  return Handlebars.helpers['each'].apply(this, [value, options]);
});

Ember.Handlebars.registerHelper('listTimeStrings', function(from,to,inc,options) { //No I18N
    if (arguments.length < 4) {
        throw new Error("Handlerbars Helper 'listTimeStrings' needs 3 parameters"); //No I18N
    }
    var returnString = "",timeStr=""; //No I18N
    while (from<=to) {
        timeStr = ("00"+from).slice(-2); //No I18N
        returnString += "<option value='"+timeStr+"'>"+timeStr+"</option>"; //No I18N
        from=from+inc;
    }
    return new Handlebars.SafeString(returnString);
});

Ember.Handlebars.registerHelper('ifCompare', function(a, b, c, options) {//No I18N
  var operators = {
    '==':       function(l,r) { return l == r; }, //No I18N
    '===':      function(l,r) { return l === r; }, //No I18N
    '!=':       function(l,r) { return l != r; }, //No I18N
    '<':        function(l,r) { return l < r; }, //No I18N
    '>':        function(l,r) { return l > r; }, //No I18N
    '<=':       function(l,r) { return l <= r; }, //No I18N
    '>=':       function(l,r) { return l >= r; }, //No I18N
    'typeof':   function(l,r) { return typeof l == r; } //No I18N
  }
  return Ember.Handlebars.bind.call(options.contexts[0], a, options, true, function(result) {
    return operators[b](Number(result),Number(c));
  });
});

Ember.Handlebars.registerHelper('listVarbindStrings', function(from,to,inc,options) { //No I18N
  if (arguments.length < 4) {
      throw new Error("Handlerbars Helper 'listVarbindStrings' needs 3 parameters"); //No I18N
  }
  var returnString = "",varbindStr=0; //No I18N
  while (from<=to) {
      varbindStr = from+1; //No I18N
      returnString += "<option value='"+from+"'>"+varbindStr+"</option>"; //No I18N
      from=from+inc;
  }
  return new Handlebars.SafeString(returnString);
});

Handlebars.registerHelper('tabSpace', function(key,level,options) { //No I18N
  key= Ember.Handlebars.get(this,key, options);
  level = Ember.Handlebars.get(this,level, options);
  var returnString = "";
  for (var i = 0; i < level; i++) {
    returnString += '&nbsp; ';  //No I18N
  }
  return new Handlebars.SafeString(returnString);
});


Handlebars.registerHelper('compareValue', function(lvalue, rvalue, options) { //No I18N
  if (arguments.length < 3)
  {
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters"); //No I18N
  }
  operator = options.hash.operator || "=="; //No I18N

  lvalue = Ember.Handlebars.get(this,lvalue, options);
  rvalue = Ember.Handlebars.get(this,rvalue, options);

  var operators = {
    '==':       function(l,r) { return l == r; }, //No I18N
    '===':      function(l,r) { return l === r; }, //No I18N
    '!=':       function(l,r) { return l != r; }, //No I18N
    '<':        function(l,r) { return l < r; }, //No I18N
    '>':        function(l,r) { return l > r; }, //No I18N
    '<=':       function(l,r) { return l <= r; }, //No I18N
    '>=':       function(l,r) { return l >= r; }, //No I18N
    'typeof':   function(l,r) { return typeof l == r; } //No I18N
  }

  if (!operators[operator])
  {
    throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator); //No I18N
  }
  
  var result = operators[operator](lvalue,rvalue);
  if( result ) 
  {
    return options.fn(this);
  } 
  else 
  {
    return options.inverse(this);
  }

});

Ember.Handlebars.registerHelper('sumaddition', function(a, b, options) {//No I18N
    var a_val = Ember.Handlebars.get(this,a, options);
    var b_Val = Ember.Handlebars.get(this,b, options);
    return Number(a_val) + Number(b_Val);
});

Ember.Handlebars.registerHelper('safeStr',function(a,options){//No I18N
  var a_val = Ember.Handlebars.get(this,a,options);
  return opm_escapeHTML(a_val);
});

Ember.Handlebars.registerHelper('remoteCollectorWindowsUrl', function() { //NO I18N
  return OPMClient.RemoteCollectorDownloadUtil.windowsDownloadUrl;
});
Ember.Handlebars.registerHelper('remoteCollectorLinuxUrl', function() { //NO I18N
  return OPMClient.RemoteCollectorDownloadUtil.linuxDownloadUrl;
});