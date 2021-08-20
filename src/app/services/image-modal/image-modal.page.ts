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
    index:any;
    is_delete:any;
    photo = {
        title: '',
        primary_title: '',
        secondary_title: '',
        tower_section: '',
        serviceid: '',
        base64Image: ''
    };
    allTitlelist = {
        cf_photo_checklist_1: 'Front_House',
        cf_photo_checklist_2: 'Ext_Walls_Ele_Eav',
        cf_photo_checklist_3: 'Attic_Structural',
        cf_photo_checklist_4: 'MSP_D_Plate',
        cf_photo_checklist_5: 'MSP_Brkrs_DP',
        cf_photo_checklist_6: 'MSP_Cls',
        cf_photo_checklist_7: 'MSP_Stck',
        cf_photo_checklist_8: 'Sub_D_Cover',
        cf_photo_checklist_9: 'Surr_MSP',
        cf_photo_checklist_10: 'Cls_Elec_M_Number',
        cf_photo_checklist_11: 'Gas_Meter',
        cf_photo_checklist_12: 'Dig_A',
        cf_photo_checklist_13: 'Ovr_Feed',
        cf_photo_checklist_14: 'Ovr_Feed_Drp',
        cf_photo_checklist_15: 'Und_Utl_Wire',
        cf_photo_checklist_16: 'Roof_Plane',
        cf_photo_checklist_17: 'Dmg_Roof',
        cf_photo_checklist_18: 'Tile_Cond',
        cf_photo_checklist_19: 'Tile_Thk',
        cf_photo_checklist_20: 'Tilt_Mnt',
        cf_photo_checklist_21: 'Ext_Sol',
        cf_photo_checklist_22: 'Ext_Stckr_Inv',
        cf_photo_checklist_23: 'Pat_Cov',
        cf_photo_checklist_24: 'Gate_MS',
        cf_photo_checklist_25: 'Batt_Wall_Loc',
        cf_photo_checklist_26: 'Add_Rqst',
        cf_photo_checklist_27: 'Back_Door',
        cf_photo_checklist_28: 'MSP_Gnd',
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
        this.photo.title = this.allTitlelist[this.columnname];
        this.user_id = this.navParams.data.user_id;
        this.index = this.navParams.data.columnIndex;
        this.is_delete = this.navParams.data.is_delete;
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

    async uploadImage(form) {
        console.log(this);
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');
        form.value.base64Image = this.imageData;
        form.value.serviceid = this.serviceid;
        form.value.columnname = this.columnname;
        form.value.is_delete = this.is_delete;
        form.value.logged_in_user = this.user_id;
        form.value.index = this.index;
        form.value.mode = 'image_upload';
        console.log('adding photo for', form.value.serviceid);
        console.log('adding photo columnname', form.value.columnname);
        console.log('need to delete image', this.is_delete);

        this.showLoading();
        this.httpClient.post(this.apiurl + "postPhotos.php", form.value, {headers: headers, observe: 'response'})
            .subscribe(data => {
                this.hideLoading();
                //console.log(data['_body']);
                if (data['body']['success'] == true) {
                    if (this.is_delete === true){
                        this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'].splice(0,1);

                        this.presentToastPrimary('Photo deleted successfully\n');
                        this.closeModal();
                    }else{
                        this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'].push({
                            imgpath:data['body']['data']['image_path'],
                            documentid:data['body']['data']['image_id']
                        });

                        this.presentToastPrimary('Photo saved successfully\n');
                        this.closeModal();
                    }

                    // console.log('openConfirmModal', this.serviceid);
                    // this.openConfirmModal(this.serviceid,this.columnname);
                } else {
                    if (this.is_delete === true){
                        console.log('Delete. failed');
                        this.presentToast('Delete failed! Please try again \n');
                    }else{
                        console.log('upload failed');
                        this.presentToast('Upload failed! Please try again \n');
                    }
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
