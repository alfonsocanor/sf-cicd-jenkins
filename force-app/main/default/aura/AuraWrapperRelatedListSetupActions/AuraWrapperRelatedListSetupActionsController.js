({
    handleCloseTab : function(component, event, helper) {
        var recordId = event.getParams('detail').recordId;
        var workspaceAPI = component.find("workspace");
        workspaceAPI.isConsoleNavigation()
            .then(function(response) {
                if(recordId){
                    var navEvt = $A.get("e.force:navigateToSObject");
                    navEvt.setParams({
                      "recordId": recordId,
                      "slideDevName": "detail"
                    });
                    navEvt.fire();
                }else{
                    var navEvent = $A.get("e.force:navigateToList");
                    navEvent.setParams({
                        "scope": "Related_List_Setup__c"
                    });
                    navEvent.fire();
                }
            })
            .catch(function(error) {
                console.log('handleCloseTab: ' , error);
            });

        workspaceAPI.getFocusedTabInfo()
            .then(function(response) {
                var focusedTabId = response.tabId;
                workspaceAPI.closeTab({tabId: focusedTabId});
            })
            .catch(function(error) {
                console.log(error);
            });
    }
})