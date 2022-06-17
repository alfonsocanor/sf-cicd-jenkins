import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getRelateListApiNames from '@salesforce/apex/RelatedListSetupController.getRelatesListsAPIName';
import getRelateListParentField from '@salesforce/apex/RelatedListSetupController.getParentFieldAPIName';
import getParentFieldsAPIName from '@salesforce/apex/RelatedListSetupController.getParentFieldsAPIName';
import getAllFieldsFromRelatedListObject from '@salesforce/apex/RelatedListSetupController.getAllFieldsFromRelatedListObject';
import upsertRelatedListSetup from '@salesforce/apex/RelatedListSetupController.upsertRelatedListSetup';
import getRelatesListSetup2Edit from '@salesforce/apex/RelatedListSetupController.getRelatesListSetup2Edit';
import getObjectsAPIName from '@salesforce/apex/RelatedListSetupController.getPicklistValues';
import getChildNameRelatedlist from '@salesforce/apex/RelatedListSetupController.getChildNameRelatedlist';

const columns = [
    { label: 'Label', fieldName: 'label', type:'String'},
    { label: 'Api Name', fieldName: 'fieldName', type:'String'},
    { label: 'Required', fieldName: 'required', type:'Boolean'}
];

export default class LwcRelatedListSetupNewButton extends LightningElement {
    @api recordId;

    @track leftTableUser = [];
    @track rightTableUser = [];
    @track tableOptionRequired = false;

    @track createLeftTable = [];
    @track createRightTable = [];
    @track createOptionRequired = true;

    isProcessing = false;
    childOptionsFromApex;
    parentOfTheChildFromApex;
    childRelatedListApiNameFromApex;
    parentName;
    childName;
    parentOfChildName;
    sObjectsArray = [];
    dataForTableFromApex = [];
    columns = columns;
    fieldsValueFromApex = [];
    fieldsValue = [];
    soqlRelatedListValueFromApex;
    masterDetailSOQLFromApex;
    childNameRelatedlistValue;
    allFieldsMetadata = [];
    parentChildFieldRelationshipLabel;

    get parentOptions() {
        return this.sObjectsArray;
    }

    get childValue() { 
        return this.childName;
    }

    get childOptions() {
        return this.childOptionsFromApex;
    }
    
    get parentOfChildValue(){
        return this.parentOfChildName;
    }

    get parentOfChildOptions(){
        return this.parentOfTheChildFromApex;
    }

    get childRelatedListApiNameValue(){
        return this.childNameRelatedlistValue;
    }

    get childRelatedListApiNameOptions(){
        return this.childRelatedListApiNameFromApex;
    }

    get parentValue() {
        return this.parentName;
    }

    get soqlRelatedListValue(){
        return this.soqlRelatedListValueFromApex;
    }

    get data(){
        return this.dataForTableFromApex;
    }

    get masterDetailSOQL(){
        return this.masterDetailSOQLFromApex;
    }

    handleSOQLValue(event){
        if(event.target.value){
            if(event.target.value.includes('FROM ')){
                this.masterDetailSOQLFromApex = event.target.value.split('FROM ')[1].split(" ")[0];
            }
        }
    }
    
    connectedCallback(){
        this.getObjectsAPINameFromApex();
        if(this.recordId){
            this.getCurrentValuesFromApex();
        }
    }

    getObjectsAPINameFromApex(){
        getObjectsAPIName({
            childName: 'Related_List_Setup__c',
            fieldName: 'SObject_List__c'
        })
        .then(result => {
            this.sObjectsArray = result;
        })
        .catch(error => {
            console.log(error);
        })
    }

    getCurrentValuesFromApex(){
        this.isProcessing = true;

        getRelatesListSetup2Edit({
            setupId:this.recordId
        })
        .then(result=>{
            this.parentName = result.Parent_Object__c;
            this.childName = result.Child_Object__c;
            this.parentOfChildName = result.Parent_Child_Field_Relationship__c;
            this.childNameRelatedlistValue = result.Child_Related_List_API_Name__c;

            this.getAllFieldsFromRelatedListObjectFromApex(result);

            this.getRelateListNamesFromApex(this.parentName)
            this.getParentFieldsAPINameFromApex(this.parentName, this.childName);
            this.getChildNameRelatedlistFromApex(this.parentName, this.parentOfChildName);
            this.soqlRelatedListValueFromApex = result.SOQL__c;
            this.masterDetailSOQLFromApex = (result.SOQL__c) ? result.SOQL__c.split('FROM ')[1].split(" ")[0] : '';

/*             var test1 = JSON.parse(result.Related_List_Fields_JSON__c);
            var selectedRows = [];
            for(var i in test1){
                if(test1[i].fieldName != undefined){
                    console.log('inside for: ' , test1[i].fieldName);
                    selectedRows.push(test1[i].fieldName);
                }
            }
            this.fieldsValueFromApex = selectedRows; */
        })
        .catch(error =>{
            console.log(error)
        })
    }

    getAllFieldsFromRelatedListObjectFromApex(connectedConfiguration){
        getAllFieldsFromRelatedListObject({
            childName:this.childName,
            parentField:this.parentOfTheChildFromApex
        })
        .then(result => {
            console.log('getAllFieldsFromRelatedListObjectFromApex: ', result);
            this.allFieldsMetadata = result;
            if(connectedConfiguration.Related_List_Fields_JSON__c){
                this.getAllRelatedListFieldsWhenEditFromApex(result, JSON.parse(connectedConfiguration.Related_List_Fields_JSON__c), 'leftTableUser', 'rightTableUser');
            } else {
                this.getAllRelatedListFieldsFromApex(result, 'leftTableUser');
            }

            if(connectedConfiguration.Create_Fields_JSON__c){
                this.getAllRelatedListFieldsWhenEditFromApex(result, JSON.parse(connectedConfiguration.Create_Fields_JSON__c), 'createLeftTable', 'createRightTable');          
            } else {
                this.getAllRelatedListFieldsFromApex(result, 'createLeftTable');
            }
        })
        .catch(error => {
            console.log('error allFieldsMetadata: ' , error);
        })
    }

    getAllRelatedListFieldsWhenEditFromApex(result, currentFields, leftColumnName, rightColumnName){
        this.dataForTableFromApex = result.map(row=>{
            return{...row, 
                value: row.fieldName}
        });
/*         this.fieldsValue = this.fieldsValueFromApex; */

        this[leftColumnName] =  this.dataForTableFromApex;
        for(var i in currentFields){
            if(currentFields[i].fieldName != undefined &&
                this[leftColumnName].findIndex(j => j.fieldName === currentFields[i].fieldName) != -1 &&
                i < (currentFields.length - 1)){
                this[rightColumnName].push(currentFields[i]);
                this[leftColumnName].splice(this[leftColumnName].findIndex(j => j.fieldName === currentFields[i].fieldName ),1);
            }
        }
        this.isProcessing = false;
    }

    getLabelFromAllFieldsMetadataFieldVariable(apiFieldName){
        console.log('HERE getLabelFromAllFieldsMetadataFieldVariable');
        let index = this.allFieldsMetadata
            .map(function(field) { return field.fieldName; }) // Create an array of values
            .indexOf(apiFieldName); // returned index of the array from the object that contains the apiFieldName key

        return this.allFieldsMetadata[index].label;
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

        this.getParentFieldsAPINameFromApex(this.parentName, this.childName);
        this.getAllRelatedListFieldsFromApex(this.childName, 'leftTableUser');
        this.getAllRelatedListFieldsFromApex(this.childName, 'createLeftTable');
    }

    handleParentOfChildChange(event){
        this.parentOfChildName = event.detail.value;
        this.getChildNameRelatedlistFromApex(this.parentName,event.detail.value);
    }

    getChildNameRelatedlistFromApex(objectParentName, parentChildFieldRelationship){
        getChildNameRelatedlist({
            objectParentName:objectParentName,
            parentChildFieldRelationship:parentChildFieldRelationship
        })
        .then((result) => {
            this.childRelatedListApiNameFromApex = result;
        })
        .catch((error) => {
            console.log('error: ', error);
        })
    }

    handlechildRelatedListApiNameChange(event){
        this.childNameRelatedlistValue = event.detail.value;
    }

    getParentFieldsAPINameFromApex(parentName, childName){
        getParentFieldsAPIName({
            parentName: parentName,
            childName: childName
        })
        .then((result) => {
            this.parentOfTheChildFromApex = result;

            for(const indexField in this.parentOfTheChildFromApex){
                this.parentOfTheChildFromApex[indexField].label = 
                    this.getLabelFromAllFieldsMetadataFieldVariable(this.parentOfTheChildFromApex[indexField].label);
            }
        })
        .catch((error) => {
            console.log('error getParentFieldsAPIName: ' + JSON.stringify(error));
        });
    }

    getRelateListNamesFromApex(parentAPIName){
        getRelateListApiNames({
            objectParentName:parentAPIName
        })
        .then(result =>{
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
            console.log('this.parentOfTheChildFromApex: SECOND ' , this.parentOfTheChildFromApex);
        })
        .catch(error => {
            console.log(error);
        })
    }

    getAllRelatedListFieldsFromApex(childAPIName, leftTableName){
        getAllFieldsFromRelatedListObject({
            childName:childAPIName,
            parentField:this.parentOfTheChildFromApex
        })
        .then(result => {
            this.allFieldsMetadata = result;
            this.dataForTableFromApex = result;
            this[leftTableName] = result;
            console.log('this[leftTableName] PARENT: ' + JSON.stringify(this[leftTableName]));
        })
        .catch(error => {
            console.log(error);
        })
    }

    upsertRelatedListSetupInApex(relatedListFields, createFieldsList){
        console.log('this.childNameRelatedlistValue: ' , this.childNameRelatedlistValue);
        upsertRelatedListSetup({
            recordId: this.recordId,
            parentName: this.parentName,
            childName: this.childName,
            parentField: this.parentOfChildName,
            relatedListFields: JSON.stringify(relatedListFields),
            createFieldsList: JSON.stringify(createFieldsList),
            soqlRelatedListValue: this.soqlRelatedListValueFromApex,
            masterDetail2: this.masterDetailSOQLFromApex,
            childNameRelatedlist: this.childNameRelatedlistValue
        })
        .then(result => {
            this.dispatchEvent(new CustomEvent('closetab', {
                detail: {
                    recordId : this.recordId
                },
            }));
        })
        .catch(error => {
            console.log('error: ' , error) 
        })
    }


    handleSave(){
/* DATATABLELOGIC        for(var i=0; i<this.rowsFieldSelected.length; i++){
            this.rowsFieldSelected[i].styleClass ='slds-col slds-p-around_x-small slds-size_1-of-' + this.rowsFieldSelected.length;
        } */
        if(!this.isValid()){
            return true;
        }

        this.isProcessing = true;

        var relatedListFields = this.formatFields2JSON('rightTableUser');
        var createFieldsList = this.formatFields2JSON('createRightTable');

        // this.soqlRelatedListValueFromApex = this.template.querySelector('lightning-textarea').value;
        console.log('Before upsertRelatedListSetupInApex');
        this.upsertRelatedListSetupInApex(relatedListFields, createFieldsList);
    }

    formatFields2JSON(arrayName){
        var array2format = this[arrayName].map(row=>{
            return{...row, 
                styleClass: 'slds-col slds-p-around_x-small slds-size_1-of-' + this[arrayName].length}});

                console.log('ARRAY1: ' + JSON.stringify(array2format));
        const parentFieldJSON = { 
                label: this.getLabelFromAllFieldsMetadataFieldVariable(this.parentOfChildName),
                value:null,
                fieldName:this.parentOfChildName,
                required: false,
                sortable: false,
                styleClass:'slds-hide'};

                console.log('ARRAY2: ' + JSON.stringify(array2format));

        array2format.push(parentFieldJSON);

        console.log('ARRAY3: ' + JSON.stringify(array2format));

        return array2format;
    }

    handleCancel(){
        this.dispatchEvent(new CustomEvent('closetab', {
            detail: "close tab",
        }));      
    }

    handleUpdateColumnsFromChild(event){
/*         console.log('UPDATE COLUMS');
        console.log('event.detail.leftTableName: ' + event.detail.leftName);
        console.log('event.detail.rightTableName: ' + event.detail.rightName); */
        this[event.detail.leftName] = event.detail.leftData;
        this[event.detail.rightName] = event.detail.rightData;
    }

    /* Start Validation when create/Edit */
    isValid(){
        const comboBoxValidation = this.template.querySelector('.relatedListFieldsCombobox').validation(1,10);
        const allValid = [...this.template.querySelectorAll('.validateInput')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
                }, true);

        if(allValid && comboBoxValidation){
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