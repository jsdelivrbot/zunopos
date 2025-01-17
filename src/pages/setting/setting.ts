import { Component } from '@angular/core';
import { AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { PrintProvider } from '../../providers/print/print';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: Boolean;
  chooseDevices: Boolean;
  private device: string = '0';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController,
    private bluetoothSerial: BluetoothSerial,
    private printProvider: PrintProvider,
    private storage: Storage) {
        bluetoothSerial.enable();
        this.chooseDevices = false;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad SettingPage');
    }

    print(text) {    
        this.storage.get('id_printer').then(data => {
            this.printProvider.print(text,data);
        });     
        
    }

    startScanning() {
        this.pairedDevices = null;
        this.unpairedDevices = null;
        this.gettingDevices = true;

        this.bluetoothSerial.discoverUnpaired().then((success) => {
            this.unpairedDevices = success;
            this.gettingDevices = false;
            success.forEach(element => {
            
            });
        },
        (err) => {
            console.log(err);
        })

        this.bluetoothSerial.list().then((success) => {
            this.pairedDevices = success;
        },
        (err) => {

        })
    }
    success = (data) => alert(data);
    fail = (error) => alert(error);

    selectListDev(id) {
        this.device = id;
        this.storage.set('id_printer', id);
    }

    selectDevice(address: any) {

        let alert = this.alertCtrl.create({
            title: 'Connect',
            message: 'Do you want to connect with?',
            buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Connect',
              handler: () => {
                this.storage.set('id_printer', address);
                let connect = this.bluetoothSerial.connect(address).subscribe(
                    getData => {                        
                        this.bluetoothSerial.write('Test Print '+"\n\n\n").then(writeData => {
                            this.chooseDevices = true;
                            connect.unsubscribe();
                        }, 
                        connectError => {
                            this.alertCtrl.create({
                                buttons: ['OK'],
                                message: connectError,
                                title: 'Error',
                            }).present();
                        });
                    }, err => {
                        console.log(err);
                    }
                );
                
              }
            }]
        });
        alert.present();
    }

    disconnect() {
        let alert = this.alertCtrl.create({
            title: 'Disconnect?',
            message: 'Do you want to Disconnect?',
            buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Disconnect',
              handler: () => {
                this.bluetoothSerial.disconnect();
              }
            }]
        });
        alert.present();
    } 
}
