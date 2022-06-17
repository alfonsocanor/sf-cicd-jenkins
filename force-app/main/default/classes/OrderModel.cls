public virtual class OrderModel extends SObjectEntity{
    public Id orderId {get { return getId(Order.Id); }}
}