import LightningDatatable from 'lightning/datatable';
import lwcCheckboxCustomType from './lwcCheckboxCustomType.html';
import lwcImageCustomType from './lwcImageCustomType.html';
import lwcNavigationCustomType from './lwcNavigationCustomType.html';
import lwcFormulaCustomType from './lwcFormulaCustomType.html';
import lwcCheckboxCommunityProductType from './lwcCheckboxCommunityProductType.html';
import lwcCurrencyCommunityProductList from './lwcCurrencyCommunityProductList.html';

export default class LwcGenericRelatedListDatatable extends LightningDatatable {

    ////When is load, send an event to Aura to display the buttons
    static customTypes = {
        imageCustomType:{ //It was renderImage
            template: lwcImageCustomType,
            typeAttributes: ['imgUrl', 'imgWidth']
        },

        checkboxCustomType:{ //It was customCheckbox
            template: lwcCheckboxCustomType,
            typeAttributes: ['checked']
        },

        navigationCustomType:{
            template: lwcNavigationCustomType,
            typeAttributes: ['objectApiName', 'recordName']
        },

        formulaCustomType:{
            template: lwcFormulaCustomType,
            typeAttributes: ['fieldValue']
        },

        checkboxCommunityProductType:{
            template: lwcCheckboxCommunityProductType,
            typeAttributes: ['checked']
        },

        currencyCommunityProductList:{
            template: lwcCurrencyCommunityProductList,
            typeAttributes: ['currencyValue']
        }
    }
}