import { LightningElement, api, track, wire } from 'lwc';
import saveInlineEditRecords from '@salesforce/apex/RelatedListSetupController.saveInlineEditRecords'
import { deleteRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import getDatatableColumns from '@salesforce/apex/RelatedListSetupController.getDatatableColumns';
import getFieldsMarkedAsImage from '@salesforce/apex/RelatedListSetupController.getFieldsMarkedAsImage';
import getRelatedListValuesForDatatable from '@salesforce/apex/RelatedListSetupController.getRelatedListValuesForDatatable'
import getRelatedListValuesForCreate from '@salesforce/apex/RelatedListSetupController.getRelatedListValuesForCreate'
import saveDataTablePickListValue from '@salesforce/apex/RelatedListSetupController.saveDataTablePickListValue'
import getPicklistValues from '@salesforce/apex/RelatedListSetupController.getPicklistValues'
import getAllRecordsForMassiveCreation from '@salesforce/apex/RelatedListSetupController.getAllRecordsForMassiveCreation';
import getRelatedListSetupFields from '@salesforce/apex/RelatedListSetupController.getRelatedListSetupFields';
import validateObjectAccess from '@salesforce/apex/RelatedListSetupController.validateObjectAccess';
import { NavigationMixin } from 'lightning/navigation';
//import ID_FIELD from '@salesforce/schema/Account.Id';
import { getRecord } from 'lightning/uiRecordApi';

//https://developer.salesforce.com/docs/component-library/tools/playground/09dc554554a7194becd5bf02ad3c76bca30bc2d7/edit
// PlayGround Button Picklist Example
//https://salesforce.stackexchange.com/questions/215865/onclick-function-on-a-lightningdatatable-button/315651#315651
// Explaine how to use Button is a row - Would it be possible to update the value in the column from a Modal (Picklist)
// in inline mode

export default class LwcGenericRelatedList extends NavigationMixin(LightningElement) {
    @api recordId;
    @track draftValues = [];

    /* Start From Design Properties */
    @api headerName;
    @api isCommunity;
    @api setupId;
    @api createMode;
    @api parentName;
    @api childName;
    @api parentChildFieldRelationship;
    @api relatedListName;
    @api icon;
    @api isTableMode;
    @api relationshipApiName;
    @api buttonLabel;
    @api numberOfRowsToDisplay;
    @api imgWidth;
    @api showMessageNoRecords;
    @api navigateToRecordCreated;
    @api columnWidthsMode;
    @api displayActions;
    @api hasSoqlWhere; 
    @api soqlWhere;

    @api messageNoRecords;
    validateIfNoRecords = false;

    @api saveAndNew;
    isSaveAndNew = false;

    hasRecords = false;

    @track aLoadError = false;
    /* End From Design Properties */

    mousePositionX;
    mousePositionY;

    @track data = [];
    @track columns = [];
    @track actions = []; 
    showTable = true;
    @track fieldsMarkedAsImage = [];

    editRecordId = '';
    isLoadingCreate = false;
    fieldList = [];

    isInline = false;
    isNewFullLayout = false;
    isNew = false;
    isEdit = false;
    totalRecords;
    isPickListEdit = false;
    isCreating = false;
    picklistOptions = [];

    topInitialValue;
    leftInitialValue;
    firstRender = true;

    rowSelected;
    rowFieldNameSelected;
    
    currentPicklist;

    /* Start Datatable sort action */
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    /* End Datatable sort action */

    showFooterViewAll = false;

    recordId2Edit;
    securityObject = {};

    //============================= REFRESH THE LIST IF THE PARENT IS UPDATED ===================================================
    updatingTable = false;

/*     @wire(getRecord, { recordId: '$recordId', fields: [ID_FIELD]})
    herbalScriptRecord({ error, data}){
        let updateOnlyOnce = true;
        console.log('here in the parent refresh?');
        if(updateOnlyOnce){
            if(this.parentChildFieldRelationship != undefined || this.childName != undefined || this.parentName != undefined){
                updateOnlyOnce = false;
                this.updatingTable = true;
                console.log('before setTimeout');
                setTimeout( () => {
                    console.log('Updated');
                    this.getRelatedListValuesForDatatableFromApex();
                    updateOnlyOnce = true;
                }, 1000);
            }
        }
    } */
    //============================= REFRESH THE LIST IF THE PARENT IS UPDATED ===================================================
    
    connectedCallback(){
        this.getRelatedListSetupFieldsFromApex();
    }

    renderedCallback(){
        if(this.firstRender){
            this.leftInitialValue = this.template.querySelector('.picklistPosition').getBoundingClientRect().left;
            this.topInitialValue  = this.template.querySelector('.picklistPosition').getBoundingClientRect().top;
            if(this.leftInitialValue != 0){
                this.firstRender = false;
            }
        }
    }

    validateObjectAccessFromApex(){
        validateObjectAccess({
            childName:this.childName
        })
        .then((result) => {
            this.securityObject = result;
        })
        .catch((error) => {
            console.log('error security: ' , error);
        })
    }

    get options() {
        return this.picklistOptions;
    }

    //https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_navigate_page_types

    navigateToRelatedList() {
        // Navigate to the CaseComments related list page
        // for a specific Case record.
        this[NavigationMixin.Navigate]({
            type: 'standard__recordRelationshipPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.parentName,
                relationshipApiName: this.relationshipApiName,
                actionName: 'view'
            }
        });
    }

    getRelatedListSetupFieldsFromApex(){
        getRelatedListSetupFields({
            setupId: this.setupId
        })
        .then((data)=>{
            if(data.length != 0){
                this.parentName = data[0];
                this.childName = data[1];
                this.parentChildFieldRelationship = data[2];
                this.relationshipApiName = data[3];
                this.inCommunity = data[4] === 'true' ? true : false;
            
                if(this.parentChildFieldRelationship != undefined || this.childName != undefined || this.parentName != undefined){
                    this.isInline = this.createMode == 'Inline', true, false;

                    this.validateObjectAccessFromApex();

                    if(!this.aLoadError)
                        this.getFieldsMarkedAsImageFromApex();
                    if(!this.aLoadError)
                        this.getDatatableColumnsFromApex();
                    if(!this.aLoadError){
                        this.getRelatedListValuesForDatatableFromApex();
                    }
                    if(!this.aLoadError)
                        this.getRelatedListValuesForCreateFromApex();
                }
            }          
        })
        .catch((error)=>{
            console.log('error => getRelatedListSetupFields: ' , error);
        })
    }

    getRelatedListValuesForCreateFromApex(){
        getRelatedListValuesForCreate({
            parentName:this.parentName,
            childName:this.childName,
            setupId: this.setupId
        })
        .then(result=>{
            if(result){
                var formatResult = result;
                formatResult[formatResult.length-1].value = this.recordId;
                this.fieldList = formatResult.map(row=>{
                    return{...row,
                        class: row.styleClass}
                });

                this.aLoadError = false;
                return true;
            }
            this.aLoadError = true;
            return false;
        })
        .catch(error =>{
            this.aLoadError = true;
            console.log(error);
        })
    }
    
    getAllRecordsForMassiveCreationFromApex(){
        getAllRecordsForMassiveCreation({
            parentName: this.parentName,
            childName: this.childName,
            setupId: this.setupId
        })
        .then(result => {
            console.log('massive result: ' , result);
            console.log('columns: ' , this.columns);
            this.totalRecords = result.length ? result.length : 0;

            this.validateIfNoRecords = 
                (this.totalRecords == 0 || this.totalRecords == null || this.totalRecords == undefined)  
                && this.showMessageNoRecords ? true : false;

            this.hasRecords = 
                (this.totalRecords == 0 || this.totalRecords == null || this.totalRecords == undefined) ? false : true;

            this.data = result.map(function(row){
                for(var i in row){
                    if(typeof(row[i]) == 'object'){
                        if(i == ''){
                            continue;
                        }
                        console.log('rowType: ' + row.type);
                        console.log('type ' , typeof(row[i]));
                        console.log('row ' , row[i]);
                        console.log('i' , i);
                        let newName = i.replace('__r','').replace('_','') + 'Name';
                        let newURL = i.replace('__r','').replace('_','') + 'URL'
                        return{...row, 
                            [newName]: row[i].Name,
                            [newURL]: "/" + row[i].Id}
                    }
                }
            })
            console.log('After transform: ' , this.data);
        })
        .catch(error => {
            console.log('massive error: ' , error);
        })
    }

    getRelatedListValuesForDatatableFromApex(){
        getRelatedListValuesForDatatable({
            recordId: this.recordId,
            parentName: this.parentName,
            childName: this.childName,
            parentChildFieldRelationship: this.parentChildFieldRelationship,
            setupId: this.setupId,
            hasSoqlWhere: this.hasSoqlWhere, 
            soqlWhere: this.soqlWhere
        })
        .then(result =>{
            if(result){  
                var fieldsMarkedAsImage = this.fieldsMarkedAsImage; //You can't use this. context inside the map
                var isCommunity = this.isCommunity ? '/detail' : '';
                this.data = result.map(function(row, ){
                    for(var i in row){
                        if(typeof(row[i]) == 'object'){//\} || i == 'Name'){
                            let newName = i.replace('__r','').replace('_','') + 'Name';
                            //let newURL = i.replace('__r','').replace('_','') + 'URL'
                            row[newName] = (i == 'Name' ? row[i] : row[i].Name);
                            //row[newURL] = (i == 'Name' ? isCommunity + '/' + row['Id'] : isCommunity + '/' + row[i].Id);
                            continue;
                        }
                    }
                    return{...row, }
                })

                var dataConditional = [];
                if(result.length){
                    if(result.length > this.numberOfRowsToDisplay){
                        this.totalRecords = this.numberOfRowsToDisplay ? this.numberOfRowsToDisplay + '+' : '';
                        dataConditional = this.data.slice(0,this.numberOfRowsToDisplay);
                        this.data = dataConditional;
                        this.showFooterViewAll = true;
                    }else{
                        this.totalRecords = result.length;
                        this.showFooterViewAll = false;
                    }
                }

                this.validateIfNoRecords =
                    (this.totalRecords == 0 || this.totalRecords == null || this.totalRecords == undefined)  
                    && this.showMessageNoRecords ? true : false;

                this.hasRecords = 
                    (this.totalRecords == 0 || this.totalRecords == null || this.totalRecords == undefined) ? false : true;

                /* this.error = undefined; */
                //this.getAllRecordsForMassiveCreationFromApex();
                this.aLoadError = false;
                this.updatingTable = false;
                return true;
            }
            this.aLoadError = true;
            this.updatingTable = false;
            return false;
        })
        .catch(error =>{
            this.aLoadError = true;
            this.updatingTable = false;
            console.log(error);
        })
    }

    getFieldsMarkedAsImageFromApex(){
        getFieldsMarkedAsImage({
            parentName: this.parentName,
            childName: this.childName,
            setupId: this.setupId
        })
        .then((result) => {
            this.fieldsMarkedAsImage = result;
            this.aLoadError = false;
        })
        .catch((error) => {
            aLoadError = true;
            console.log('error: ' , error);
        })
    }

    getDatatableColumnsFromApex(){
        getDatatableColumns({
            parentName: this.parentName,
            childName: this.childName,
            imgWidth: this.imgWidth,
            setupId: this.setupId
        })
        .then(result => {
            if(result){
                const withoutParentField = JSON.parse(result).slice(0, JSON.parse(result).length-1);
                this.columns = withoutParentField;
                if(this.isTableMode){
                    this.columns.forEach(row => delete row.sortable);
                }
                if(!this.isTableMode){
                    let hasAccess = 
                        this.securityObject.isUpdateable ||
                        this.securityObject.isDeletable;

                    if(hasAccess && this.displayActions){
                        if(this.securityObject.isUpdateable) this.actions.push({ label: 'Edit' , name: 'edit'});
                        if(this.securityObject.isDeletable) this.actions.push({ label: 'Delete', name: 'delete' });

                        var action2Columns = 
                            {
                                type: 'action',
                                typeAttributes: { rowActions: this.actions },
                            };
                        this.columns.push(action2Columns);
                    }
                }

                console.log('this.columns: ' , this.columns);
                
                this.aLoadError = false;
                return true;
            }
            this.aLoadError = true;
            return false;
        })
        .catch(error => {
            this.aLoadError = true;
            console.log('error: ' , error);
        })
    }
    
    constructColumActions(label, name){

    }

    getRowActions(row, doneCallback) {
        const actions = [];
            if (row['isActive']) {
                actions.push({
                    'label': 'Deactivate',
                    'iconName': 'utility:block_visitor',
                    'name': 'deactivate'
                });
            } else {
                actions.push({
                    'label': 'Activate',
                    'iconName': 'utility:adduser',
                    'name': 'activate'
                });
            }
    }

    saveDataTablePickListValueToApex(rowId,childName,fieldName,fieldValue){
        saveDataTablePickListValue({
            rowId:rowId,
            childName:childName,
            fieldName:fieldName,
            fieldValue:fieldValue
        })
        .then(result => {
            console.log('saveDataPicklistSuccess: ' , result);
        })
        .catch(error => {
            console.log('saveDataPicklistError: ', error);
        });
    }
    newOverride = false;
    visualforceURL = '';
    spinnerOnVisualforceWrapper = false;
    closeVisualForceWrapperModal(){
        this.newOverride = false;
        this.refreshTableAndPage();
    }

    handleErrorCreation(event){
        this.recordId2Edit = null;
        this.isCreating = false;
        this.template.querySelector('.scrollToTheTop').style.scrollBehavior = "smooth"; 
        this.template.querySelector('.scrollToTheTop').scrollTop = 0; 
    }

    handleRecordSubmit(event){
        this.isCreating = true;
    }

    handleSaveAndNew(event){
        this.recordId2Edit = null;
        if(event.target.label === 'Save & New')
            this.isSaveAndNew = true;
    }

    handlerNewRecord(event){  
        document.documentElement.style.scrollBehavior = "smooth";   
        document.documentElement.scrollTop = window.scrollY + event.target.getBoundingClientRect().top - 180;

        this.isLoadingCreate = true;
        setTimeout(() => {
            this.showTable = this.isInline ? false : true;
            this.isLoadingCreate = false;
            if(this.isInline){
                this.isNew = true;
            }else{
                this.isNewFullLayout = true;
            }
            this.isEdit = false;
        }, 1000);
    }

    handleOnLoad(event){
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );

        inputFields[0].focus(); 
    }

    disconnectedcallback(){
        console.log('disconnectedcallback');
    }
    handleCancel(event){
        this.recordId2Edit = null;

        if(this.isInline){
            this.isNew = false;
        }else{
            this.isNewFullLayout = false;
        }
        this.showTable = true;
        this.isEdit = false; 
    }

    refreshTableAndPage(){
        updateRecord({ fields: { Id: this.recordId } });
        this.getRelatedListValuesForDatatableFromApex();
    }
    
    navigateToRecordViewPage(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    handleRecordCreated(event){
        this.recordId2Edit = null;
        if(this.navigateToRecordCreated && !this.isSaveAndNew){
            this.navigateToRecordViewPage(event.detail.id);
        }

        this.isLoadingCreate = true;
        this.isNewFullLayout = false;
        setTimeout(() => {
            if(this.isSaveAndNew){
                this.isNewFullLayout = true;
                this.isSaveAndNew = false;
                this.getRelatedListSetupFieldsFromApex();
                this.toastRecordCreated();
            }else{
                this.isCreating = false;
                this.showTable = true;
                if(this.isInline){
                    this.isNew = false;
                }else{
                    this.isNewFullLayout = false;
                }
            }
            this.isEdit = false;
            this.isLoadingCreate = false;
        }, 2000);
        this.refreshTableAndPage();
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
     }

    handleRowAction(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName){
            case 'delete':
                this.isLoadingCreate = true;
                this.showTable = false;
                this.deleteActionRecord(row);
                break;
            case 'edit':
                this.recordId2Edit = row.Id;
                this.handlerNewRecord(event);
                break;
            default:
                var picklistFieldName = event.detail.action.name;
                getPicklistValues({
                    childName:this.childName,
                    fieldName:picklistFieldName
                })
                .then(result=>{
                    this.currentPicklist = result;
                })
                .catch(error =>{
                    console.log(error);
                })
        
                this.isPickListEdit = true;
                this.rowSelected = event.detail.row;
                this.rowFieldNameSelected = event.detail.action.name;
                console.log('x' + this.mousePositionX);
                console.log('y' + this.mousePositionY);
                console.log('event.target.getBoundingClientRect().bottom ' + event.target.getBoundingClientRect().top);
                console.log('event.target.getBoundingClientRect().left ' + event.target.getBoundingClientRect().left);

                var topValue = this.mousePositionY - event.target.getBoundingClientRect().top;
                var leftValue = this.mousePositionX - event.target.getBoundingClientRect().left + 43;
                this.template.querySelector('.picklistPosition').style = 
                    "top:"  +  topValue + "px;" + 
                    "left:" + leftValue + "px;" + 
                    "position:absolute;" + 
                    "z-index:9999;";
        }
    }

    handleOptionChanges(event){
        var fieldName2Update = this.rowFieldNameSelected;
        var picklistValueSelected = event.currentTarget.dataset.value;
        var newList = this.data.slice(0);
        newList[newList.findIndex(element => element.Id === this.rowSelected.Id)][fieldName2Update] = picklistValueSelected;
        this.data = newList.slice(0);
        this.isPickListEdit = false;
        if(!this.isTableMode){    
            this.isLoadingCreate = true;
            this.saveDataTablePickListValueToApex(this.rowSelected.Id,this.childName,fieldName2Update,picklistValueSelected);
            
            setTimeout(() =>{
                this.refreshTableAndPage();
                this.isLoadingCreate = false;
            },2000);
        }
        this.rowSelected = null;
    }

    toastRecordCreated(){
        this.isCreating = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Record created',
                variant: 'success'
            })
        );
    }

    deleteActionRecord(row){
        deleteRecord(row.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                setTimeout(() => {
                    this.isLoadingCreate = false;
                    this.showTable = true;
                }, 2000);
                this.totalRecords -= 1;

                this.validateIfNoRecords = 
                    (this.totalRecords == 0 || this.totalRecords == null || this.totalRecords == undefined)  
                    && this.showMessageNoRecords ? true : false;

                this.refreshTableAndPage();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
                setTimeout(() => {
                    this.isLoadingCreate = false;
                    this.showTable = true;
                }, 1000);
            });
    }

    handleInlineEdit(event){
        saveInlineEditRecords({
            recordsList : event.detail.draftValues
        })
        .then(result => {
            this.refreshTableAndPage();
            this.draftValues = [];
        })
        .catch(error => {
            console.log(error);
            this.draftValues = [];
        })
    }

    mousePosition(event){
        if(this.isPickListEdit){
            this.isPickListEdit = false;
        }
        this.mousePositionX = event.clientX;
        this.mousePositionY = event.clientY;
    }

    /* Start Datatable sort action */
    //https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/example
    
    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        return function(a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    
    }
    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
    /* End Datatable sort action */
}