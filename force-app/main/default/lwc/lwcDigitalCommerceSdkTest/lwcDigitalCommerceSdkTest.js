import { LightningElement } from 'lwc';
import { dcBaseMixin } from 'vlocity_cmt/dcBaseMixin';

export default class LwcDigitalCommerceSdkTest extends dcBaseMixin(LightningElement) {
    digitalCommerceSdk;
    oneOffer4GetSelectedOffers = '';
    offers4ForLoop = [];

    connectedCallback(){
        this.getDigitalCommerceSDKInstance()
            .then((skdInstance) => {
                this.digitalCommerceSdk = skdInstance;
            })
            .catch((error) => {
                console.log('sdk error ', error);
            })
    }

    getOffer(offerCode){
        const input = this.sdkInstance.createGetOfferInput();
        input.catalogCode = "TESTCATALOG3"; // use your Catalog Code
        input.offerCode = offerCode ? offerCode : this.oneOffer4GetSelectedOffers[0]; // use your Offer Code
        
        // Invoke GetOfferDetails API via method getOfferDetails()
        this.sdkInstance
          .getOffer(input)
          .then(response => {
            console.log(
              "vlocity get offer anonymous user rest call" , response
            );
          })
          .catch(error => {
            console.log("get offer anonymous user rest call failed" , error);
          });
    }

    getOfferLoop(){
        for(const i in this.offers4ForLoop){
            if(this.offers4ForLoop[i]){
                this.getOffer(this.offers4ForLoop[i]);
            }
        }
    }

    getOffers() {
        this.getOffersFromSdk()
            .then((response) => {
                console.log('Offers from getOffers: ' , response[0]);

                // Caching in memory all the offers, this will allow us to use getSelectedOffers 
                //using the offerCode instead of calling the API again;

                for(const i in response){
                    if(response[i].offerCode){
                        this.offers4ForLoop.push(response[i].offerCode);
                    }
                }

                this.oneOffer4GetSelectedOffers = response[0].offerCode;
                
                console.log('oneOffer4GetSelectedOffers ' , this.oneOffer4GetSelectedOffers);
                console.log('this.offers4ForLoop: ' , this.offers4ForLoop);
            })
            .catch((error) => {
                console.log('error getOffers: ' , error);
            })
    }

    getOffersFromSdk(){
            return new Promise((resolve, reject) => {
                let invokeActionInput = this.sdkInstance.createGetOffersInput();
                invokeActionInput.catalogCode = 'TESTCATALOG3';
                this.sdkInstance.getOffers(invokeActionInput)
                    .then(function(response) {
                        console.log(response)
                        resolve(response.offers);
                    })
                    .catch((error) => {
                        console.log(error)
                        reject(error);
                    });
            });
    }

    //addSelectedOffer(){} private method

    getSelectedOffer(){ 
        for(const i in this.offers4ForLoop){
            if(this.offers4ForLoop[i]){
                console.log('offer from selected: ' , this.sdkInstance.getSelectedOffer(this.offers4ForLoop[i]));
            }
        }
    }
}