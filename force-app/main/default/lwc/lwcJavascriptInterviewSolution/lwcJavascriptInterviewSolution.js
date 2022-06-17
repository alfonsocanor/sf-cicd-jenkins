import { LightningElement, track } from 'lwc';
import { responseMock } from './lwcInputMock';
import { htmlCode } from './lwcInputMock';

export default class LwcJavascriptInterviewSolution extends LightningElement {
    @track productList = [];
    htmlCode = htmlCode;

    connectedCallback(){
        console.log('asd');
        for(const index in responseMock){
            this.productList.push(
                {
                    "productCode":responseMock[index].offerCode,
                    "productName":responseMock[index].offerName,
                    "description":responseMock[index].description
                }
            );
        }
    }

    onChangeCode(){
        console.log('here eval');
        eval(
            'for(const index in responseMock){'+
                'this.productList.push('+
                    '{'+
                        '"productCode":responseMock[index].productCode,'+
                        '"productName":responseMock[index].productName,'+
                        '"description":responseMock[index].description'+
                    '}'+
                ');'+
            '}'
        );
    }
}