({
    initialize: function(component, event, helper) {   
        console.log('initialize ');
      /*  var headTag = component.find("main-header");
        console.log('initialize 1  '+ headTag);
        
       var actionAcc = component.get("c.getHeaderFooter");
        console.log('initialize 1');
        actionAcc.setCallback(this, function(a){
            console.log('initialize 2');
            var rtnValue = a.getReturnValue();
            if (rtnValue !== null) {
                console.log('getReturnValue '+ rtnValue.css);
                
               // component.set("v.errorMessage",rtnValue);
              //  component.set("v.showError",true);
            }
        });
        $A.enqueueAction(actionAcc);*/
    },
	setup : function(component, event, helper) {
		console.log('laooooded');
	}
})