import { NavController, NavParams} from 'ionic-angular';
import { Component } from '@angular/core';


@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    private tab1Root: string = 'ProductAllPage';
    private tab2Root: string = 'ProductFoodPage';
    private tab3Root: string = 'ProductDrinkPage';
    private tab4Root: string = 'ProductOtherPage';
    private character: any;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams) {
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad UserPage');
    }

    ionViewDidEnter() {
        console.log('ionViewDidLoad Did Enter Home');
    }

    ionViewWillLeave() {
        console.log("Looks like I'm about to leave :(");
    }
}
