public class OrderItemHelper {
    public static void breakThePostCartItems(List<OrderItem> oi){
        try{
        	BugWrapper bugObject;
	        //bugObject.nullPointer = 'break';
        } catch(Exception e){
            oi[0].addError('null pointer exception');
        }
    }
    
    public class BugWrapper{
        public String nullPointer;
    }
}