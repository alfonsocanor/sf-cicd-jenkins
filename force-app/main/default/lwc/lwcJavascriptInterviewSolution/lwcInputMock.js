var responseMock = [
    {"id":1,"offerCode":"0001", "offerName":"Product 1", "description":"Lorem ipsum dolor sit amet"},
    {"id":2,"offerCode":"0002", "offerName":"Product 2", "description":"Ut enim ad minim veniam"},
    {"id":3,"offerCode":"0003", "offerName":"Product 3", "description":"Duis aute irure dolor"}
];

var htmlCode = 
                '<div style="width: 100%;">' +
                    '<div class="slds-grid slds-wrap slds-size_1-of-1">' +
                        '<div class="slds-col slds-size_1-of-4 slds-text-title_bold">Product Code</div>  ' +
                        '<div class="slds-col slds-size_1-of-4 slds-text-title_bold">Product Name</div> ' +
                        '<div class="slds-col slds-size_2-of-4 slds-text-title_bold">Description</div> ' +
                    '</div>' +
                    '<template for:each={productList} for:item="product">' +
                        '<div key={product.id} class="slds-grid slds-wrap slds-size_1-of-1">' +
                            '<div class="slds-col slds-size_1-of-4">{product.productCode}</div>  ' +
                            '<div class="slds-col slds-size_1-of-4">{product.productName}</div>  ' +
                            '<div class="slds-col slds-size_2-of-4">{product.description}</div>  ' +
                        '</div>' +
                    '</template>' +
                '</div>';

export { responseMock, htmlCode }