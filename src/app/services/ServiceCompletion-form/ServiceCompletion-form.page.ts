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
    selector: 'ServiceCompletion-form',
    templateUrl: './ServiceCompletion-form.page.html',
    styleUrls: ['./ServiceCompletion-form.page.scss'],
})
export class servicecompletionform implements OnInit {
    modalTitle: string;
    modelId: number;
    serviceid: any;
    user_id: any;
    apiurl: any;
    dataReturned: any;
    workorderdetail: any[] = [];
    currentdate: any;
    cust_firstname: any;
    cust_lastname: any;
    user_firstname: any;
    user_lastname: any;
    user_email: any;
    currenttime: any;
    inspection_type: any;
    inspectionsfieldList: any[] = [];
    instectionservice: any[] = [];
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
        console.log('==========time =======',new Date().toISOString());
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.user_id = this.navParams.data.logged_in_user;
        this.modalTitle = this.navParams.data.paramTitle;
        this.workorderdetail = this.navParams.data.workorderdetail;
        this.currentdate = this.workorderdetail.currentdate;
        this.currenttime = this.workorderdetail.fulldatetime;
        this.cust_firstname = this.workorderdetail.firstname;
        this.cust_lastname = this.workorderdetail.lastname;
        this.cust_street = this.workorderdetail.mailingstreet;
        this.cust_city = this.workorderdetail.mailingcity;
        this.cust_state = this.workorderdetail.mailingstate;
        this.cust_zip = this.workorderdetail.mailingzip;
        this.user_firstname = this.navParams.data.user_firstname;
        this.user_lastname = this.navParams.data.user_lastname;
        this.user_email = this.navParams.data.user_email;
        this.inspectionsfieldList = [];
        this.inspectionsfieldList.push({ 
            label : 'Sunergy Office Location',
            fieldname : 'cf_scf_office_location',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['SoCal', 'CentralCal','NorCal'],
        },{ 
            label : 'Date of service',
            fieldname : 'cf_scf_date_service',
            uitype : 5,
            typeofdata : 'D~O',
            value : this.currentdate
        },{ 
            label : 'Scheduled Time',
            fieldname : 'cf_scf_scheduled_time',
            uitype : 2,
            typeofdata : 'V~O',
            value : this.currenttime
        },{ 
            label : 'Service Tech First Name',
            fieldname : 'cf_scf_tech_first_name',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.user_firstname
        },{ 
            label : 'Service Tech Last Name',
            fieldname : 'cf_scf_tech_last_name',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.user_lastname,
        },{ 
            label : 'Service Tech Email',
            fieldname : 'cf_scf_tech_email',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.user_email,
        },{ 
            label : 'Customer First Name',
            fieldname : 'cf_scf_cut_first_name',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.cust_firstname
        },{ 
            label : 'Customer Last Name',
            fieldname : 'cf_scf_cut_last_name',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.cust_lastname
        },{ 
            label : 'Street Address',
            fieldname : 'cf_scf_street_add',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.cust_street
        },{ 
            label : 'Street Address Line 2',
            fieldname : 'cf_scf_street_add_2',
            uitype : 1,
            typeofdata : 'V~O',
        },{ 
            label : 'City',
            fieldname : 'cf_scf_city',
            uitype : 1,
            typeofdata : 'V~O',
            value: this.cust_city
        },{ 
            label : 'State / Province',
            fieldname : 'cf_scf_state',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.cust_state,
        },{ 
            label : 'Postal / Zip Code',
            fieldname : 'cf_scf_zipcode',
            uitype : 1,
            typeofdata : 'V~O',
            value : this.cust_zip,
        },{ 
            label : 'Service is For?',
            fieldname : 'cf_scf_servicefor',
            uitype : 15,
            typeofdata : 'V~O',
            picklistvalues : ['SunRun', 'Failed inspection', 'Install', 'MPU Install', 'Other'],
        },{ 
            label : 'Service Type',
            fieldname : 'cf_scf_service_type',
            uitype : 33,
            typeofdata : 'V~O',
            picklistvalues : ['Paneling', 'System Stringing', 'Conduit Run', 'Electrical Tie-In', 'Replace Inverter', 'Placards', 'Ground Rod', 'Bonding/Grounding', 'Roof Tiles', 'Leak Repair', 'Drate/Solar Breaker', 'Other/See Notes']
        },{ 
            label : 'What work was completed on site?',
            fieldname : 'cf_scf_work_completed',
            uitype : 19,
            typeofdata : 'V~O',
        },{ 
            label : 'RMA Case Number if needed',
            fieldname : 'cf_scf_rma_number',
            uitype : 19,
            typeofdata : 'V~O',
        },{ 
            label : 'Service Complete',
            fieldname : 'cf_scf_servicecomplete',
            uitype : 555,
            typeofdata : 'V~O',
            picklistvalues : ['Yes', 'No'],
        },{ 
            label : 'Additional Work Needed (Explain)',
            fieldname : 'cf_scf_additional',
            uitype : 19,
            typeofdata : 'V~O',
        },{ 
            label : 'Date Submitted',
            fieldname : 'cf_scf_date_submitted',
            uitype : 5,
            typeofdata : 'D~O',
            value : this.currentdate
        },{ 
            label : 'Time Submitted',
            fieldname : 'cf_scf_time_submitted',
            uitype : 2,
            typeofdata : 'T~O',
            value : this.currenttime
        },{ 
            label : 'Service Photos Taken',
            fieldname : 'cf_scf_service_photos',
            uitype : 444,
            typeofdata : 'V~O',
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
        var data = this.appConst.workOrder[this.serviceid];
        console.log('appConst.workOrder = ',data);
        var flagmatch = 0;
        for (var column in data) {
          if (data[column]["photos"] !== undefined) {
            for (var index in data[column]["photos"]) {
                console.log('Inspections name2 == ',data[column]["photos"][index]["name"]);
              if (data[column]["photos"][index]["name"] == 'Service Photos Taken') {
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
            }
        }).catch((err) => {
            let imageData = this.appConst.appTestImg;
            let base64Image = 'data:image/png;base64,' + imageData;
            //console.log(err);
            this.imgpov.setImage(imageData);
            this.openModal(this.serviceid, base64Image, this.field, this.fieldindex, this.section, fieldname);
            this.presentToast(`Operation failed! \n` + err);
        });
    }
    async openModal(serviceid, base64Image,columnname,index, section, fieldname) {
        const modal = await this.modalCtrl.create({
            component: ImageModalPage,
            componentProps: {
                "base64Image": base64Image,
                "paramTitle": "Upload Photo",
                "serviceid": serviceid,
                "user_id": this.user_id,
                "columnname": columnname,
                "columnIndex": index,
                "subSection": section,
            }
        });

        modal.onDidDismiss().then((dataReturned) => {
            this.dataReturned = dataReturned.data;
            if (this.dataReturned !== null && this.dataReturned != 'Wrapped Up!') {
                console.log('dataReturned = ',this.dataReturned);
                this.instectionservice.push(this.dataReturned);
                console.log('instectionservice = ',this.instectionservice);
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
            if(this.inspectionsfieldList[i]["fieldname"] == 'cf_scf_service_photos'){
                if(this.instectionservice.length < 1){
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
    async submitservicecompletionform(){
        var formflag = await this.checkrequiredfields();
        if(formflag){
            var headers = new HttpHeaders();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/x-www-form-urlencoded");
            headers.append("Access-Control-Allow-Origin", "*");
            this.showLoading();
            var params = {
                'servicecompletionfieldList': JSON.stringify(this.inspectionsfieldList),
                'workorderfielddata': JSON.stringify(this.appConst.workOrder[this.serviceid][this.field]),
                'recordid': this.serviceid,
                'columnname': this.field,
                'fieldindex': this.fieldindex,
                'section': this.section,
                'logged_in_user': this.user_id,
            };
            this.httpClient
            .post(this.apiurl + "saveServiceCompletionForm.php", params, {
              headers: headers,
              observe: "response",
            })
            .subscribe(
              (data) => {
                this.hideLoading();
                var success = data["body"]["success"];
                console.log('data return arr == ',data);
                
                if (success == true) {
                    console.log("Form PDF is Upload successfully");

                    var images_details = data["body"]["data"]["images_details"];
                    this.appConst.workOrder[this.serviceid][this.field] = images_details;
                    this.appConst.workOrder[this.serviceid][this.field]["complete_category"] = 'yes';
                    this.appConst.workOrder[this.serviceid][this.field]["forms_count"] = this.appConst.workOrder[this.serviceid][this.field]["forms_count"]+1;

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
