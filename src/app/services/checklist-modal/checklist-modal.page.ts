import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController, PickerController, NavController, Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConstants } from '../../providers/constant/constant';
import { LoadingController } from '@ionic/angular';
import {Camera, CameraOptions} from "@ionic-native/camera/ngx";
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import {ImageProvider} from "../../providers/image/image";
import {ImageModalPage} from "../image-modal/image-modal.page";
import {ActionSheet, ActionSheetOptions} from '@ionic-native/action-sheet/ngx';
import {ActivatedRoute, Router} from "@angular/router";
import {DomSanitizer} from '@angular/platform-browser';
import {ImageSlider} from "../image-slider/image-slider.page";
import { imagePreview } from "../image-preview/image-preview.page";

@Component({
    selector: 'app-checklist-modal',
    templateUrl: './checklist-modal.page.html',
    styleUrls: ['./checklist-modal.page.scss'],
})
export class ChecklistModalPage implements OnInit {
    modalTitle: string;
    modelId: number;
    serviceid: any;
    picCompleted: boolean = false;
    isinspection: boolean = false;
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
    randomNumber: number = 0;

    buttonLabels = ['Take Photo', 'Upload from Library'];
    public subSection: number;
    public sectionKey: number;

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
        private actionSheet: ActionSheet,
        private sanitizer: DomSanitizer,
        private platform: Platform
    ) {
        this.apiurl = this.appConst.getApiUrl();
        this.subSection = 0;
        this.sectionKey = 0;
        this.sanitizer = sanitizer;
    }

    ngOnInit() {
        // console.table(this);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.picCompleted = this.navParams.data.picCompleted;
        this.modalTitle = this.navParams.data.paramTitle;
        this.user_id = this.navParams.data.user_id;
        this.updatefields = this.navParams.data.current_updates;
        this.isinspection = this.navParams.data.isinspection;
        this.randomNumber=this.randomNumberGenerate();
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
    randomNumberGenerate(){
        return Math.floor(Math.random()*(9999999999-99999+1)+99999);
    }
    urlSanitize(url) {
        console.log(url);
        url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        console.log(url);
        return url;
    }
    async openConDocViewPDF(pdf, fieldlabel){
        if (pdf.imgpath != ''){
            var url = this.apiurl.replace('phoneapi/','')+pdf.imgpath;
            if (this.platform.is('android')) {
                url = 'https://docs.google.com/viewer?url=' + encodeURIComponent(url);
            }
            console.log('opening pdf -> ',this.apiurl.replace('phoneapi/','')+pdf.imgpath)
            var ref = window.open(url, '_blank', 'location=no');
        }else{
            console.log('No path to open pdf')
        }
    }
    loadChecklist() {
        var dataLabel = this.appConst.workOrder[this.serviceid][this.field]["photos"];
        console.log(dataLabel);
        for(var index = 0; index < dataLabel.length; index++) {
            if(dataLabel[index].notes == undefined) dataLabel[index].notes = "";
            // var vidimg = dataLabel[index].description.long.split(/\n/g);
            // for(var _index = 0; _index < vidimg.length; _index++) {
            //     if(vidimg[_index].indexOf('video:') > -1) {
            //         vidimg[_index] = "<a target='_blank' href = '"+vidimg[_index].replace('video:[','').replace(']','')+"'>"+vidimg[_index].replace('video:','')+"</a>";
            //     } else if (vidimg[_index].indexOf('img:') > -1) {
            //         vidimg[_index] = "<img src = '"+vidimg[_index].replace('img:[','').replace(']','')+"'>";
            //     } else if (vidimg[_index].indexOf('link:') > -1) {
            //         vidimg[_index] = "<a target='_blank' href = '"+vidimg[_index].replace('link:[','').replace(']','')+"'>"+vidimg[_index].replace('link:','')+"</a>";
            //     }
            // }
            // dataLabel[index].description.long = vidimg.join('\n');
            dataLabel[index].description.long = dataLabel[index].description.long.replace('https://www.youtube.com/watch?v=','https://www.youtube.com/embed/');
            console.log(dataLabel[index].description.long);
            dataLabel[index].photos = (dataLabel[index].photos.length == 0) ? [[]] : dataLabel[index].photos
            this.servicedetail.push({
                fieldlabel: dataLabel[index].name,
                helpinfo: dataLabel[index].description,
                images: (dataLabel[index].photos.length == 0) ? dataLabel[index].photos : dataLabel[index].photos,
                columnname: index,
                img: dataLabel[index].img,
                notes: dataLabel[index].notes,
                picklist: dataLabel[index].picklist
            })
        }

        console.log('this.servicedetail',this.servicedetail);

        if (this.appConst.workOrder[this.serviceid][this.field]["complete_category"] == 'yes'){
            this.picCompleted = true;
        } else{
            this.picCompleted = false;
        }
    }

    addSubsection(column) {
        this.servicedetail[column]['images'].push([]);
        this.subSection = this.servicedetail[column]['images'].length + 1;
        this.sectionKey = column;
        console.log(this.subSection, this.sectionKey);
    }

    toggleGroup(index, key) {
        console.log(index, key)
        this.subSection =  index;
        this.sectionKey =  key;
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


    openActionSheet(index, section) {
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
                    this.openModal(this.serviceid, base64Image, this.field, index, section);
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
                    this.openModal(this.serviceid, base64Image, this.field,index, section);
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
            let imageData = this.appConst.appTestImg;
            let base64Image = 'data:image/png;base64,' + imageData;
            //console.log(err);
            this.imgpov.setImage(imageData);
            this.openModal(this.serviceid, base64Image, this.field,index, section);
            this.presentToast(`Operation failed! \n` + err);
        });
    }

    async openModal(serviceid, base64Image,columnname,index, section) {
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Upload Photo",
                "serviceid": serviceid,
                "columnname": columnname,
                "user_id": this.user_id,
                "columnIndex": index,
                "subSection": section
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

    async openViewModal(image,index){
        var params = {
            documentid: image.documentid
        }

        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Access-Control-Allow-Origin', '*');
        this.showLoading();
        await this.httpClient.post(this.apiurl + "getDocBase64.php", params, {headers: headers, observe: 'response'})
            .subscribe(async data => {
                this.hideLoading();
                //console.log(data['body']);
                var success = data['body']['success'];
                if (success == true) {
                    var modal = await this.modalCtrl.create({
                        component: ImageModalPage,
                        componentProps: {
                            "base64Image": data['body']['base64'],
                            "paramTitle": "View Photo",
                            "serviceid": this.serviceid,
                            "columnname": this.field,
                            "user_id": this.user_id,
                            "is_delete": true,
                            "documentid": image.documentid,
                            "fileName": data['body']['fileName'].split('.')[0] ,
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
            }, async error => {
                var modal = await this.modalCtrl.create({
                    component: ImageModalPage,
                    componentProps: {
                        "base64Image": image.imgpath,
                        "paramTitle": "View Photo",
                        "serviceid": this.serviceid,
                        "columnname": this.field,
                        "user_id": this.user_id,
                        "is_delete": true,
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
                this.hideLoading();
                console.log('failed to fetch record');
            }
        );
    }

    async openSliderModal(image,sliderImages){

        var modal = await this.modalCtrl.create({
            component: ImageSlider,
            componentProps: {
                "sliderImages": sliderImages,
                "paramTitle": "View Photo",
                "serviceid": this.serviceid,
                "currentImage": image,
                "user_id": this.user_id
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
            if (dataReturned !== null) {
                this.dataReturned = dataReturned.data;
                this.randomNumber=this.randomNumberGenerate();
                //alert('Modal Sent Data :'+ dataReturned);
            }
        });

        return await modal.present();
    }

    async closeModal(changes='') {
        var t_image_count = 0;
        var image_count = 0;

        for (let photoid in this.appConst.workOrder[this.serviceid][this.field]['photos']) {
            if (this.appConst.workOrder[this.serviceid][this.field]['photos'][photoid]['name'] != 'Miscellaneous') {
                for (let subphotoid in this.appConst.workOrder[this.serviceid][this.field]['photos'][photoid]['photos']) {
                    if (this.appConst.workOrder[this.serviceid][this.field]['photos'][photoid]['photos'][subphotoid].length > 0){
                        image_count = image_count + this.appConst.workOrder[this.serviceid][this.field]['photos'][photoid]['photos'][subphotoid].length;
                    }
                    t_image_count ++;
                }
            }
        }

        this.appConst.workOrder[this.serviceid][this.field]['image_count'] = image_count
        this.appConst.workOrder[this.serviceid][this.field]['t_image_count'] = t_image_count;
        
        if (changes != ''){
            await this.modalController.dismiss({picCompleted:this.picCompleted});
        }else{
            await this.modalController.dismiss({picCompleted:this.picCompleted});
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

    addPicCompleted(event) {
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');

        var completed = 'Yes';
        this.picCompleted = true;
        this.appConst.workOrder[this.serviceid][this.field].complete_category = 'yes'

        var params = {
            serviceid: this.serviceid,
            columnname: this.field,
            mode: 'complete_category',
            completed: completed,
        };

        this.httpClient.post(this.apiurl + "postPhotos.php", params, {headers: headers, observe: 'response'})
            .subscribe(data => {
                this.hideLoading();
                var success = data['body']['success'];
                if (success == true) {
                    this.closeModal(completed);
                    console.log("Checklist marked as Completed");
                } else {
                    this.presentToast('Failed to save Checklist status');
                    console.log('Failed to save Checklist status');
                }
            }, error => {
                this.hideLoading();
                this.presentToast('Failed to save Checklist due to an error \n' + error.message);
                console.log('failed to save Checklist', error.message);
            }
        );
    }

    addUpdate(event) {
        console.log(event);
        var fieldname = event.target.name;
        console.log(fieldname);
        console.log(event.target.value);
        let section = this.appConst.workOrder[this.serviceid][this.field]["photos"][fieldname].img.type;
        switch(section) {
            case "Text": 
                this.appConst.workOrder[this.serviceid][this.field]["photos"][fieldname].notes = event.target.value;
            break;

            case "Picklist":
            case "Checkbox":
                this.appConst.workOrder[this.serviceid][this.field]["photos"][fieldname].picklist = event.target.value;
            break;
        }
        console.log(this.appConst.workOrder[this.serviceid][this.field]["photos"]);
    }

    async  checkItem(columnname, value) {

    }

    goToGallery(serviceid,columnname,fieldlabel){
        this.router.navigate([`/services/detail/${serviceid}/gallery`, {servicename: fieldlabel,columnname:columnname}]);        this.closeModal();
    }

    toggleHelper(columnname){
        this.checklisthelper[columnname] = (this.checklisthelper[columnname] == 1) ? 0 : 1;
    }

    async imagepreview(imagepath){
        console.log('welocme to imagepreview', imagepath);
        var modal = await this.modalCtrl.create({
            component: imagePreview,
            componentProps: {
                "imageFullpath": imagepath,
                "paramTitle": "View Photo",
                "user_id": this.user_id,
            }
        });
        modal.onDidDismiss().then((dataReturned) => {
            if (dataReturned !== null) {
                this.dataReturned = dataReturned.data;
            }
        });
        return await modal.present();
    }
}
