import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';

/**
 * Generated class for the CustomerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-customer',
  templateUrl: 'customer.html',
})
export class CustomerPage {
	private listCustomer: any;
	isfiltered: boolean ;
	filteredJson = [];
	private customer= [];
	callback: any;
	private apiUrl: string;

  	constructor(public navCtrl: NavController, 
  		public navParams: NavParams,
  		private httpClient: HttpClient,
  		private storage: Storage) {
  			this.isfiltered = false;
	  		this.initializeItems();
	  		this.callback  = this.navParams.get('callback');

  	}

  	ionViewDidLoad() {
    	console.log('ionViewDidLoad CustomerPage');
  	}

  	initializeItems() {
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
	            this.apiUrl = userData.apiUrl;
	            this.httpClient.post('http://'+userData.apiUrl+'/api/v1/customers', param).subscribe(
	            getData => {
	                this.listCustomer = getData['customers'];
	                this.customer = this.listCustomer;
	                console.log(this.customer);
	                
	            }, err => {
	                console.log(err);
	            });

	        });
  	}

    onInputCust(ev) {
        this.initializeItems();
        var val = ev.target.value;
        if(val && val.trim() != '') {
            this.filteredJson = this.listCustomer.filter((item) => {
                if(item.name.toLowerCase().indexOf(val.toLowerCase()) > -1)
                {
                    return true;
                }else{
                    return false;
                }
            });
            this.listCustomer = this.filteredJson;   
            this.isfiltered = true;
        }else{
            this.isfiltered = false;
        }
    }

    onCancelCust(ev) {
        this.initializeItems();
    }

    clearSearchCust(ev) {
        this.initializeItems();
    }

    onChangeCustomer(name){
        console.log(name);
        this.navParams.get('customer_name').cust = name.id;
        this.navParams.get('customer_name').customer_name = name.name;
        this.navCtrl.pop();
    }

    onChangeCustomerFilter(name){
        this.navParams.get('customer_name').cust = name.id;
        this.navParams.get('customer_name').customer_name = name.name;
        this.navCtrl.pop();
    }
}
