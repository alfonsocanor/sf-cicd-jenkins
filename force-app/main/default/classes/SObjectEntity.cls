public virtual class SObjectEntity {

    public virtual Object get(SObjectField field){
        if (field == null){
            return null;
        }

        try {
            return String.valueOf(field);
        } catch(Exception e){
            return null;
        }
    }

    public Id getId(SObjectField field) { return (Id)get(field);}
}