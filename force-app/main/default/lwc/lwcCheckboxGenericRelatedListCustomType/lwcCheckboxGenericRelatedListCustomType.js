import { LightningElement, api } from 'lwc';

export default class LwcCheckboxGenericRelatedListCustomType  extends LightningElement {
    @api recordId;
    @api checked;
    firstExecution = true;

    renderedCallback(){
        if(this.firstExecution){
            if(this.template.querySelector('.customCheckbox')){
                this.template.querySelector('.customCheckbox').checked = this.checked;
            }
            this.firstExecution = false;
        }
    }

    updateCheckboxValue(event){
        this.dispatchEvent(new CustomEvent('brandevent',
            { 
                composed: true,
                bubbles: true,
                cancelable: true,
                detail: {
                    data: { 
                        checked: event.target.checked, 
                        recordId: this.recordId 
                    }
                }
            }));
    }
}