trigger OrderAppliedPromotionItemTrigger on vlocity_cmt__OrderAppliedPromotionItem__c (before insert) {
    
    Set<Id> ListOfQLIids = new Set<Id>();

    for(vlocity_cmt__OrderAppliedPromotionItem__c promos:trigger.new){
        ListOfQLIids.add(promos.vlocity_cmt__OrderItemId__c);
    }
    
    Map<id,OrderItem> MapOfQLI = new  Map<id,OrderItem>([
        SELECT Id, (
            SELECT Id 
            FROM vlocity_cmt__OrderAppliedPromotionAffectedItems__r) 
        FROM OrderItem 
        WHERE Id IN : ListOfQLIids
    ]);

    for(vlocity_cmt__OrderAppliedPromotionItem__c promos:trigger.new) {
        if( MapOfQLI.get(promos.vlocity_cmt__OrderItemId__c).vlocity_cmt__OrderAppliedPromotionAffectedItems__r.size() >= 1){
                promos.addError('Only Single discount promotion can be applied');
        }
    }
}