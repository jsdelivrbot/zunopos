import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ShareProvider } from '../../providers/share/share';
import { SuccessPage } from '../../pages/success/success';
import { Storage } from '@ionic/storage';
import { ToastController, Navbar } from 'ionic-angular';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
    private amount: any;
    private cust: string = '14';
    private listCustomer: any;
    private listItem: any;
    private listMethod: any;
    private method: string = '1';
    private note: string = '';

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public toastCtrl: ToastController,
        private httpClient: HttpClient,
        private shareProvider: ShareProvider,
        private storage: Storage
    ) {

        console.log(this.navParams.get('amount'));
        this.customer_name = 'Pilih Pelanggan';

        this.amount = this.shareProvider.getSale().amount;

        this.storage.get('sale').then(sale => {
            var result = [];
            sale.reduce(function (res, value) {
                if (!res[value.id]) {
                    res[value.id] = {
                        qty: 0,
                        id: value.id,
                        name: value.name,
                        price: value.price
                    };
                    result.push(res[value.id])
                }
                res[value.id].qty += 1
                return res;
            }, {});
            this.listItem = result;
        });

        this.storage.get('user_api').then(userData => {
            let filter = [];

            filter.push({
                field: 'type_customer',
                property: 'type_customer',
                operator: 'eq',
                value: 'Company',
                mode: 'and'
            });

            let param = {
                api_token: userData.apiToken,
                select: 'id,name',
                filter: JSON.stringify(filter)
            };

            this.httpClient.post('http://'+userData.apiUrl+'/api/v1/customers', param).subscribe(
                getData => {
                    this.listCustomer = getData['customers'];
                }, err => {
                    console.log(err);
                });

            filter = [];

            let param_method = {
                api_token: userData.apiToken,
                select: 'id,name',
            };

            this.httpClient.post('http://'+userData.apiUrl+'/api/v1/payment_methods', param_method).subscribe(
                getData => {
                    this.listMethod = getData['paymentMethods'];
                },
                err => {
                    console.log(err);
                }
            );
        });

    }

    private customer_name: any;

    ionViewDidLoad() {
        console.log('ionViewDidLoad PaymentPage');
    }

    ionViewWillLeave() {
        console.log("Looks like I'm about to leave :("); 
    }

    onChangeMethod(){
        console.log(this.method);
    }

    onChangeCustomer(){
        console.log(this.cust);
    }

    payment() {
        let sale_item = [];

        this.amount = this.shareProvider.getSale().amount;

        if(this.amount<=0){
            let toast = this.toastCtrl.create({
                  message: 'Items tidak boleh kosong',
                  duration: 3000
                });
                toast.present();
            return false;
        }

        this.storage.get('sale').then(sale => {
            var result = [];
            sale.reduce(function (res, value) {
                if (!res[value.id]) {
                    res[value.id] = {
                        qty: 0,
                        id: value.id,
                        name: value.name,
                        price: value.price
                    };
                    result.push(res[value.id])
                }
                res[value.id].qty += 1
                return res;
            }, {});
            for (let item of result) {
                sale_item.push({
                    id:0,
                    amount: item.price,
                    amount_discount:0,
                    amount_gross: item.price,
                    amount_subtotal: item.price,
                    discount:"",
                    name: item.name,
                    price: item.price,
                    price_discount:0,
                    price_gross: item.price,
                    price_subtotal: item.price,
                    product_id: item.id,
                    quantity: item.qty,
                    sort:0,
                    unit_name:"PCS",
                    unit_conversion:1
                });
            }

            let today = moment().format('YYYY-MM-DD');

            this.storage.get('user_api').then(userApi => {
                let param = {
                    api_token: userApi.apiToken,
                    amount: this.amount,
                    amount_discount: 0,
                    amount_gross: this.amount,
                    amount_rounding: 0,
                    amount_subtotal: this.amount,
                    amount_taxable: this.amount,
                    customer_id: this.cust,
                    date: today,
                    date_begin: '',
                    date_end: '',
                    description: 'From Zunopos',
                    discount: '',
                    due_date: today,
                    due_days: 0,
                    location_id: 1,
                    nofa_number: '',
                    note: this.note,
                    number: '',
                    payment_term_id: 1 ,
                    payment_method_id:this.method,
                    ppn: 0,
                    ppn_amount: 0,
                    ppn_percentage: 0,
                    salesperson_id: userApi['userId'],
                    sale_items: sale_item
                };

                this.httpClient.post('http://'+userApi.apiUrl+'/api/v1/sale', param).subscribe(data => {
                    if(data['success']) {
                        this.storage.set('inv', data['sale'].id);
                        this.navCtrl.setRoot(SuccessPage);
                        this.clearItem();
                    }else{
                        let toast = this.toastCtrl.create({
                          message: data['message'],
                          duration: 3000
                        });

                        toast.present();
                    }
                });
            });
        });
    }

    clearItem() {
        this.storage.remove('sale');
        this.shareProvider.setSale({amount: 0});
        this.amount = 0;
        this.listItem = null;
        this.navParams.get('amount').sale = {
            amount: 0
        };
    }

    select(item) {
        this.navCtrl.push('CustomerPage', {
          id: 1,
          callback: this.myCallbackFunction,
          customer_name: this
        })
    }

    myCallbackFunction = function(_params) {
        return new Promise((resolve, reject) => {
            console.log(this.cust);
            this.customer_name = _params;
            resolve();
        });
    }

}
