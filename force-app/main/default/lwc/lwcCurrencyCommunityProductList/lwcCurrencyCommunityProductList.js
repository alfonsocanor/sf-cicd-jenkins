import { LightningElement, api } from 'lwc';

export default class LwcCurrencyCommunityProductList extends LightningElement {
    @api recordId;
    @api currencyValue;
}