import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class LwcNavigationGenericRelatedListCustomType extends NavigationMixin(LightningElement)  {

    @api recordId;
    @api objectApiName;
    @api recordName;

    handleNavigation(){
/*         console.log('this.recordId: '+ this.recordId);
        console.log('this.objectApiName: ' + this.objectApiName); */
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: this.objectApiName,
                actionName: 'view'
            }
        });
    }
}