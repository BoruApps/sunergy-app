import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams, ToastController, PickerController} from '@ionic/angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AppConstants} from '../../providers/constant/constant';
import {LoadingController} from '@ionic/angular';
import {ImageProvider} from "../../providers/image/image";
import {ImageModalPage} from "../image-modal/image-modal.page";
import {ActionSheet, ActionSheetOptions} from "@ionic-native/action-sheet/ngx";
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";

@Component({
    selector: 'app-image-confirm-modal',
    templateUrl: './image-confirm-modal.page.html',
    styleUrls: ['./image-confirm-modal.page.scss'],
})
export class ImageConfirmModalPage implements OnInit {
    imageData: any;
    modalTitle: string;
    modelId: number;
    serviceid: any;
    columnname: any;
    apiurl: any;
    user_id: any;
    dataReturned: any;
    photo = {
        title: '',
        primary_title: '',
        secondary_title: '',
        tower_section: '',
        serviceid: '',
        base64Image: ''
    };
    buttonLabels = ['Take Photo', 'Upload from Library'];
    actionOptions: ActionSheetOptions = {
        title: 'Which would you like to do?',
        buttonLabels: this.buttonLabels,
        addCancelButtonWithLabel: 'Cancel',
        androidTheme: 1 //this.actionSheet.ANDROID_THEMES.THEME_HOLO_DARK,
    };
    options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        saveToPhotoAlbum: false //true causes crash probably due to permissions to access library.
    };

    libraryOptions: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };
    constructor(
        private camera: Camera,
        private actionSheet: ActionSheet,
        public imgpov: ImageProvider,
        private modalController: ModalController,
        private navParams: NavParams,
        public httpClient: HttpClient,
        public toastController: ToastController,
        public appConst: AppConstants,
        public loadingController: LoadingController
    ) {
        this.apiurl = this.appConst.getApiUrl();
    }

    ngOnInit() {
        //console.table(this.navParams);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.columnname = this.navParams.data.columnname;
        this.modalTitle = this.navParams.data.paramTitle;
        this.user_id = this.navParams.data.user_id;
    }

    async closeModal() {
        const onClosedData: string = "Wrapped Up!";
        await this.modalController.dismiss(onClosedData);
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
            if (this.loading != undefined) {
                this.loading.dismiss();
            }
        }, 1000);
    }

    async ConfirmModalYes(serviceid,columnname) {
        console.log('ConfirmModalYes SOId and collumn');
        console.log('serviceid',serviceid);
        console.log('columnname',columnname);
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        var params = {
            serviceid: serviceid,
            columnname: columnname,
            logged_in_user: this.user_id,
            mode: 'complete_category',
            completed: 'yes',
        }
        this.showLoading();
        this.httpClient.post(this.apiurl + "postPhotos.php", params, {headers: headers, observe: 'response'})
            .subscribe(data => {
                this.hideLoading();
                if (data['body']['success'] == true) {
                    this.presentToastPrimary('Category updated sccessfully. \n');
                    this.closeModal();
                } else {
                    console.log('upload failed');
                    this.presentToast('Upload failed! Please try again \n');
                }
            }, error => {
                this.hideLoading();
                this.presentToast("Upload failed! Please try again \n" + error.message);
            });
    }

    async ConfirmModalNo(serviceid,columnname) {
        this.presentToastPrimary('Continue image uploading. \n');
        this.closeModal();
        this.openActionSheet(serviceid,columnname)
    }

    openActionSheet(serviceid, columnname) {
        console.log('launching actionsheet');
        console.log('serviceid',serviceid);
        console.log('columnname',columnname);
        this.actionSheet.show(this.actionOptions).then((buttonIndex: number) => {
            console.log('Option pressed', buttonIndex);
            if (buttonIndex == 1) {
                console.log('launching camera');
                this.camera.getPicture(this.options).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(serviceid, base64Image, columnname);
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
                    this.openModal(serviceid, base64Image, columnname);
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
            console.log(err);
            this.presentToast(`Operation failed! \n` + err);
        });
    }

    async openModal(serviceid, base64Image,columnname) {
        const modal = await this.modalController.create({
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
}
