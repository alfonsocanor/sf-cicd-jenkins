import { LightningElement } from 'lwc';
import { responseMock } from './lwcInputMock';
import javascriptImages from '@salesforce/resourceUrl/JavascriptInterview';

export default class LwcJavascriptInterview extends LightningElement {
    htmlImage = javascriptImages + '/htmlImageNOK.png';//'/sfsites/c/file-asset/htmlImageNOK?v=1';
    jsImage = javascriptImages + '/jsImageNOK3.png';//'/sfsites/c/file-asset/jsImageNOK3?v=1';
    renderHtml = false;
    renderJs = false;
    renderComponents = false;
    openModal = false;
    productList = [];
    value = '';

    get options() {
        return [
            { label: 'html', value: 'htmlSelected' },
            { label: 'javascript', value: 'jsSelected' }
        ];
    }

    connectedCallback(){
        for(const index in responseMock){
            console.log('Clue: Use this log to go to the file: lwcJavaScriptInterview. There\'s a for-loop assigning the values of an object to another inside the connectedCallback function. Validate the assignment properties inside the array called productList');

            this.productList.push(
                {
                    "id":responseMock[index].id,
                    "productCode":responseMock[index].productCode,
                    "productName":responseMock[index].productName,
                    "description":responseMock[index].description
                }
            );
        }
        debugger;
    }

    handleComboboxChange(event) {
        this.renderComponents = true;
        this.value = event.detail.value;
        this.renderHtml = this.value == 'htmlSelected' ? true : false;
        this.renderJs = this.value == 'jsSelected' ? true : false;
    }

    handleOpenModal(){
        this.openModal = true;
        this.imageUrl = this.renderHtml ? this.htmlImage : this.jsImage;
    }

    handleCloseModal(){
        this.openModal = false;
    }
}