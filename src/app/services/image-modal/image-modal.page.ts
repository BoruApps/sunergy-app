import {Component, OnInit} from '@angular/core';
import {ModalController, NavParams, ToastController, PickerController} from '@ionic/angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {ImageProvider} from '../../providers/image/image';
import {AppConstants} from '../../providers/constant/constant';
import {LoadingController} from '@ionic/angular';
import {ImageConfirmModalPage} from "../image-confirm-modal/image-confirm-modal.page";
import {ChecklistModalPage} from "../checklist-modal/checklist-modal.page";

@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.page.html',
    styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {
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

    constructor(
        private modalController: ModalController,
        public modalCtrl: ModalController,
        private navParams: NavParams,
        public httpClient: HttpClient,
        private pickerCtrl: PickerController,
        private transfer: FileTransfer,
        private formBuilder: FormBuilder,
        public toastController: ToastController,
        public imgpov: ImageProvider,
        public appConst: AppConstants,
        public loadingController: LoadingController
    ) {
        this.imageData = this.imgpov.getImage();
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

    async showPicker() {
        var x;
        var optionValues = [];
        for (x = 0; x < 101; x++) {
            optionValues.push({text: x, value: x})
        }
        let opts = {
            cssClass: 'section-picker',
            buttons: [
                {text: 'Cancel', role: 'cancel', cssClass: 'section-picker-cancel'},
                {text: 'Confirm', cssClass: 'section-picker-confirm'},
            ],
            columns: [{
                name: 'section',
                options: optionValues
            }],
        }

        let picker = await this.pickerCtrl.create(opts);
        picker.present();
        picker.onDidDismiss().then(async data => {
            let col = await picker.getColumn('section');
            if (col.options[col.selectedIndex].text) {
                this.photo.tower_section = col.options[col.selectedIndex].text;
                if (this.photo.primary_title !== '' || this.photo.secondary_title !== '') {
                    this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + this.photo.tower_section;
                } else {
                    this.photo.title = this.photo.tower_section;
                }
                //this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + col.options[col.selectedIndex].text;
            }
        })
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


    modifyTowerSection(direction) {
        if (direction == 'up') {
            var val = parseInt(this.photo.tower_section) + 1;
            this.photo.tower_section = val.toString();
            this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + this.photo.tower_section;
        } else if (direction == 'down') {
            var val = parseInt(this.photo.tower_section) - 1;
            this.photo.tower_section = val.toString();
            this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + this.photo.tower_section;
        }
    }

    async uploadImage(form) {
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        form.value.base64Image = this.imageData;
        form.value.serviceid = this.serviceid;
        form.value.columnname = this.columnname;
        form.value.logged_in_user = this.user_id;
        form.value.mode = 'image_upload';
        console.log('adding photo for', form.value.serviceid);
        console.log('adding photo columnname', form.value.columnname);
        this.showLoading();
        this.httpClient.post(this.apiurl + "postPhotos.php", form.value, {headers: headers, observe: 'response'})
            .subscribe(data => {
                this.hideLoading();
                //console.log(data['_body']);
                if (data['body']['success'] == true) {
                    this.presentToastPrimary('Photo uploaded and added to Work Order \n');
                    this.closeModal();
                    this.openConfirmModal(this.serviceid,this.columnname);
                } else {
                    console.log('upload failed');
                    this.presentToast('Upload failed! Please try again \n');
                }
            }, error => {
                this.hideLoading();
                //console.log(error);
                //console.log(error.message);
                //console.error(error.message);
                this.presentToast("Upload failed! Please try again \n" + error.message);
            });
    }

    async openConfirmModal(serviceid,columnname) {
        const modal = await this.modalCtrl.create({
            component: ImageConfirmModalPage,
            componentProps: {
                "paramTitle": "Confirm",
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

    async fillTitlePrimary(title) {
        this.photo.primary_title = title;
        if (this.photo.secondary_title !== '' || this.photo.tower_section !== '') {
            this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + this.photo.tower_section;
        } else {
            this.photo.title = title;
        }
    }

    async fillTitleSecondary(title) {
        this.photo.secondary_title = title;
        if (this.photo.primary_title !== '' || this.photo.tower_section !== '') {
            this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + this.photo.tower_section;
        } else {
            this.photo.title = this.photo.secondary_title;
        }

    }

    async fillTowerSection(section) {
        this.photo.tower_section = section;
        if (this.photo.primary_title !== '' || this.photo.secondary_title !== '') {
            this.photo.title = this.photo.primary_title + "-" + this.photo.secondary_title + "-" + this.photo.tower_section;
        } else {
            this.photo.title = this.photo.tower_section;
        }
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
