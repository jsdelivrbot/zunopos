import { AlertController, IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
	public users: any;

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private alertCtrl: AlertController,
        private httpClient: HttpClient,
        private loadingCtrl: LoadingController,
        private network: Network,
        private toastCtrl: ToastController,
        private storage: Storage) {

        storage.get('login_customer').then(getData => {
            if (getData) {
               this.navCtrl.setRoot('UserPage');
            }
        });
    }

    displayNetworkUpdate(connectionState: string){
        let networkType = this.network.type;
        this.toastCtrl.create({
            message: `You are now ${connectionState}`,
            duration: 3000
        }).present();
    }

    ionViewDidEnter() {
        this.network.onConnect().subscribe(data => {
            console.log(data)
            this.displayNetworkUpdate(data.type);
        }, error => console.error(error));

        this.network.onDisconnect().subscribe(data => {
            console.log(data)
            this.displayNetworkUpdate(data.type);
        }, error => console.error(error));
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LoginPage');
    }

    input = {
        email: '',
        password: ''
    }

    showAlert(msg) {
        let alert = this.alertCtrl.create({
            title: 'Error!',
            subTitle: msg,
            buttons: ['OK']
        }).present();
    }

    submitForm() {
        let customer = [];
        let param = {
            params: {
                username: this.input.email,
                password: this.input.password
            }
        };
        let valid = this.validateForm();

        if (valid) {
            let loader = this.loadingCtrl.create({
                content: "Please wait..."
            });

            loader.present();

            let url = 'http://unggul.inventory.id/api/v1/login';

            this.httpClient.post(url, null, param).subscribe(
            (getData) => {
                let result = getData['user'];
                let userApi = {
                    apiToken: result.api_url_token,
                    apiUrl: result.api_url
                };

                let userData = {
                    email: result.email,
                    name: result.name
                }

                this.storage.set('login_customer', 'Login Berhasil');
                this.storage.set('user_api', userApi);
                this.storage.set('user_data', userData);
                this.navCtrl.setRoot('UserPage');

                loader.dismiss();
            }, err => {
                loader.dismiss();

                switch (err.status) {
                    case '401':
                        this.showAlert('Email/Password salah. Harap coba lagi');

                        break;

                    case '404' :
                        this.showAlert('Server mengalami gangguan. Silahkan coba beberapa lagi');

                        break;
                }

                this.resetForm();
            });
        }
    }

    resetForm() {
        this.input.password = '';
    }

    validateForm() {
        if (this.input.email.length == 0 || this.input.password.length == 0) {
            let alert = this.alertCtrl.create({
                title: 'Error!',
                subTitle: 'Email/Password tidak boleh kosong.',
                buttons: ['OK']
            });

            alert.present();

            return false;
        }
        else {
            return true;
        }
    }

}
