import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ShareProvider } from '../../providers/share/share';

@IonicPage()
@Component({
    selector: 'page-history',
    templateUrl: 'history.html',
})
export class HistoryPage {

    salesDummies = [];
    filteredJson = [];
    salesFilter = [];
    arrays = [];
    private itemSale: any;
    isfiltered: boolean ;

    constructor(public navCtrl: NavController, public navParams: NavParams,
        private httpClient: HttpClient,
        private shareProvider: ShareProvider,
        private storage: Storage,
        public loadingCtrl: LoadingController) {
            this.itemSale = this.shareProvider.getSaleItem();

            let loader = this.loadingCtrl.create();
            loader.present();
            this.initializeItemsInvoice();
            loader.dismiss();

    }

    ionViewDidLoad() {
        this.initializeItemsInvoice();
    }

    initializeItemsInvoice() {
        var filters = [];
        var sorters = [];
        var filtered = [];

        this.storage.get('user_api').then(userApi => {
            sorters.push({
                field: 'date',
                direction: 'DESC'
            }, {
                field: 'number',
                direction: 'DESC'
            }, {
                field: 'id',
                direction: 'DESC'
            });

            filters.push({
                field: 'created_by_id',
                operator: 'eq',
                value: userApi['userId'],
                mode: 'and'
            })

            var param = {
                page: 1,
                start: 0,
                limit: 100,
                api_token: userApi.apiToken,
                sorter: JSON.stringify(sorters),
                filter: JSON.stringify(filters)
            };

            var dateGroup = [];
            this.httpClient.post('http://'+userApi.apiUrl+'/api/v1/sales', param).subscribe(data => {

                for (let value of data['sales']) {
                    let date = value.date;
                    if (dateGroup[date]) {
                        dateGroup[date].push(value);
                    } else {
                        dateGroup[date] = [];
                        dateGroup[date].push(value);
                    }
                }
                console.log(dateGroup);
                for(var key in dateGroup) {
                    filtered.push({
                        tanggal: key,
                        item: dateGroup[key]
                    });
                }

                this.salesDummies = filtered;

            });
        });

        this.isfiltered = false;
    }

    onInputInvoice(ev) {
        this.initializeItemsInvoice();
        var val = ev.target.value;
        var filtered = [];

        this.storage.get('user_api').then(userApi => {
            let filter = [];
            var param;
            if(val && val.trim() != '') {
                this.isfiltered = true;
                filter.push({
                    field: 'number',
                    operator: 'like',
                    value: val,
                    mode: 'and'
                });
                param = {
                    page: 1,
                    start: 0,
                    limit: 25,
                    api_token: userApi.apiToken,
                    filter: JSON.stringify(filter)
                };
            }else {
                param = {
                    page: 1,
                    start: 0,
                    limit: 25,
                    api_token: userApi.apiToken,
                };
            }

            this.httpClient.post('http://'+userApi.apiUrl+'/api/v1/sales', param).subscribe(data => {

                var dateGroup = [];

                for (let value of data['sales']) {
                    let date = value.date;
                    if (dateGroup[date]) {
                        dateGroup[date].push(value);
                    } else {
                        dateGroup[date] = [];
                        dateGroup[date].push(value);
                    }
                }
                console.log(dateGroup);
                for(var key in dateGroup) {
                    filtered.push({
                        tanggal: key,
                        item: dateGroup[key]
                    });
                }

                this.filteredJson = filtered;
                this.salesDummies = filtered;

            });
        });
    }

    select(item) {
        this.navCtrl.push('InvoicePage', {
          id: item.id,
        })
    }

    onCancelInvoice(ev) {
        this.initializeItemsInvoice();
    }

    clearSearchInvoice(ev) {
        this.initializeItemsInvoice();
    }

}
