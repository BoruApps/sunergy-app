import { Component, 
    OnInit,
    ElementRef,
    ViewChild
} from '@angular/core';
import {ModalController, NavParams, ToastController, PickerController, NavController} from '@ionic/angular';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer/ngx';
import {File} from '@ionic-native/file';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {ImageProvider} from '../../providers/image/image';
import {AppConstants} from '../../providers/constant/constant';
import {LoadingController} from '@ionic/angular';
import {ImageConfirmModalPage} from "../image-confirm-modal/image-confirm-modal.page";
import { fabric } from 'fabric';
import { Statement } from '@angular/compiler';

@Component({
    selector: 'app-image-modal',
    templateUrl: './image-modal.page.html',
    styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {


    private _CANVAS : any;
    private _CONTEXT: any;

    private ctx: CanvasRenderingContext2D;
    private imgElm: HTMLImageElement;

    saveX: number;
    saveY: number;
    elemList: {};
    zoom: any;

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

    btnList = [
        { name:"circle", class:"radio-button-off" },
        { name:"square", class:"square-outline" },
        { name:"search", class:"search" },
        { name:"arrow", class:"arrow-forward" },
        { name:"brush", class:"brush" },
        { name:"undo", class:"undo" },
        { name:"redo", class:"redo" },
        { name:"crop", class:"crop" },
        { name:"text", class:"text" }
    ];
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
    elementSelected: any;
    touchTracker: any;

    protected state;
    protected mods;

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
        public loadingController: LoadingController,
        public navCtrl: NavController
    ) {
        this.imageData = this.imgpov.getImage();
        this.apiurl = this.appConst.getApiUrl();
        this.zoom = false;
        this.state = [];
        this.mods = 0;
        this.touchTracker = {
            start: {},
            end: {}
        };
    }

    @ViewChild('canvas',{static:false}) canvasEl: ElementRef;
    @ViewChild('img',{static:false}) img: ElementRef;
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

    ngAfterViewInit() {
        this._CANVAS = new fabric.Canvas('canvas');

        this.imgElm = this.img.nativeElement;

        this.ctx = this._CANVAS.getContext('2d')
    }

    drawBtnSelect(btn) {
        if(this.elementSelected == "search") {
            this._CANVAS.setViewportTransform([1,0,0,1,0,0]); 
        }
        this.elementSelected = btn;
        if(this._CANVAS.isDrawingMode) this._CANVAS.isDrawingMode = false;
        console.log(this.elementSelected);
        switch(this.elementSelected) {
            case "search":
                this.zoomImg();
            break;
            case "brush":
                this._CANVAS.isDrawingMode = (this._CANVAS.isDrawingMode) ? false: true;
                //this.updateModifications(true);
            break;
            case "undo":
                this.undoImg();
            break;
            case "redo":
                this.redoImg();
            break;
        }
    }

    drawCircle() {

        let x = ((this.touchTracker.start.x - this.touchTracker.end.x) > 0) ? this.touchTracker.end.x : this.touchTracker.start.x;


        let y = ((this.touchTracker.start.y - this.touchTracker.end.y) > 0) ? this.touchTracker.end.y : this.touchTracker.start.y;

        this._CANVAS.add(
            new fabric.Circle({
                left:x,
                top:y,
                radius: Math.abs(this.touchTracker.start.x - this.touchTracker.end.x)/2,
                fill: 'transparent',
                strokeWidth: 4,
                stroke: '#000000'
            })
        );
        
        this.updateModifications(true);
    }

    zoomImg() {
        this._CANVAS.on('mouse:wheel', function(opt) {
            var delta = opt.e.deltaY;
            var zoom = this.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
    }
    
    addText() {
        var text = this._CANVAS.add(new fabric.IText('Touch here to edit Text', {
            left: this.touchTracker.start.x,
            top: this.touchTracker.start.y,
            fill: 'black',
            fontSize: 20
        }));
        this.updateModifications(true);
    }
    
    drawSquare() {
        let x = ((this.touchTracker.start.x - this.touchTracker.end.x) > 0) ? this.touchTracker.end.x : this.touchTracker.start.x;


        let y = ((this.touchTracker.start.y - this.touchTracker.end.y) > 0) ? this.touchTracker.end.y : this.touchTracker.start.y;

        this._CANVAS.add(
            new fabric.Rect({
                left:x,
                top:y,
                width: Math.abs(this.touchTracker.start.x - this.touchTracker.end.x),
                height: Math.abs(this.touchTracker.start.y - this.touchTracker.end.y),
                fill: 'transparent',
                strokeWidth: 4,
                stroke: '#000000'
            })
        );
        this.updateModifications(true);
    }

    updateCanvas(event) {
        var url = document.querySelector('.img-load').src;
        fabric.Image.fromURL(url, (img) => {
            this._CANVAS.setBackgroundImage(img, this._CANVAS.renderAll.bind(this._CANVAS),{
                scaleX: this._CANVAS.width / img.width,
                scaleY: this._CANVAS.height / img.height
            });
            this.updateModifications(true);
        });
        document.querySelector('.img-load').style.display = "none";
        (function(elm) {
            elm._CANVAS.on({
                'object:modified': function() {
                    elm.updateModifications(true);
                }, 'object:added': function() {
                    elm.updateModifications(true);
                }, 'mouse:down': function(ev) {
                    if(ev.target == null) {
                        elm.touchTracker.start = ev.pointer;
                        elm.touchTracker.end = ev.pointer;
                        if(elm.elementSelected == "text") {
                            elm.addText();
                        }
                    } else  elm.touchTracker = { start:null};
                }, 'mouse:up': function(ev) {
                    if(elm.touchTracker.start === null) return;
                    elm.touchTracker.end = ev.pointer;
                    console.log(elm.touchTracker);
                    switch(elm.elementSelected) {
                        case "circle":
                            elm.drawCircle();
                        break;
                        case "square":
                            elm.drawSquare();
                        break;
                        case "arrow":
                            elm.drawArrow();
                        break;
                        case "crop":
                        break;
                    }

                }
            });
        })(this)
        this._CANVAS.counter = 0;
    }

    updateModifications(history) {
        this._CANVAS.counter ++;
        if(history === true) {
            var _json = JSON.stringify(this._CANVAS);
            this.state.push(_json);
        }
    }

    undoImg() {
        if(this.mods < this.state.length) {
            let _index = this.state.length - 1 - this.mods - 1;
            if(_index < 0 ) return;
            this._CANVAS.clear().renderAll();
            console.log(_index, this.state);
            this._CANVAS.loadFromJSON(this.state[_index]);
            this._CANVAS.renderAll();
            //console.log("geladen " + (state.length-1-mods-1));
            //console.log("state " + state.length);
            this.mods += 1;
            //console.log("mods " + mods);
        }
    }

    redoImg() {
        if (this.mods > 0) {
            this._CANVAS.clear().renderAll();
            this._CANVAS.loadFromJSON(this.state[this.state.length - 1 - this.mods + 1]);
            this._CANVAS.renderAll();
            //console.log("geladen " + (state.length-1-this.mods+1));
            this.mods -= 1;
            //console.log("state " + state.length);
            //console.log("mods " + mods);
        }
    }

    drawArrow() {

        var angle = Math.atan2(this.touchTracker.end.y - this.touchTracker.start.x, this.touchTracker.end.x - this.touchTracker.start.y);

        var headlen = 15;  // arrow head size
    
        // bring the line end back some to account for arrow head.
        this.touchTracker.end.x = this.touchTracker.end.x - (headlen) * Math.cos(angle);
        this.touchTracker.end.y = this.touchTracker.end.y - (headlen) * Math.sin(angle);
    
        // calculate the points.
        var points = [
            {
                x: this.touchTracker.start.y,  // start point
                y: this.touchTracker.start.x
            }, {
                x: this.touchTracker.start.y - (headlen / 4) * Math.cos(angle - Math.PI / 2), 
                y: this.touchTracker.start.x - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            },{
                x: this.touchTracker.end.x - (headlen / 4) * Math.cos(angle - Math.PI / 2), 
                y: this.touchTracker.end.y - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            }, {
                x: this.touchTracker.end.x - (headlen) * Math.cos(angle - Math.PI / 2),
                y: this.touchTracker.end.y - (headlen) * Math.sin(angle - Math.PI / 2)
            },{
                x: this.touchTracker.end.x + (headlen) * Math.cos(angle),  // tip
                y: this.touchTracker.end.y + (headlen) * Math.sin(angle)
            }, {
                x: this.touchTracker.end.x - (headlen) * Math.cos(angle + Math.PI / 2),
                y: this.touchTracker.end.y - (headlen) * Math.sin(angle + Math.PI / 2)
            }, {
                x: this.touchTracker.end.x - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: this.touchTracker.end.y - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            }, {
                x: this.touchTracker.start.y - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: this.touchTracker.start.x - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            },{
                x: this.touchTracker.start.y,
                y: this.touchTracker.start.x
            }
        ];
        
        var pline = new fabric.Polyline(points, {
            fill: 'white',
            stroke: 'black',
            opacity: 1,
            strokeWidth: 1,
            originX: 'left',
            originY: 'top',
            selectable: true
        });
    
        this._CANVAS.add(pline);

        this.updateModifications(true);
    }

    cropImage(){
        this._CANVAS.discardActiveObject().renderAll();
        var img = document.querySelector('#canvas');
        var dataUrl = img.toDataURL();
        console.log(dataUrl);
        // var block = imgPath.split(";");
        // var dataType = block[0].split(":")[1];
        // var realData = block[1].split(",")[1];


        // window['plugins'].crop.promise(realData, {
        //     quality: 75
        // }).then(newPath => {
        //         console.log('newPath',newPath)
        //     },
        //     error => {
        //         console.log("CROP ERROR -> " + JSON.stringify(error));
        //     }
        // );
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
