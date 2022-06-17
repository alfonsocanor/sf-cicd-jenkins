import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class LwcCustomComboBox extends LightningElement {

    @api leftTableData;
    @api rightTableData;
    @api requiredOption;
    @api imageOption;
    @api comboboxTitle;
    @api leftTableName;
    @api rightTableName;

    keySelected;
    nameSelected;
    columnSelected;
    fieldNameSelected;
    elementSelected;

    renderedCallback(){
        console.log('rightTableData from combo: ' , JSON.stringify(this.rightTableData));
    }

    get leftTable(){
        return this.leftTableData;
    }
    get rightTable(){
        return this.rightTableData;
    }

    getValue(event){
        this.keySelected = event.currentTarget.dataset.thekey;
        this.nameSelected = event.currentTarget.dataset.name;
        this.columnSelected = event.currentTarget.dataset.column;
        this.fieldNameSelected = event.currentTarget.dataset.fieldname;
        this.elementSelected = {
            key:this.keySelected,
            label:this.nameSelected,
            fieldName:this.fieldNameSelected,
            required:false,
            sortable:true
        }
    }

    handleRequired(event){
        console.log('rightTableName: ' + JSON.stringify(this.rightTableData));
        console.log('event.currentTarget.dataset.thekey : ' + event.currentTarget.dataset.thekey);
        console.log('event.currentTarget.checked: ' + event.currentTarget.checked);

        var rightData = [...this.rightTableData];
        console.log('FIND: ' + rightData.findIndex(i => i.key === event.currentTarget.dataset.thekey));
        var indexSelected = rightData.findIndex(i => i.key === event.currentTarget.dataset.thekey);
        
        rightData[indexSelected] = {...rightData[indexSelected], required: event.currentTarget.checked};

        console.log('beforeDispatchEvent ' + JSON.rightData);

        this.dispatchEvent(new CustomEvent('updatecolumns',{ 
            detail: { 
                leftName: this.leftTableName,
                leftData: this.leftTableData,
                rightName: this.rightTableName,
                rightData: rightData
        }}));
    }

    handleImage(event){
        console.log('rightTableName: ' + JSON.stringify(this.rightTableData));
        console.log('event.currentTarget.dataset.thekey : ' + event.currentTarget.dataset.thekey);
        console.log('event.currentTarget.checked: ' + event.currentTarget.checked);

        var rightData = [...this.rightTableData];
        console.log('FIND: ' + rightData.findIndex(i => i.key === event.currentTarget.dataset.thekey));
        var indexSelected = rightData.findIndex(i => i.key === event.currentTarget.dataset.thekey);
        
        rightData[indexSelected] = {...rightData[indexSelected], isImage: event.currentTarget.checked};

        console.log('beforeDispatchEvent ' + JSON.rightData);

        this.dispatchEvent(new CustomEvent('updatecolumns',{ 
            detail: { 
                leftName: this.leftTableName,
                leftData: this.leftTableData,
                rightName: this.rightTableName,
                rightData: rightData
        }}));
    }

    toRight(event){
        console.log('rightTableName: ' + this.rightTableName);
        if(this.columnSelected == 'b' || this.elementSelected == null){
            return;
        }

        this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(221, 219, 218)';

        var indexToRemove = this.leftTableData.findIndex(i => i.key === this.keySelected);

        var leftData = this.leftTableData.slice(0);
        var rightData = this.rightTableData.slice(0);

        leftData.splice(indexToRemove,1);
        rightData.push(this.elementSelected);
        this.elementSelected = null;
        this.dispatchEvent(new CustomEvent('updatecolumns',{ 
            detail: { 
                leftName: this.leftTableName,
                leftData: leftData,
                rightName: this.rightTableName,
                rightData: rightData
        }}));
    }

    toLeft(event){
        if(this.columnSelected == 'a' || this.elementSelected == null){
            return;
        }
        this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(221, 219, 218)';

        var indexToRemove = this.rightTableData.findIndex(i => i.key === this.keySelected);

        var leftData = this.leftTableData.slice(0);
        var rightData = this.rightTableData.slice(0);

        rightData.splice(indexToRemove,1);
        leftData.push(this.elementSelected);
        this.elementSelected = null;
        this.dispatchEvent(new CustomEvent('updatecolumns',{ 
            detail: { 
                leftName: this.leftTableName,
                leftData: leftData,
                rightName: this.rightTableName,
                rightData: rightData
        }}));
    }

    toUp(event){
        var indexSelected = this.rightTableData.findIndex(i => i.key === this.keySelected);

        if(this.columnSelected == 'a' || indexSelected == 0){
            return;
        }

        var leftData = this.leftTableData.slice(0);
        var rightData = this.rightTableData.slice(0);
       
        rightData[indexSelected] = this.rightTableData[indexSelected - 1];
        rightData[indexSelected - 1] = this.rightTableData[indexSelected];

        this.dispatchEvent(new CustomEvent('updatecolumns',{ 
            detail: { 
                leftName: this.leftTableName,
                leftData: leftData,
                rightName: this.rightTableName,
                rightData: rightData
        }}));
    }

    toDown(event){
        var indexSelected = this.rightTableData.findIndex(i => i.key === this.keySelected);

        if(this.columnSelected == 'a' || indexSelected == (this.rightTable.length - 1)){
            return;
        }

        var leftData = this.leftTableData.slice(0);
        var rightData = this.rightTableData.slice(0);

        rightData[indexSelected] = this.rightTableData[indexSelected + 1];
        rightData[indexSelected + 1] = this.rightTableData[indexSelected];

        this.dispatchEvent(new CustomEvent('updatecolumns',{ 
            detail: { 
                leftName: this.leftTableName,
                leftData: leftData,
                rightName: this.rightTableName,
                rightData: rightData
        }}));
    }

    @api
    validation(minFields, maxFields){
        if(this.rightTableData.length < minFields){
            this.showNotification('You have to select select at least ' + minFields + ' fields', 'Select fields', 'error');
            this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(194, 57, 52)';
            return true;
        }else if(this.rightTableData.length > maxFields){
            this.showNotification('Fields selected', 'You can select up to ' + maxFields + ' fields', 'error');    
            this.template.querySelector('.rightColumnStyleValidation').style.border = '1px solid rgb(194, 57, 52)';
            return true;
        }
        return false;
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}