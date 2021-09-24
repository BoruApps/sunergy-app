import {Component, OnInit, LOCALE_ID, Inject,} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NavController, ModalController} from '@ionic/angular';
import {formatDate} from '@angular/common';
import {HttpHeaders, HttpClient} from '@angular/common/http';
import {Storage} from '@ionic/storage';
import {AppConstants} from '../providers/constant/constant';
import {ProfileModalPage} from './profile/profile.page';
import {LoadingController} from '@ionic/angular';

@Component({
    selector: 'app-services',
    templateUrl: './services.page.html',
    styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
    userinfo: any;
    user_id: any;
    weeklyServices: object;
    futureServices: object;
    completedServices: object;
    count_weeklyServices: number = 0;
    count_futureServices: number = 0;
    count_completedServices: number = 0;
    apiurl: any;
    service = {
        id: '',
        tower: '', //Will be the Transferee + type of service
        tos: '',
        desc: '', //Will be address here
        longdate: '',
        startTime: '', //Will be time as 00:00 A/PM
        endTime: '', //Will be time as 00:00 A/PM
        status: '',
    };

    randomPeople = ['Simmons - MOSPG2014', 'Marysville - ARLIT2062', 'Coldspring - TXHOU2041', 'Yellow Rock - KYLEX2020', 'Medora - ILSPG2027', 'Lawtell - LALWL2000', 'HWY 584 (FTCA) - LAMON2002', 'HWY 120 (FTCA) - LASRV2006', 'York - ALBRH2003', 'Jorge Auto Sales - TXLAR2007', 'Sawmill - ARLIT2065', 'Saxton - PAPIT2008', 'Rockwood - PAPIT2006', 'Mellen - WIWAU2029', 'Calvin - LAMON2113', 'Funston - LARSV2021'];
    typesOfServices = ['Radio Implementation Services', 'Labor', 'Mount Installation', 'Power Installation', 'Structural Analysis'];
    statuses = ['Attention Required', 'Declined', 'Complete', 'Cancelled', 'Closed', 'Open'];
    dataReturned: any;

    constructor(
        private httpClient: HttpClient,
        public navCtrl: NavController,
        private router: Router,
        public storage: Storage,
        private activatedRoute: ActivatedRoute,
        public appConst: AppConstants,
        public modalCtrl: ModalController,
        @Inject(LOCALE_ID) private locale: string,
        public loadingController: LoadingController
    ) {
        this.apiurl = this.appConst.getApiUrl();
    }

    loading: any;

    async showLoading() {
        this.loading = await this.loadingController.create({
            message: 'Loading ...'
        });
        return await this.loading.present();
    }

    async hideLoading() {
        setTimeout(() => {
            if(this.loading != undefined){
                this.loading.dismiss();
            }
        }, 1000);
    }

    goToDetail(serviceid,activityid=null) {
        this.router.navigateByUrl(`/services/detail/${serviceid}`, {state: {'activityid':activityid}});
    }

    logout() {
        console.log('logout clicked');
        this.storage.set("userdata", null);
        this.router.navigateByUrl('/login');
    }

    async getCurrentTheme() {
        var current_theme = this.storage.get('userdata').then((userdata) => {
            if (userdata && userdata.length !== 0) {
                //current_theme = userdata.theme.toLowerCase();
                return userdata.theme.toLowerCase();
            } else {
                return false;
            }
        })
        return current_theme;
    }

    async updateCurrentTheme(theme: string) {
        var userjson: object;
        await this.isLogged().then(result => {
            if (!(result == false)) {
                userjson = result;
            }
        })
        //console.log('from set current theme', userjson.theme);
        userjson['theme'] = theme.charAt(0).toUpperCase() + theme.slice(1);
        //console.log('from set current theme', userjson);
        this.storage.set('userdata', userjson);
        this.userinfo.theme = theme.charAt(0).toUpperCase() + theme.slice(1);
        console.log('updated theme on storage memory');
    }

    async switchTheme() {
        var current_theme;
        await this.getCurrentTheme().then((theme) => {
            console.log("the current theme is", theme);
            current_theme = theme;
        });
        var theme_switcher = {
            "dark": "light",
            "light": "dark"
        };
        var destination_theme = theme_switcher[current_theme]
        console.log('switching theme from:', current_theme);
        console.log('switching theme to:', destination_theme);
        document.body.classList.toggle(destination_theme, true);
        document.body.classList.toggle(current_theme, false);
        this.updateCurrentTheme(destination_theme);
        console.log('theme switched');
    }

    async isLogged() {
        var log_status = this.storage.get('userdata').then((userdata) => {
            if (userdata && userdata.length !== 0) {
                return userdata;
            } else {
                return false;
            }
        })
        return log_status;
    }

    loadTheme(theme) {
        console.log('loading theme', theme);
        document.body.classList.toggle(theme, true);
        var theme_switcher = {
            "dark": "light",
            "light": "dark"
        };
        document.body.classList.toggle(theme_switcher[theme], false); //switch off previous theme if there was one and prefer the loaded theme.
        console.log('turning off previous theme', theme_switcher[theme]);
    }

    getWorkOrders(user_id, type) {
        var logged_user = {
            user_id: user_id,
            type: type
        }
        console.log('fetching records for', logged_user);
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Access-Control-Allow-Origin', '*');
        //this.showLoading();
        this.httpClient.post(this.apiurl + "getWorkOrders.php", logged_user, {headers: headers, observe: 'response'})
            .subscribe(data => {
                //this.hideLoading();
                console.log(data['body']);
                var success = data['body']['success'];
                console.log('services page: login response was', success);

                if (success == true) {
                    var workorders = data['body']['data'];
                    console.log('=====================');
                    console.log('type',type);
                    console.log('=====================');
                    console.log('services page: workorders', workorders);
                    if (data['body']['count'] > 0) {
                        workorders.forEach(workorder => {
                            workorder['longdate'] = workorder['date_start'] + ' ' + workorder['time_start'];
                        });
                    }
                    if (type == 'weekly') {
                        this.weeklyServices = workorders;
                        this.count_weeklyServices = data['body']['count'];
                    } else if (type == 'future') {
                        this.futureServices = workorders;
                        this.count_futureServices = data['body']['count'];
                    } else if (type == 'completed') {
                        this.completedServices = workorders;
                        this.count_completedServices = data['body']['count'];
                    }
                } else {
                    console.log('failed to fetch records');
                }

            }, error => {
                console.log('failed to fetch records');
            });
    }

    async openSettings() {
        console.log('opening settings page for user id', this.user_id);
        const modal = await this.modalCtrl.create({
            component: ProfileModalPage,
            componentProps: {
                "user_id": this.user_id,
                "userinfo": this.userinfo,
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
            if (dataReturned !== null) {
                this.dataReturned = dataReturned.data;
            }
        });

        return await modal.present();
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((userData) => {
            if (userData.length !== 0) {
                this.userinfo = userData;
                //console.log('param user data:', userData);
                try {
                    this.loadTheme(userData.theme.toLowerCase());
                } catch {
                    console.log('couldnt load theme');
                }
                console.log('param user data length:', userData.length);
                if (userData.length == undefined) {
                    console.log('nothing in params, so loading from storage');
                    this.isLogged().then(result => {
                        if (!(result == false)) {
                            //console.log('loading storage data (within param route function)', result);
                            this.userinfo = result;
                            this.loadTheme(result.theme.toLowerCase());
                            this.getWorkOrders(this.userinfo.id, 'weekly');
                            this.getWorkOrders(this.userinfo.id, 'future');
                            this.getWorkOrders(this.userinfo.id, 'completed');
                            this.user_id = this.userinfo.id;
                        } else {
                            console.log('nothing in storage, going back to login');
                            this.logout();
                        }
                    });
                }
            }
        });
    }

}
