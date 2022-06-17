/** this is a sample code for custom implementation for the GetCacheData interface which changes the behaviour of 
 * getResponseRecords method and getResponseRecordsByMultipleTypesAndMultipleKeys method of the default implementation. 
 * THIS IS SALESFORCE INTERNAL CODE AND SHOULD NOT BE SHARED OUTSIDE WITHOUT PRIOR APPROVALS.
 * Author : Nimish Ayachi
 * */
global class CustomGetCacheData implements vlocity_cmt.VlocityOpenInterface
{

    private vlocity_cmt.VOIInvoker invoker = vlocity_cmt.VOIInvoker.getInstance();
	private vlocity_cmt.VlocityOpenInterface voi = (vlocity_cmt.VlocityOpenInterface)invoker.invoke('DefaultGetCacheDataImplementation', 'debugCreate', null, null, null);
    global Boolean invokeMethod(String methodName, Map<String, Object> inputMap, Map<String, Object> outputMap,
                                Map<String, Object> options)
    {
        if (methodName.equals('getCachedResponse'))
        {
            if (inputMap == null || inputMap.get('cache_key') == null
                    || inputMap.get('type') == null)
            {
                return false;
            }
            if (inputMap.get('cache_key') instanceOf String)
            {
                getCachedResponse(inputMap, outputMap);
            }
            else
            {
                voi.invokeMethod(methodName ,inputMap, outputMap, options);
            }
            
        }
        else if(methodName.equals('getCachedRecordByMultipleTypesAndMultipleKeys'))
        {
            if (inputMap == null || inputMap.get('cache_key') == null
                  || inputMap.get('type') == null)
            {
                return false;
            }
            getResponseRecordsByMultipleTypesAndMultipleKeys(inputMap, outputMap);
        }
        else
        {
            // calling the method of default implementation
            voi.invokeMethod(methodName ,inputMap, outputMap, options);
        }
        return true;
    }
    
    private void getCachedResponse(Map<String, Object> inputMap, Map<String, Object> outputMap)
    {
        String cache_key = (String) inputMap.get('cache_key');
        String cache_type = (String) inputMap.get('type');

        try
        {
            Datetime currentTime = Datetime.now();
            vlocity_cmt__CachedAPIResponse__c cacheApiResponse;
            Decimal previousSeq = 0;
            List<vlocity_cmt__CachedAPIResponse__c> responses;
            String cacheName=null;
            if(cache_type == 'basketWrapper' || cache_type == 'orderConfiguration')
            {
                List<vlocity_cmt__CachedAPIResponse__c> names= [SELECT Name from vlocity_cmt__CachedAPIResponse__c WHERE vlocity_cmt__CacheKey__c =  :cache_key AND vlocity_cmt__Type__c = :cache_type AND vlocity_cmt__OverflowSequence__c = 1 ORDER BY CreatedDate DESC LIMIT 1];
                cacheName=names[0].Name;
                responses = [SELECT Name,vlocity_cmt__ApiResponse__c, vlocity_cmt__OverflowSequence__c
                                FROM vlocity_cmt__CachedAPIResponse__c
                                WHERE  vlocity_cmt__CacheKey__c =  : cache_key AND  vlocity_cmt__Type__c = : cache_type AND Name = :cacheName
                                AND ((vlocity_cmt__EffectiveStartTime__c = NULL OR vlocity_cmt__EffectiveStartTime__c <= :currentTime)
                                AND (vlocity_cmt__ExpirationTime__c > :currentTime OR vlocity_cmt__ExpirationTime__c = NULL))
                                ORDER BY vlocity_cmt__OverflowSequence__c ASC];
            }else{
                responses = [SELECT Name,vlocity_cmt__ApiResponse__c, vlocity_cmt__OverflowSequence__c
                                FROM vlocity_cmt__CachedAPIResponse__c
                                WHERE  vlocity_cmt__CacheKey__c =  : cache_key AND  vlocity_cmt__Type__c = : cache_type
                                AND ((vlocity_cmt__EffectiveStartTime__c = NULL OR vlocity_cmt__EffectiveStartTime__c <= :currentTime)
                                AND (vlocity_cmt__ExpirationTime__c > :currentTime OR vlocity_cmt__ExpirationTime__c = NULL))
                                ORDER BY CreatedDate DESC, vlocity_cmt__OverflowSequence__c ASC];
            }
            
            while ( responses.size() > 0 )
            {
                vlocity_cmt__CachedAPIResponse__c resApiResponse = responses.remove(0);
                if(previousSeq == 1 && resApiResponse.vlocity_cmt__OverflowSequence__c == 1)
                    break;
                if(resApiResponse.vlocity_cmt__OverflowSequence__c == 1 || resApiResponse.vlocity_cmt__OverflowSequence__c == null){
                    cacheApiResponse = resApiResponse;
                    cacheName=resApiResponse.Name;
                }
                else{
                    if(resApiResponse.Name==cacheName){
                        cacheApiResponse.vlocity_cmt__ApiResponse__c += resApiResponse.vlocity_cmt__ApiResponse__c;
                    }
                }
                previousSeq = resApiResponse.vlocity_cmt__OverflowSequence__c;
            }

            if (cacheApiResponse != null)
                outputMap.put('result', cacheApiResponse.vlocity_cmt__ApiResponse__c);
        }
        catch (Exception e)
        {
            System.debug(LoggingLevel.ERROR, e.getMessage());
        }
    }

    private void getResponseRecordsByMultipleTypesAndMultipleKeys(Map<String, Object> inputMap, Map<String, Object> outputMap)
    {
        Set<String> cache_keys = (Set<String>) inputMap.get('cache_key');
        Set<String> cache_types = (Set<String>) inputMap.get('type');
        Map<String,Object> responseMap = new Map<String,Object>();
        try
        {
            Datetime currentTime = Datetime.now();
            vlocity_cmt__CachedAPIResponse__c cacheApiResponse;
            Decimal previousSeq = 0;
            Set<String> keySet = new Set<String>();//Set to store temporary keys
            String temporaryKey;
            String temporaryApiResponse;

            //cache_types=>itemDetails,wrapper,orderConfig
            if(cache_types.contains('basketWrapper') || cache_types.contains('orderConfiguration'))
            {
                
                Set<String> typesForDuplicates=new Set<String>();
                
                if(cache_types.remove('basketWrapper')){
                    typesForDuplicates.add('basketWrapper');
                }

                if(cache_types.remove('orderConfiguration')){
                    typesForDuplicates.add('orderConfiguration');
                }
                
                //Set to store unique names for each type
                Set<String> nameSet=new Set<String>();
                
                for(vlocity_cmt__CachedAPIResponse__c nameRes : [SELECT Name,vlocity_cmt__Type__c from vlocity_cmt__CachedAPIResponse__c 
                                                    WHERE vlocity_cmt__CacheKey__c in  :cache_keys 
                                                    AND vlocity_cmt__Type__c IN :typesForDuplicates
                                                    AND vlocity_cmt__OverflowSequence__c = 1 
                                                    ORDER BY CreatedDate DESC])
                {
                    if(typesForDuplicates.contains(nameRes.vlocity_cmt__Type__c)){
                        nameSet.add(nameRes.Name);
                        typesForDuplicates.remove(nameRes.vlocity_cmt__Type__c);
                    }
                    //Break if we have cache name for all the types in typesForDuplicates set.
                    if(typesForDuplicates.isEmpty())
                        break;
                }

                for (vlocity_cmt__CachedAPIResponse__c resApiResponse : [SELECT vlocity_cmt__CacheKey__c,vlocity_cmt__ApiResponse__c, vlocity_cmt__OverflowSequence__c,vlocity_cmt__Type__c
                                                        FROM vlocity_cmt__CachedAPIResponse__c
                                                        WHERE ((vlocity_cmt__CacheKey__c IN  : cache_keys AND  vlocity_cmt__Type__c IN : cache_types) OR Name IN : nameSet)
                                                        AND ((vlocity_cmt__EffectiveStartTime__c = NULL OR vlocity_cmt__EffectiveStartTime__c <= :currentTime)
                                                        AND (vlocity_cmt__ExpirationTime__c > :currentTime OR vlocity_cmt__ExpirationTime__c = NULL))
                                                        ORDER BY vlocity_cmt__OverflowSequence__c ASC])
                {
                    
                    temporaryKey=resApiResponse.vlocity_cmt__CacheKey__c+'__'+resApiResponse.vlocity_cmt__Type__c;
                    
                    if(!keySet.contains(temporaryKey)){
                        keySet.add(temporaryKey);
                        temporaryApiResponse=resApiResponse.vlocity_cmt__ApiResponse__c;
                        responseMap.put(temporaryKey, temporaryApiResponse);
                    }else{
                        if(resApiResponse.vlocity_cmt__OverflowSequence__c!=null && resApiResponse.vlocity_cmt__OverflowSequence__c!=1){
                            temporaryApiResponse=responseMap.get(temporaryKey)+resApiResponse.vlocity_cmt__ApiResponse__c;
                            responseMap.put(temporaryKey, temporaryApiResponse);
                        }
                    }
                }

            }
            else
            {
                
                for (vlocity_cmt__CachedAPIResponse__c resApiResponse : [SELECT vlocity_cmt__CacheKey__c,vlocity_cmt__ApiResponse__c, vlocity_cmt__OverflowSequence__c,vlocity_cmt__Type__c
                                                        FROM vlocity_cmt__CachedAPIResponse__c
                                                        WHERE  vlocity_cmt__CacheKey__c IN  : cache_keys AND  vlocity_cmt__Type__c IN : cache_types
                                                        AND ((vlocity_cmt__EffectiveStartTime__c = NULL OR vlocity_cmt__EffectiveStartTime__c <= :currentTime)
                                                        AND (vlocity_cmt__ExpirationTime__c > :currentTime OR vlocity_cmt__ExpirationTime__c = NULL))
                                                        ORDER BY CreatedDate DESC, vlocity_cmt__OverflowSequence__c ASC])
                {
                    
                    temporaryKey=resApiResponse.vlocity_cmt__CacheKey__c+'__'+resApiResponse.vlocity_cmt__Type__c;
                    
                    if(!keySet.contains(temporaryKey)){
                        keySet.add(temporaryKey);
                        temporaryApiResponse=resApiResponse.vlocity_cmt__ApiResponse__c;
                        responseMap.put(temporaryKey, temporaryApiResponse);
                    }else{
                        if(resApiResponse.vlocity_cmt__OverflowSequence__c!=null && resApiResponse.vlocity_cmt__OverflowSequence__c!=1){
                            temporaryApiResponse=responseMap.get(temporaryKey)+resApiResponse.vlocity_cmt__ApiResponse__c;
                            responseMap.put(temporaryKey, temporaryApiResponse);
                        }
                    }
                }
            }
            if (!responseMap.isEmpty())
                outputMap.put('result', responseMap);
        }
        catch (Exception e)
        {
            System.debug(LoggingLevel.ERROR, e.getMessage());
        }
    }
}