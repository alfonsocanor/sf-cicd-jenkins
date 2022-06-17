global class SetAFutureTimeOM implements vlocity_cmt.XOMOrchestrationInterfaces.IAutoTask{
    
    global void executeBatch(List<vlocity_cmt__OrchestrationItem__c> items) {	 
        
 		/*vlocity_cmt__OrchestrationItem__c orquestrationItem = [
            SELECT vlocity_cmt__ProcessAfterExpression__c
            FROM vlocity_cmt__OrchestrationItem__c
            WHERE Id = :items[0].Id
        ];
        
		String datetimeFormatted = Datetime.valueOf(orquestrationItem.vlocity_cmt__ProcessAfterExpression__c)
            .format('yyyy-MM-dd\'T\'HH:mm\'Z\'');
        
        orquestrationItem.vlocity_cmt__ProcessAfterExpression__c = datetimeFormatted;
        
        update orquestrationItem;*/
    }

}