import { LightningElement, api } from 'lwc';

export default class LwcCustomTypeDataTableImgRender extends LightningElement {
    @api imgUrl;
    @api imgWidth
    @api recordId;

    renderedCallback(){
        this.template.querySelector('img').style.maxHeight = this.imgWidth + 'px';
        this.template.querySelector('img').style.padding = '4px';
    }
}