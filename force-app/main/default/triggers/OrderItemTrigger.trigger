trigger OrderItemTrigger on OrderItem (before insert) {
    if(Trigger.isInsert){
        OrderItemHelper.breakThePostCartItems(Trigger.New);
    }
}