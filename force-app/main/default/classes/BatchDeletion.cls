global class BatchDeletion implements Database.Batchable<sObject>, Schedulable 
{   
    global BatchDeletion()
    {
           //constuctor  
    }
                
    global Database.QueryLocator start(Database.BatchableContext bc)
    {
        // query to delete account records with name 'Test Account12'        
        return Database.getQueryLocator([Select id from Account where Name='Test Account12']);
    } 
    
    global void execute(SchedulableContext sc)  
    {   
        //execute the batch
        BatchDeletion deleteCS = new BatchDeletion();
        ID batchprocessid = Database.executeBatch(deleteCS);
    }
    
    global void execute(Database.BatchableContext BC, list<sObject> scope)
    {     
      System.debug('## deleting '+scope.size()+' account records');   
 
        //delete list of Account records with name Test Account12
            delete scope;   
            Database.emptyRecycleBin(scope);  
    }
        
    global void finish(Database.BatchableContext BC) 
    {                 
        //no post processing
       
     }
}