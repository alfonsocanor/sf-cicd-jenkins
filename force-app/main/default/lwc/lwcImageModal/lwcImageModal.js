import { LightningElement, api } from 'lwc';

export default class LwcImageModal extends LightningElement {
    @api imageUrl;
    
    closeModal(){
        this.dispatchEvent(new CustomEvent('closemodal',{
            detail: { close: true }
        }))
    }
}