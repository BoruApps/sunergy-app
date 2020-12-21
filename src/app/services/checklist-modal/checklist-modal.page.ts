import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController, PickerController, NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../../providers/constant/constant';
import { LoadingController } from '@ionic/angular';
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import {ImageProvider} from "../../providers/image/image";
import {ImageModalPage} from "../image-modal/image-modal.page";

@Component({
    selector: 'app-checklist-modal',
    templateUrl: './checklist-modal.page.html',
    styleUrls: ['./checklist-modal.page.scss'],
})
export class ChecklistModalPage implements OnInit {
    modalTitle: string;
    modelId: number;
    serviceid: any;
    apiurl: any;
    updatefields: any = {};
    checklistDetail: any = {};
    user_id: any;
    dataReturned: any;
    public workorderdetail: any[] = [];
    public servicedetail: any[] = [];

    options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        saveToPhotoAlbum: false //true causes crash probably due to permissions to access library.
    }

    libraryOptions: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }

    constructor(
        private camera: Camera,
        public imgpov: ImageProvider,
        public modalCtrl: ModalController,
        private modalController: ModalController,
        private navParams: NavParams,
        public httpClient: HttpClient,
        public toastController: ToastController,
        private navCtrl: NavController,
        public appConst: AppConstants,
        public loadingController: LoadingController
    ) {
        this.apiurl = this.appConst.getApiUrl();
    }

    ngOnInit() {
        //console.table(this.navParams);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.modalTitle = this.navParams.data.paramTitle;
        this.user_id = this.navParams.data.user_id;
        this.updatefields = this.navParams.data.current_updates;
        this.loadChecklist(this.serviceid);

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

    loadChecklist(serviceid) {
        console.log('loading details for service id:', serviceid)
        var params = {
            record_id: serviceid
        }
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Access-Control-Allow-Origin', '*');
        this.showLoading();
        this.httpClient.post(this.apiurl + "getChecklist.php", params, { headers: headers, observe: 'response' })
            .subscribe(data => {
                this.hideLoading();
                console.log(data['body']);
                var success = data['body']['success'];
                console.log('getChecklist response was', success);
                if (success == true) {
                    var workorder = data['body']['data'];
                    var allfields = data['body']['allfields'];
                    this.workorderdetail = allfields;
                    for (let key in workorder) {
                        this.servicedetail.push({
                            columnname: key,
                            uitype: workorder[key].uitype,
                            value: workorder[key].value,
                            fieldlabel: workorder[key].fieldlabel,
                        });

                        this.checklistDetail[key] = workorder[key].value;


                    }
                    console.log('workorder', this.servicedetail);
                } else {
                    console.log('failed to fetch record');
                }

            }, error => {
                this.hideLoading();
                console.log('failed to fetch record');
            });
    }

    openCamera(serviceid,columnname) {
        console.log('launching camera');
        this.camera.getPicture(this.options).then((imageData) => {
            // imageData is either a base64 encoded string or a file URI
            // If it's base64 (DATA_URL):
            let base64Image = 'data:image/png;base64,' + imageData;
            this.imgpov.setImage(imageData);
            this.openModal(serviceid, base64Image,columnname);
            // TODO: need code to upload to server here.
            // On success: show toast
            //this.presentToastPrimary('Photo uploaded and added! \n' + imageData);
        }, (err) => {
            // Handle error
            console.error(err);
            // On Fail: show toast
            if (err != "no image selected") {
                this.presentToast(`Upload failed! Please try again \n` + err);
            }
        });
    }

    async openModal(serviceid, base64Image,columnname) {
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Edit Photo",
                "serviceid": serviceid,
                "columnname": columnname,
                "user_id": this.user_id,
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
            if (dataReturned !== null) {
                this.dataReturned = dataReturned.data;
                //alert('Modal Sent Data :'+ dataReturned);
            }
        });

        return await modal.present();
    }

    async closeModal() {
        await this.modalController.dismiss();
    }

    async presentToast(message: string) {
        var toast = await this.toastController.create({
            message: message,
            duration: 3500,
            position: "bottom",
            color: "danger"
        });
        toast.present();
    }

    async presentToastPrimary(message: string) {
        var toast = await this.toastController.create({
            message: message,
            duration: 2000,
            position: "bottom",
            color: "primary"
        });
        toast.present();
    }

    completeOrder(serviceid) {
        console.log('Save Checklist for WO id =', serviceid);
        this.updatefields['wostatus'] = 'Completed';
        var data = this.updatefields;
        var data_stringified = JSON.stringify(data);
        var logged_in_uid = this.user_id;
        console.log('attempting to submitting data to vtiger', serviceid, data);
        var params = {
            recordid: serviceid,
            updates: data_stringified,
            logged_in_user: logged_in_uid
        }
        if (Object.keys(data).length > 0) {
            console.log('Some data was changed, pushing ' + Object.keys(data).length + ' changes');
            var headers = new HttpHeaders();
            headers.append("Accept", 'application/json');
            headers.append('Content-Type', 'application/x-www-form-urlencoded');
            headers.append('Access-Control-Allow-Origin', '*');
            this.showLoading();
            this.httpClient.post(this.apiurl + "postWorkOrderInfo.php", params, { headers: headers, observe: 'response' })
                .subscribe(data => {
                    this.hideLoading();
                    var success = data['body']['success'];
                    if(success == true){
                        this.navCtrl.navigateForward('/tabs/services');
                        this.closeModal();
                        console.log("Saved and updated data for workorder");
                    } else {
                        this.presentToast('Failed to save due to an error');
                        console.log('failed to save record, response was false');
                    }
                }, error => {
                    this.hideLoading();
                    this.presentToast('Failed to save due to an error \n' + error.message);
                    console.log('failed to save record', error.message);
                });
        } else {
            this.closeModal();
            console.log('no data modified for record', serviceid);
        }
    }

    addUpdate(event, value) {
        console.log(event);
        var fieldname = event.target.name;
        console.log(fieldname);
        var is_checked = event.detail.checked;
        /*  if(is_checked && value =='N/A'){
              console.log('aaa');
              this.checklistDetail.site_photo = false;
              console.log(this.checklistDetail.site_photo);
          }*/

        this.updatefields[fieldname] = value;
        console.log('adding update to queue: ', fieldname, value);
        console.log(this.updatefields);
    }

    async  checkItem(columnname, value) {

    }
}