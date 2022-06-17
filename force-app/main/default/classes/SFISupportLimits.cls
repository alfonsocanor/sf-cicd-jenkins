global class SFISupportLimits implements vlocity_cmt.VlocityOpenInterface2 {
    public static Boolean invokeMethod(String methodName, Map<String,Object > inputMap, Map<String,Object> outMap, Map<String,Object> options) {
        if(methodName == 'getHeapSize'){
            System.debug('SFISupport - getHeapSize: ' + Limits.getHeapSize());
        }
        
        if(methodName == 'inputMapValues'){
            System.debug('SFISupport - inputMapValues: ' + inputMap);
        }
        
        if(methodName == 'mockAResponse'){
            mockAResponse(inputMap, outMap, options);
        }
        
        if(methodName == 'forceCPULimit'){
            for(Integer i = 0; i<=(Integer)inputMap.get('forceCPULimit'); i++){
                System.debug(i);
            }
        }
        
        if(methodName == 'forceSOQLChainable'){
            String accountId = [SELECT Id FROM Account LIMIT 1].Id;
            
            for(Integer i=0; i<=3;i++){
                for(Integer j=0; j<=20; j++){
                    Account acc = [SELECT Id FROM Account WHERE Id = :accountId];
                }
            }
        }
        
        return true;
    }
    
    public static void mockAResponse(Map<String,Object > inputMap, Map<String,Object> outMap, Map<String,Object> options){
        outMap.put('mockResponse', 'fromVIPUseQueueableApexRemoting');
    }
}