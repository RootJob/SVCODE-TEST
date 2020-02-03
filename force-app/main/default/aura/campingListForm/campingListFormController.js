({
	clickCreateItem: function(component, event, helper) {
        var validItem = component.find('campingform').reduce(function (validSoFar, inputCmp) {
            // Displays error messages for invalid fields
            inputCmp.showHelpMessageIfInvalid();
            return validSoFar && inputCmp.get('v.validity').valid;
        }, true);
        // If we pass error checking, do some real work
        if(validItem){
            // Create the new camping
            var newItem = component.get("v.newItem");
            //console.log("Create camping: " + JSON.stringify(newItem));
            //var theItems = component.get("v.items");
 
            // Copy the expense to a new object
            // THIS IS A DISGUSTING, TEMPORARY HACK
            //newItem = JSON.parse(JSON.stringify(newItem));
     		helper.createItem(component,newItem);
            //theItems.push(newItem);
            //component.set("v.items", theItems);
            
           
            
        }
    }
})