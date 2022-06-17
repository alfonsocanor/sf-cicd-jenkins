import { LightningElement, api } from 'lwc';

export default class LwcImageGenenicRelatedListCustomType extends LightningElement {
    @api imgUrl;
    @api imgWidth
    @api recordId;

    renderedCallback(){
        this.template.querySelector('img').style.width = this.imgWidth + 'px';
    }
}