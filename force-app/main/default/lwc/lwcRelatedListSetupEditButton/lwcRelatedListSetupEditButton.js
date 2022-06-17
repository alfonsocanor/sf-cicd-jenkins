import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRelateListApiNames from '@salesforce/apex/RelatedListSetupController.getRelatesListsAPIName';
import getRelateListParentField from '@salesforce/apex/RelatedListSetupController.getParentFieldAPIName';
import getAllRelatedListFields from '@salesforce/apex/RelatedListSetupController.getAllFieldsFromRelatedListObject';
import upsertRelatedListSetup from '@salesforce/apex/RelatedListSetupController.upsertRelatedListSetup';
import getRelatesListSetup2Edit from '@salesforce/apex/RelatedListSetupController.getRelatesListSetup2Edit';

const columns = [
    { label: 'Label', fieldName: 'label', type:'String'},
    { label: 'Api Name', fieldName: 'fieldName', type:'String'},
    { label: 'Required', fieldName: 'required', type:'Boolean'}
];

export default class LwcRelatedListSetupNewButton extends LightningElement {
    @api recordId;

    @track leftTableUser = [];
    @track rightTableUser = [];
    isProcessing = true;
    childOptionsFromApex;
    parentName;
    childName;
    parentOfTheChildFromApex;
    dataForTableFromApex = [];
    columns = columns;
    rowsFieldSelected = [];
    keySelected;
    nameSelected;
    columnSelected;
    elementSelected;
    fieldsValueFromApex = [];
    fieldsValue = [];


    get parentOptions() {
        return [
            { label: 'Account', value: 'Account' },
            { label: 'Contact', value: 'Contact' },
            { label: 'Formula', value: 'Compound_Quote__c'},
        ];
    }

    get childValue() { 
        return this.childName;
    }

    get leftTable(){
        return this.leftTableUser;
    }
    get rightTable(){
        return this.rightTableUser;
    }

    get childOptions() {
        return this.childOptionsFromApex;
    }

    get parentOfTheChild(){
        return this.parentOfTheChildFromApex;
    }

    get parentValue() {
        return this.parentName;
    }

    get data(){
        return this.dataForTableFromApex;
    }
    
    connectedCallback(){
        this.getCurrentValuesFromApex();
    }

    getCurrentValuesFromApex(){
        getRelatesListSetup2Edit({
            setupId:this.recordId
        })
        .then(result=>{
            console.log(result);
            this.parentName = result.Parent_Object__c;
            this.childName = result.Child_Object__c;
            this.getRelateListNamesFromApex(this.parentName);
            this.parentOfTheChildFromApex = result.Parent_Child_Field_Relationship__c;
            this.getAllRelatedListFieldsWhenEditFromApex(this.childName, JSON.parse(result.Related_List_Fields_JSON__c));

            var test1 = JSON.parse(result.Related_List_Fields_JSON__c);
            var selectedRows = [];
            for(var i in test1){
                if(test1[i].fieldName != undefined){
                    console.log('inside for: ' , test1[i].fieldName);
                    selectedRows.push(test1[i].fieldName);
                }
            }
            this.fieldsValueFromApex = selectedRows;

/*             this.fieldsValueFromApex = Object.assign([], test);
            
            console.log('this.fieldsValueFromApex: ' , this.fieldsValueFromApex); */
        })
        .catch(error =>{
            console.log(error)
        })
    }

    getAllRelatedListFieldsWhenEditFromApex(childAPIName, currentFields){
        getAllRelatedListFields({
            childName:childAPIName
        })
        .then(result => {
            this.dataForTableFromApex = result.map(row=>{
                return{...row, 
                    value: row.fieldName}
            });
            this.fieldsValue = this.fieldsValueFromApex;

            this.leftTableUser =  this.dataForTableFromApex;
            for(var i in currentFields){
                if(currentFields[i].fieldName != undefined &&
                    this.leftTableUser.findIndex(j => j.fieldName === currentFields[i].fieldName) != -1 &&
                    i < (currentFields.length - 1)){
                    this.rightTableUser.push(this.leftTableUser[this.leftTableUser.findIndex(j => j.fieldName === currentFields[i].fieldName)]);
                    this.leftTableUser.splice(this.leftTableUser.findIndex(j => j.fieldName === currentFields[i].fieldName ),1);

                }
            }
            this.isProcessing = false;
        })
        .catch(error => {
            console.log(error);
        })
    }

    handleParentChange(event){
        this.parentName = event.detail.value;
        this.childName = null;
        this.leftTableUser = [];
        this.rightTableUser = [];
        this.childOptionsFromApex = null;
        this.parentOfTheChildFromApex = null;
        this.getRelateListNamesFromApex(this.parentName);
    }

    handleChildChange(event){
        this.childName = event.detail.value;
        this.rightTableUser = [];
        this.leftTableUser = [];
        this.parentOfTheChildFromApex = null;
        this.getRelatesListParentFieldFromApex(this.parentName, this.childName);
        this.getAllRelatedListFieldsFromApex(this.childName);
    }

    getRelateListNamesFromApex(parentAPIName){
        getRelateListApiNames({
            objectParentName:parentAPIName
        })
        .then(result =>{
            console.log(result);
            this.childOptionsFromApex = result;
        })
        .catch(error => {
            console.log(error);
        })
    }

    getRelatesListParentFieldFromApex(parentAPIName, childAPIName){
        getRelateListParentField({
            parentName:parentAPIName,
            childName:childAPIName
        })
        .then(result => {
            this.parentOfTheChildFromApex = result;
        })
        .catch(error => {
            console.log(error);
        })
    }

    getAllRelatedListFieldsFromApex(childAPIName){
        getAllRelatedListFields({
            childName:childAPIName
        })
        .then(result => {
            this.dataForTableFromApex = result;
            this.leftTableUser = result;
        })
        .catch(error => {
            console.log(error);
        })
    }

    upsertRelatedListSetupInApex(fields2Save){
        upsertRelatedListSetup({
            recordId: this.recordId,
            parentName: this.parentName,
            childName: this.childName,
            parentField: this.parentOfTheChildFromApex,
            fieldsSelected: JSON.stringify(fields2Save)
        })
        .then(result => {
            console.log('success: ' , result);
            this.dispatchEvent(new CustomEvent('closetab', {
                detail: "close tab",
            }));
        })
        .catch(error => {
            console.log('error: ' , error) 
        })
    }

    getSelectedName(event){
        this.rowsFieldSelected = Object.assign([], this.template.querySelector('lightning-datatable').getSelectedRows());
        console.log(this.rowsFieldSelected.length);
        console.log(this.rowsFieldSelected);
    }

    handleSave(){
/* DATATABLELOGIC        for(var i=0; i<this.rowsFieldSelected.length; i++){
            this.rowsFieldSelected[i].styleClass ='slds-col slds-p-around_x-small slds-size_1-of-' + this.rowsFieldSelected.length;
        } */
        if(!this.isValid()){
            return true;
        }

        this.isProcessing = true;
        for(var i=0; i<this.rightTableUser.length; i++){
            this.rightTableUser[i].styleClass ='slds-col slds-p-around_x-small slds-size_1-of-' + this.rightTableUser.length;
        }

        var fields2Save = this.rightTableUser.slice(0);

        const parentFieldJSON = { 
                label:this.parentName, 
                value:null,
                fieldName:this.parentOfTheChildFromApex,
                styleClass:'slds-hide'};

        fields2Save.push(parentFieldJSON);

        this.upsertRelatedListSetupInApex(fields2Save);
    }

    handleCancel(){
        this.dispatchEvent(new CustomEvent('closetab', {
            detail: "close tab",
        }));      
    }

    getValue(event){
        this.nameSelected = event.currentTarget.dataset.name;
        this.keySelected = event.currentTarget.dataset.thekey;
        this.fieldNameSelected = event.currentTarget.dataset.fieldname;
        this.columnSelected = event.currentTarget.dataset.column;
        this.elementSelected = {
            key:this.keySelected,
            fieldName:this.fieldNameSelected,
            label:this.nameSelected
        }
    }

    toRight(event){
        if(this.columnSelected == 'b' || this.elementSelected == null){
            return;
        }
        this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(221, 219, 218)';

        var indexToRemove = this.leftTableUser.findIndex(i => i.key === this.keySelected);

        this.leftTableUser.splice(indexToRemove,1);
        this.rightTableUser.push(this.elementSelected);
        this.elementSelected = null;
    }

    toLeft(event){
        if(this.columnSelected == 'a' || this.elementSelected == null){
            return;
        }
        this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(221, 219, 218)';

        var indexToRemove = this.rightTable.findIndex(i => i.key === this.keySelected);

        this.rightTableUser.splice(indexToRemove,1);
        this.leftTableUser.push(this.elementSelected);
        this.elementSelected = null;
    }

    toUp(event){
        var indexSelected = this.rightTable.findIndex(i => i.key === this.keySelected);

        if(this.columnSelected == 'a' || indexSelected == 0){
            return;
        }

        var newArray = this.rightTable.slice(0);
        newArray[indexSelected] = this.rightTableUser[indexSelected - 1];
        newArray[indexSelected - 1] = this.rightTableUser[indexSelected];
        this.rightTableUser = newArray;
    }

    toDown(event){
        var indexSelected = this.rightTable.findIndex(i => i.key === this.keySelected);

        if(this.columnSelected == 'a' || indexSelected == (this.rightTable.length - 1)){
            return;
        }

        var newArray = this.rightTable.slice(0);
        newArray[indexSelected] = this.rightTableUser[indexSelected + 1];
        newArray[indexSelected + 1] = this.rightTableUser[indexSelected];
        this.rightTableUser = newArray;

    }

    /* Start Validation when create/Edit */
    isValid(){
        const allValid = [...this.template.querySelectorAll('.validateInput')]
        .reduce((validSoFar, inputCmp) => {
                    inputCmp.reportValidity();
                    return validSoFar && inputCmp.checkValidity();
            }, true);

        if(allValid && this.rightTableUser.length === 0){
            this.showNotification('Any field selected', 'Select fields', 'error');
            this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(194, 57, 52)';
            return false;
        }else if(allValid && this.rightTableUser.length > 10){
            this.showNotification('Fields selected', 'You can select up to 10 fields', 'error');    
            this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(194, 57, 52)';
            return false;
        }

        return allValid;
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    /* End Validation when create/Edit */
}