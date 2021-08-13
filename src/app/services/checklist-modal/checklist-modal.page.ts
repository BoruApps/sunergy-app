import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController, PickerController, NavController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../../providers/constant/constant';
import { LoadingController } from '@ionic/angular';
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import {ImageProvider} from "../../providers/image/image";
import {ImageModalPage} from "../image-modal/image-modal.page";
import {ActionSheet, ActionSheetOptions} from '@ionic-native/action-sheet/ngx';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-checklist-modal',
    templateUrl: './checklist-modal.page.html',
    styleUrls: ['./checklist-modal.page.scss'],
})
export class ChecklistModalPage implements OnInit {
    modalTitle: string;
    modelId: number;
    serviceid: any;
    inspection_type: any;
    apiurl: any;
    updatefields: any = {};
    checklistDetail: any = {};
    checklisthelper: any = {};
    user_id: any;
    dataReturned: any;
    public workorderdetail: any[] = [];
    public servicedetail: any[] = [];
    defaultContent: any;
    value: any;
    field: any;

    buttonLabels = ['Take Photo', 'Upload from Library'];

    actionOptions: ActionSheetOptions = {
        title: 'Which would you like to do?',
        buttonLabels: this.buttonLabels,
        addCancelButtonWithLabel: 'Cancel',
        androidTheme: 1 //this.actionSheet.ANDROID_THEMES.THEME_HOLO_DARK,
    }

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
        private photoviewer: PhotoViewer,
        public imgpov: ImageProvider,
        public modalCtrl: ModalController,
        private modalController: ModalController,
        private navParams: NavParams,
        public httpClient: HttpClient,
        public toastController: ToastController,
        private navCtrl: NavController,
        public appConst: AppConstants,
        private router: Router,
        public loadingController: LoadingController,
        private actionSheet: ActionSheet
    ) {
        this.apiurl = this.appConst.getApiUrl();
    }

    ngOnInit() {
        // console.table(this);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.modalTitle = this.navParams.data.paramTitle;
        this.user_id = this.navParams.data.user_id;
        this.updatefields = this.navParams.data.current_updates;
        this.loadChecklist();

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

    loadChecklist() {
        var dataLabel = [];
        if(this.value == "") {
            dataLabel = JSON.parse(this.defaultContent);
        } else {
            dataLabel = JSON.parse(this.value);
        }
        for(var index = 0; index < dataLabel.length; index++) {
            this.servicedetail.push({
                fieldlabel: dataLabel[index].name,
                helpinfo: dataLabel[index].description,
                images: dataLabel[index].photos,
                columnname: index,

            })
        }
        console.log(this.servicedetail);
        
    }



    previewImage(imagepath) {
        console.log('launching image viewer image =>',imagepath);
        if (imagepath != '' && typeof imagepath !== 'undefined') {
            this.photoviewer.show(imagepath);
        }else{
            // Handle error
            console.error('Image preview failed, no image');
            this.presentToast('Image preview failed.');
        }
    }


    openActionSheet(index) {
        console.log('launching actionsheet');

        this.actionSheet.show(this.actionOptions).then((buttonIndex: number) => {
            console.log('Option pressed', buttonIndex);
            if (buttonIndex == 1) {
                console.log('launching camera');
                this.camera.getPicture(this.options).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(this.serviceid, base64Image, this.field, index);
                    // TODO: need code to upload to server here.
                    // On success: show toast
                    //this.presentToastPrimary('Photo uploaded and added! \n' + imageData);
                }, (err) => {
                    // Handle error
                    console.error(err);
                    // On Fail: show toast
                    this.presentToast(`Upload failed! Please try again \n` + err);
                });
            } else if (buttonIndex == 2) {
                console.log('launching gallery');
                this.camera.getPicture(this.libraryOptions).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(this.serviceid, base64Image, this.field,index);
                    // TODO: need code to upload to server here.
                    // On success: show toast
                    //this.presentToastPrimary('Photo uploaded and added! \n' + imageData);
                }, (err) => {
                    // Handle error
                    console.error(err);
                    // On Fail: show toast
                    this.presentToast(`Upload failed! Please try again \n` + err);
                });
            }
        }).catch((err) => {
            let imageData = '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';
            let base64Image = 'data:image/png;base64,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';
            //console.log(err);
            this.imgpov.setImage(imageData);
            this.openModal(this.serviceid, base64Image, this.field,index);
            this.presentToast(`Operation failed! \n` + err);
        });
    }

    async openModal(serviceid, base64Image,columnname,index) {
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Upload Photo",
                "serviceid": serviceid,
                "columnname": columnname,
                "user_id": this.user_id,
                "columnIndex": index
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

    goToGallery(serviceid,columnname,fieldlabel){
        this.router.navigate([`/services/detail/${serviceid}/gallery`, {servicename: fieldlabel,columnname:columnname}]);        this.closeModal();
    }

    toggleHelper(columnname){
        this.checklisthelper[columnname] = (this.checklisthelper[columnname] == 1) ? 0 : 1;
    }
}