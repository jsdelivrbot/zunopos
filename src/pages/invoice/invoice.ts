import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PrintProvider } from '../../providers/print/print';

@IonicPage()
@Component({
  selector: 'page-invoice',
  templateUrl: 'invoice.html',
})
export class InvoicePage {
	public idParam;
	header = [];
	headerItems = [];
    private apiUrl: string;

  	constructor(public navCtrl: NavController, public navParams: NavParams,
        private httpClient: HttpClient,
        private printProvider: PrintProvider,
        private storage: Storage,
        public loadingCtrl: LoadingController) {

        	this.idParam = navParams.get("id");

            let loader = this.loadingCtrl.create();
            loader.present();
            this.initializeItemsInvoice();
            loader.dismiss();
    }


  	ionViewDidLoad() {
    	this.initializeItemsInvoice();
  	}

  	initializeItemsInvoice() {
        this.storage.get('user_api').then(userApi => {
            let filter = [];
            filter.push({
                field: 'id',
                operator: 'eq',
                value: this.idParam,
                mode: 'and'
            });
            this.apiUrl = userApi.apiUrl;
            var param = {
                api_token: userApi.apiToken,
                filter: JSON.stringify(filter)
            };

            this.httpClient.post('http://'+userApi.apiUrl+'/api/v1/sales', param).subscribe(data => {
                this.header = data['sales'];
            });

            filter = [];
            filter.push({
                field: 'sale_id',
                operator: 'eq',
                value: this.idParam,
                mode: 'and'
            });

            var param_items = {
                api_token: userApi.apiToken,
                select: 'id,product_id,product__name,quantity,price,price_subtotal',
                filter: JSON.stringify(filter)
            };

            this.httpClient.post('http://'+userApi.apiUrl+'/api/v1/sale_items', param_items).subscribe(data_items => {
                this.headerItems = data_items['saleItems'];
            });

        });
    }

    SendReceipt() {

        var text: string;
        var number_bill: string;
        var date_bill: string;
        var subtotal: any;
        var note: string;
        var kasir_name: string;

        this.storage.get('user').then(userApi => {
            let filter = [];

            filter.push({
                field: 'api_token',
                property: 'api_token',
                operator: 'eq',
                value: userApi.api_token,
                mode: 'and'
            });

            let param_user = {
                api_token: userApi.api_token,
                select: 'id,name',
                filter: JSON.stringify(filter)
            };

            this.httpClient.post('http://'+this.apiUrl+'/api/v1/users', param_user).subscribe(data_kasir => {
                kasir_name = data_kasir['users'][0].name;

                for (let head of this.header) {
                   number_bill = head.number;
                   date_bill = head.date;
                   subtotal = head.amount_subtotal;
                   note = head.note;
                }

                var length = 30;
                var strLength;
                var SpaceLength;

                text = '         Bakso Bom Roxy        \n';
                text += '-------------------------------\n';
                text += 'Date:  ' + date_bill +'\n';
                text += 'Receipt No:  ' + number_bill +'\n';
                text += 'Cashier:  ' + kasir_name +'\n';
                text += '-------------------------------\n';

                for (let item of this.headerItems) {
                    var price = parseInt(item.price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    strLength= item.product__name.substr(0, 18).length+item.quantity.toString().length+price.length;
                    SpaceLength = length-strLength-3;

                    let dot = (item.product__name.length > 15) ? '...' : '';
                    text += item.quantity +'x   '+item.product__name.substr(0, 15)+dot;

                    for (var a = 0; a < SpaceLength; a++){
                        text += ' ';
                    }
                   
                    text += price+'\n';
                }

                text += '-------------------------------\n';

                var subTotal = parseInt(subtotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                strLength = (subTotal.length+8);
                SpaceLength = length-strLength;
                text += 'Subtotal:';

                for (var b=0;b<SpaceLength;b++){
                    text += ' ';
                }

                text +=  subTotal +'\n';
                text += '-------------------------------\n';
                text +=  '"' + note +'" \n';

                this.storage.get('id_printer').then(data => {
                    this.printProvider.print(text, data);
                });
            });
        });

    }

}
