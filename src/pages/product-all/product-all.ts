import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ShareProvider } from '../../providers/share/share';

@IonicPage()
@Component({
    selector: 'page-product-all',
    templateUrl: 'product-all.html',
})
export class ProductAllPage {
    productDummies = [];
    filteredJson = [];
    private sale: any;
    isfiltered: boolean ;
    arraySale = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, 
        private app: App,
        private httpClient: HttpClient,
        private shareProvider: ShareProvider,
        private storage: Storage) {
        
        this.isfiltered = false;

        this.initializeItems();
        
    }

    ionViewDidLoad() {        
        console.log("Load all");
    }

    ionViewDidEnter() {
        this.initializeItems();
        console.log("enter all");
    }

    initializeItems() {
        
        this.sale = this.shareProvider.getSale();

        if (typeof this.sale == 'undefined') {
            this.sale = {
                amount: 0
            };
        }

        this.storage.get('user_api').then(userApi => {

            var param = {
                type: 'Product',
                api_token: userApi.apiToken
            };

            this.httpClient.post('http://'+userApi.apiUrl+'/api/v1/products', param).subscribe(data => {
                this.productDummies = data['products'];
            });
        });
            
    }

    cancel() {
        this.sale = {
            amount: 0
        };

        this.shareProvider.setSale(this.sale);
        this.storage.remove('sale');
        this.arraySale = [];
    }

    checkout() {
        this.app.getRootNav().push('PaymentPage', {
          amount: this
        });
    }

    select(product) {
        if (typeof product.quantity == 'undefined') {
            product.quantity = 0;
        }

        this.sale.amount += parseFloat(product.product_pricing__price);
        this.shareProvider.setSale(this.sale);

        
        this.storage.get('sale').then(sale => {
            if(sale == null) {
                this.arraySale = [];
            }else{
                this.arraySale = sale;
            }
            this.arraySale.push({
                id: product.id,
                name: product.name,
                price: product.product_pricing__price
            })
            this.storage.set('sale', this.arraySale);
        });
        
       
    }

    onInput(ev) {
        this.initializeItems();
        var val = ev.target.value;
        if(val && val.trim() != '') {
            this.filteredJson = this.productDummies.filter((item) => {
                if(item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
                {
                    return true;
                }else{
                    return false;
                }
            });
            this.productDummies = this.filteredJson;   
            this.isfiltered = true;
        }else{
            this.isfiltered = false;
        }
    }

    onCancel(ev) {
        this.initializeItems();
    }

    clearSearch(ev) {
        this.initializeItems();
    }

}
