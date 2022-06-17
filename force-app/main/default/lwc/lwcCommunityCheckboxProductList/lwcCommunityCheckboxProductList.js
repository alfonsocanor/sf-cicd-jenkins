import { LightningElement, api } from 'lwc';

export default class LwcCommunityCheckboxProductList extends LightningElement {
    @api recordId;
    @api checked;

    firstExecution = true;

    renderedCallback(){
        console.log('this.checked: ' + this.checked);
        if(this.firstExecution){
            if(this.template.querySelector('.customCheckbox')){
                this.template.querySelector('.customCheckbox').checked = this.checked;
            }
            this.firstExecution = false;
        }
    }
}