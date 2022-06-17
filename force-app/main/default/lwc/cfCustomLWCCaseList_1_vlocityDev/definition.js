let definition = 
                {"states":[{"fields":[{"name":"['CaseNumber']","label":"Number","displayLabel":"['CaseNumber']","type":"string","fieldType":"standard","group":"Custom Properties","collapse":true,"editing":false},{"name":"['CaseOpenDate']","label":"Date Opened","displayLabel":"['CaseOpenDate']","type":"date","fieldType":"standard","group":"Custom Properties","collapse":true,"editing":false},{"name":"['CaseStatus']","label":"Status","displayLabel":"['CaseStatus']","type":"string","fieldType":"standard","group":"Custom Properties","collapse":true,"editing":false},{"name":"['CaseSubject']","label":"Subject","displayLabel":"['CaseSubject']","type":"string","fieldType":"standard","group":"Custom Properties","collapse":true,"editing":false}],"conditions":{"group":[{"field":"$scope.data.status","operator":"===","value":"'active'","type":"system"}]},"definedActions":{"actions":[{"type":"Vlocity Action","id":"team Update Case","displayName":"Update Case","iconName":"action:description","collapse":true,"isCustomAction":false,"hasExtraParams":false}]},"name":"Active","lwc":{"MasterLabel":"dataTable","DeveloperName":"dataTable","Id":"0Rb5Y000000pmrdSAS","name":"dataTable"},"isSmartAction":false,"smartAction":{},"sObjectType":"Case","actionCtxId":"['CaseId']","customLwc":true,"customLwcRepeat":false,"customLwcAttributes":[{"name":"records","val":"$scope.records"},{"name":"columns","val":"$scope.session.columns"}]}],"filter":{},"dataSource":{"type":"IntegrationProcedures","value":{"ipMethod":"sample_getCaseList","optionsMap":{"vlcClass":"vlocity_cmt.IntegrationProcedureService"},"inputMap":{"AccountId":"{{params.id}}"},"resultVar":"['Cases']"},"contextVariables":[{"name":"params.id","val":"0015Y00002dLQKgQAS"}]},"title":"Cases","enableLwc":true,"sessionVars":[{"name":"columns","val":"[{\"fieldName\": \"CaseNumber\", \"label\": \"Case Number\", \"sortable\" : \"true\"},{\"fieldName\": \"CaseStatus\", \"label\": \"Status\"},{\"fieldName\": \"CaseSubject\", \"label\": \"Subject\"}]"}],"GlobalKey__c":"custom LWC Case List/vlocityDev/1/1594255352759"}; 
            export default definition