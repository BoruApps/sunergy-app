import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
import {DomSanitizer} from '@angular/platform-browser';
import {ImageSlider} from "../image-slider/image-slider.page";
import { imagePreview } from "../image-preview/image-preview.page";

@Component({
    selector: 'inspections-form',
    templateUrl: './inspections-form.page.html',
    styleUrls: ['./inspections-form.page.scss'],
})
export class inspectionsform implements OnInit {
    modalTitle: string;
    modelId: number;
    serviceid: any;
    user_id: any;
    apiurl: any;
    dataReturned: any;
    inspection_type: any;
    inspectionsfieldList: any[] = [];
    instectionservice: any[] = [];
    instectionjobcard: any[] = [];
    btnsubmitinspectionsform: number;
    field: any;
    fieldindex: any;
    section: any;
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
        private actionSheet: ActionSheet,
        private sanitizer: DomSanitizer
    ) {
        this.apiurl = this.appConst.getApiUrl();
        this.sanitizer = sanitizer;
    }
    closeModal() {
        this.modalController.dismiss({});
    }
    ngOnInit() {
        // console.table(this);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.user_id = this.navParams.data.logged_in_user;
        this.modalTitle = this.navParams.data.paramTitle;
        this.inspectionsfieldList = [];
        this.btnsubmitinspectionsform = 1;
        this.inspectionsfieldList.push({ 
            label : 'Date Submitted',
            fieldname : 'cf_date_submitted',
            uitype : 5,
            typeofdata : 'D~O'
        },{ 
            label : 'Time Submitted',
            fieldname : 'cf_time_submitted',
            uitype : 2,
            typeofdata : 'V~O',
        },{ 
            label : 'Customer First Name',
            fieldname : 'cf_cut_first_name',
            uitype : 1,
            typeofdata : 'V~O'
        },{ 
            label : 'Customer Last Name',
            fieldname : 'cf_cut_last_name',
            uitype : 1,
            typeofdata : 'V~O'
        },{ 
            label : 'Sunergy Office Location',
            fieldname : 'cf_sunergy_office_location',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['SoCal', 'CentralCal','NorCal'],
        },{ 
            label : 'Inspection Tech First Name',
            fieldname : 'cf_tech_first_name',
            uitype : 1,
            typeofdata : 'V~O'
        },{ 
            label : 'Inspection Tech Last Name',
            fieldname : 'cf_tech_last_name',
            uitype : 1,
            typeofdata : 'V~O'
        },{ 
            label : 'Inspection Type',
            fieldname : 'cf_inspection_type',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Footing', 'Lath', 'Sheeting', 'Hole And Trench', 'Misc In-Process', 'Solar', 'Electrical', 'Roof', 'Building', 'Rough', 'Final', 'Other Post-Install'],
        },{ 
            label : 'Inspection Date',
            fieldname : 'cf_inspection_date',
            uitype : 5,
            typeofdata : 'D~O',
        },{ 
            label : 'Inspection Time',
            fieldname : 'cf_inspection_time',
            uitype : 2,
            typeofdata : 'V~O',
        },{ 
            label : 'Inspection Pass/Fail/Cancel',
            fieldname : 'cf_inspection',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['Pass', 'Fail', 'Cancel'],
        },{ 
            label : '# of Correction Photos Taken',
            fieldname : 'cf_correction_photos_taken',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['1', '2', '3','4','5'],
        },{ 
            label : 'Pass/Fail Notes',
            fieldname : 'cf_pass_fail_notes',
            uitype : 19,
            typeofdata : 'V~O',
        },{ 
            label : 'Job Card',
            fieldname : 'cf_job_card',
            uitype : 444,
            typeofdata : 'V~O',
            picklistvalues : ['Yes', 'No'],
        });
        console.log('inspectionsfieldList == ',this.inspectionsfieldList);
    }

    loading: any;

    async showLoading() {
        this.loading = await this.loadingController.create({
            message: 'Loading ...'
        });
        return await this.loading.present();
    }

    openActionInspection(fieldname) {
        console.log('launching openActionInspection', this.inspectionsfieldList);
        var inspection_typedetails = this.inspectionsfieldList[7];
        console.log('inspection_typedetails = ',inspection_typedetails);
        if(inspection_typedetails.value == undefined || inspection_typedetails.value == ''){
            this.presentToast('Please select Inspection type');
            return false;
        }
        this.inspection_type = inspection_typedetails.value;
        if(this.inspection_type == 'Misc In-Process Inspections' ){
           this.inspection_type =  'Miscellaneous In-Process ';
        }
        console.log('appConst.workOrder == ',this.appConst.workOrder);

        var data = this.appConst.workOrder[this.serviceid];
        var flagmatch = 0;
        console.log('Inspections name1 == ',this.inspection_type+' Inspections');
        for (var column in data) {
          if (data[column]["photos"] !== undefined) {
            for (var index in data[column]["photos"]) {
                console.log('Inspections name2 == ',data[column]["photos"][index]["name"]);
              if (data[column]["photos"][index]["name"] == this.inspection_type+' Inspections') {
                this.field = column;
                this.fieldindex = index;
                flagmatch = 1;
                for(var subindex in data[column]["photos"][index]["photos"]){
                    if(data[column]["photos"][index]["photos"][subindex].length == 0){
                        this.section = subindex;
                    }
                }
                if(this.section == undefined){
                    this.section = data[column]["photos"][index]["photos"].length;
                }
              }
            }
          }
        }
        if(flagmatch == 0){
            this.presentToast('Please select Inspection type');
            return false;
        }
        console.log('field name == ',this.field);
        console.log('field index == ',this.fieldindex);
        console.log('section == ',this.section);
        
        this.actionSheet.show(this.actionOptions).then((buttonIndex: number) => {
            console.log('Option pressed', buttonIndex);
            if (buttonIndex == 1) {
                console.log('launching camera');
                this.camera.getPicture(this.options).then((imageData) => {
                    // imageData is either a base64 encoded string or a file URI
                    // If it's base64 (DATA_URL):
                    let base64Image = 'data:image/png;base64,' + imageData;
                    this.imgpov.setImage(imageData);
                    this.openModal(this.serviceid, base64Image, this.field, this.fieldindex, this.section, fieldname);
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
                    this.openModal(this.serviceid, base64Image, this.field,this.fieldindex, this.section, fieldname);
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
            this.openModal(this.serviceid, base64Image, this.field,this.fieldindex, this.section, fieldname);
            this.presentToast(`Operation failed! \n` + err);
        });
    }
    async openModal(serviceid, base64Image,columnname,index, section, fieldname) {
        console.log('openModal',section);
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Upload Photo",
                "serviceid": serviceid,
                "columnname": columnname,
                "user_id": this.user_id,
                "columnIndex": index,
                "subSection": section,
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
            this.dataReturned = dataReturned.data;
            if (this.dataReturned !== null && this.dataReturned != 'Wrapped Up!') {
                console.log('dataReturned = ',this.dataReturned);
                console.log('fieldname = ',fieldname);
                if(fieldname == 'cf_job_card'){
                    this.instectionjobcard.push(this.dataReturned);
                    console.log('instectionjobcard = ',this.instectionjobcard);
                }else{
                    this.instectionservice.push(this.dataReturned);
                    console.log('instectionservice = ',this.instectionservice);
                }
            }
        });

        return await modal.present();
    }
    async hideLoading() {
        setTimeout(() => {
            if(this.loading != undefined){
                this.loading.dismiss();
            }
        }, 1000);
    }
    async presentToast(message: string) {
        var toast = await this.toastController.create({
          message: message,
          duration: 2000,
          position: "top",
          color: "danger",
        });
        toast.present();
      }
    async checkrequiredfields(){
        var flag = 0;
        var fieldlist = [];
        var fieldlistmassge = '';
        for (var i = 0; i < this.inspectionsfieldList.length; ++i) {
            if(this.inspectionsfieldList[i]["fieldname"] == 'cf_job_card'){
                if(this.instectionjobcard.length < 1){
                    var fieldlistmassge1 = 'Please upload Job Card.';
                    this.presentToast(
                        fieldlistmassge1
                    );
                    return false;
                }else{
                    this.inspectionsfieldList[i]["value"] = 'image';
                }
            }
            if(this.inspectionsfieldList[i]["value"] != '' && this.inspectionsfieldList[i]["value"] != undefined){
                flag++;
            }else{
                fieldlist.push(this.inspectionsfieldList[i]["label"]);
                fieldlistmassge += 'This field is Required '+this.inspectionsfieldList[i]["label"] +'\n';
            }
            if(this.inspectionsfieldList[i]["fieldname"] == 'cf_correction_photos_taken'){
                if(this.instectionservice.length != this.inspectionsfieldList[i]["value"]){
                    var fieldlistmassge1 = 'Please select photos same number that you select on this field # of Correction Photos Taken';
                    this.presentToast(
                        fieldlistmassge1
                    );
                    return false;
                }
            }
        }

        if(flag == this.inspectionsfieldList.length){
            return true;
        }else{
            this.presentToast(
                fieldlistmassge
            );
            return false;
        }
    }
    async submitinspectionsform(){
        var formflag = await this.checkrequiredfields();
        if(formflag){
            var headers = new HttpHeaders();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/x-www-form-urlencoded");
            headers.append("Access-Control-Allow-Origin", "*");
            this.showLoading();
            var params = {
                'inspectionsfieldList': JSON.stringify(this.inspectionsfieldList),
                'workorderfielddata': JSON.stringify(this.appConst.workOrder[this.serviceid][this.field]),
                'recordid': this.serviceid,
                'columnname': this.field,
                'fieldindex': this.fieldindex,
                'section': this.section,
                'logged_in_user': this.user_id,
            };
            this.httpClient
            .post(this.apiurl + "saveInspectionform.php", params, {
              headers: headers,
              observe: "response",
            })
            .subscribe(
              (data) => {
                this.hideLoading();
                var success = data["body"]["success"];
                var images_details = data["body"]["data"]["images_details"];
                this.appConst.workOrder[this.serviceid][this.field] = images_details;
                console.log('data return arr == ',data);
                if (success == true) {
                    console.log("Form PDF is Upload successfully");
                    this.modalController.dismiss({});
                } else {
                  this.presentToast("Failed to generate PDF due to an error");
                  console.log("failed to generate PDF, response was false");
                }
              },
              (error) => {
                this.presentToast(
                  "Failed to save due to an error \n" + error.message
                );
                console.log("failed to save record", error.message);
              }
            );
        }
    }
    addUpdate(event, formate=null) {
        var fieldname = event.target.name;
        if (!fieldname || fieldname == "" || fieldname == undefined) {
          fieldname = event.target.id;
        }
        var fieldvalue = event.target.textContent + event.target.value;
        if (event.target.tagName == "ION-RADIO" || event.target.tagName == "ION-CHECKBOX")
        {
          fieldvalue = event.target.checked ? 1 : 0;
            fieldvalue = event.target.value;
        }
        if (event.target.tagName == "ION-DATETIME"
        ) {
            fieldvalue = event.target.value;
        }
        if (
          event.target.tagName == "ION-TEXTAREA" ||
          event.target.tagName == "ION-SELECT"
        ) {
          fieldvalue = event.target.value;
        }
        this.setValuetoInstallfield(fieldname, fieldvalue);
        console.log('tagName = ',event.target.tagName);
        console.log('fieldname = ',fieldname);
        console.log('fieldvalue = ',fieldvalue);
        console.log('inspectionsfieldList == ',this.inspectionsfieldList);
  }
    setValuetoInstallfield(fieldname, value){
        var flag = 0;
        for (var i = 0; i < this.inspectionsfieldList.length; ++i) {
            if(this.inspectionsfieldList[i].fieldname === fieldname){
                this.inspectionsfieldList[i]["value"] = '';
                this.inspectionsfieldList[i]["value"] = value;
            }
            if(this.inspectionsfieldList[i]["value"] != '' && this.inspectionsfieldList[i]["value"] != undefined){
                flag++;
            }
        }
        if(flag == this.inspectionsfieldList.length){
            this.btnsubmitinspectionsform = 1;
        }else{
            //this.btnsubmitinspectionsform = 0;
        }
        console.log('setValuetoInstallfield - flag = ',flag);
    }
    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) {
          return false;
        }
        return true;

      }
}
