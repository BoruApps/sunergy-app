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
    columnname: string[];
    apiurl: any;
    user_id: any;
    dataReturned: any;
    index:any;
    is_delete:any;
    documentid:any;
    fileName:any;
    base64Image:string[];

    btnList = [
        { name:"circle", class:"radio-button-off" },
        { name:"square", class:"square-outline" },
        { name:"search", class:"search" },
        { name:"arrow", class:"arrow-forward" },
        { name:"brush", class:"brush" },
        { name:"undo", class:"undo" },
        { name:"redo", class:"redo" },
        { name:"crop", class:"crop" },
        { name:"text", class:"text" },
        { name:"rotate", class:"sync" }
    ];
    photo = {
        title: '',
        primary_title: '',
        secondary_title: '',
        tower_section: '',
        serviceid: '',
        base64Image: '',
        columnname: ''
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
    protected imgBackground;

    protected pausePanning;
    protected zoomStartScale;

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
            end: {}, 
            zoom: 1,
            canvasScale: 1,
            orginalImg: {
                width: 0,
                height: 0
            },
            reset: false
        };
        this.imgBackground = null;
        this.pausePanning = false;
        this.zoomStartScale = null;
    }

    @ViewChild('canvas',{static:false}) canvasEl: ElementRef;
    @ViewChild('img',{static:false}) img: ElementRef;
    ngOnInit() {
        //console.table(this.navParams);
        this.modelId = this.navParams.data.paramID;
        this.serviceid = this.navParams.data.serviceid;
        this.columnname = this.navParams.data.columnname;
        this.modalTitle = this.navParams.data.paramTitle;
        this.photo.title = this.allTitlelist[this.navParams.data.columnname];
        this.user_id = this.navParams.data.user_id;
        this.index = this.navParams.data.columnIndex;
        this.is_delete = this.navParams.data.is_delete;
        this.documentid = this.navParams.data.documentid;
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
            case "brush":
                this._CANVAS.isDrawingMode = (this._CANVAS.isDrawingMode) ? false: true;
            break;
            case "undo":
                this.undoImg();
            break;
            case "redo":
                this.redoImg();
            break;
        }
    }

    rotateImage(ev) {
        let valRotate = ev.target.value;
        let curWidth = this._CANVAS.getWidth();
        let curHeight = this._CANVAS.getHeight();
        if(curWidth > curHeight) {

            this._CANVAS.setWidth(curWidth);
            this._CANVAS.setHeight(curWidth);
        } else if(curHeight > curWidth) {

            this._CANVAS.setWidth(curHeight);
            this._CANVAS.setHeight(curHeight);
        }
         
        this._CANVAS.setBackgroundImage(this.imgBackground, this._CANVAS.renderAll.bind(this._CANVAS),{
            crossOrigin: 'anonymous',
            originX: 'center',
            originY: 'center',
            top: this._CANVAS.getWidth()/2,
            left: this._CANVAS.getWidth()/2
        });
        //console.log(valRotate);
        this._CANVAS.backgroundImage.rotate(valRotate);
        //console.log(this._CANVAS.toDataURL());
        if([90,180,270,360].includes(valRotate)) {
            
            this._CANVAS.setWidth(curHeight);
            this._CANVAS.setHeight(curWidth);   
        } 
        console.log(this._CANVAS.getWidth());
        
        this._CANVAS.renderAll();
        //this.updateModifications(true);
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

        console.log(this.touchTracker);
        if(this.touchTracker.zoom >= 10) {
            this.touchTracker.zoom -= 1;
            this.touchTracker.reset = true;
        } else if(this.touchTracker.zoom < 1) {
            this.touchTracker.zoom += 1;
            this.touchTracker.reset = false;
        }
        this.touchTracker.canvasScale =  this.touchTracker.zoom * 1.15;
        console.log(this.touchTracker);
        var canvasCenter = new fabric.Point(this.touchTracker.start.x, this.touchTracker.start.y);
        this._CANVAS.zoomToPoint(canvasCenter, this.touchTracker.canvasScale);
        this._CANVAS.renderAll();
        (!this.touchTracker.reset) ? this.touchTracker.zoom++ : this.touchTracker.zoom--;
        //this.updateModifications(true);
    }

    addText() {
        var text = this._CANVAS.add(new fabric.IText('Touch here to edit Text', {
            left: this.touchTracker.start.x,
            top: this.touchTracker.start.y,
            fill: 'white',
            fontFamily: 'Arial, Helvetica, sans-serif',
            stroke: 'black',
            fontWeight: 'bold',
            strokeWidth: 4,
            paintFirst: 'stroke',
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
        var elmurl = document.querySelector<HTMLInputElement>('.img-load')!;
        fabric.Image.fromURL(this.imgElm.src, (img) => {
            this.imgBackground = img;
            this._CANVAS.setBackgroundImage(img, this._CANVAS.renderAll.bind(this._CANVAS),{
                scaleX: this._CANVAS.width / img.width,
                scaleY: this._CANVAS.height / img.height,
                crossOrigin: 'anonymous'
            });
            this.updateModifications(true);
        }, { crossOrigin: 'Anonymous' });
        this.touchTracker.orginalImg = {
            width: this._CANVAS.width,
            height: this._CANVAS.height
        };
        var elmurl = document.querySelector<HTMLInputElement>('.img-load')!;
        elmurl.style.display = "none";
        if(this.elementSelected == 'search') return;
        (function(elm) {
            elm._CANVAS.on({
                'object:modified': function() {
                    if(elm._CANVAS.isDrawingMode){
                        console.log('mod isDrawingMode');
                        elm.updateModifications(true);
                    }
                }, 'object:added': function() {
                    if(elm._CANVAS.isDrawingMode){
                        console.log('added isDrawingMode');
                        elm.updateModifications(true);
                    }
                }, 'mouse:down': function(ev) {
                    if(ev.target == null) {
                        elm.touchTracker.start = ev.pointer;
                        elm.touchTracker.end = ev.pointer;
                        if(elm.elementSelected == "text") {
                            elm.addText();
                        }
                    } else  elm.touchTracker = { start:null};
                },'mouse:up': function(ev) {
                    if(elm.touchTracker.start === null) return;
                    elm.touchTracker.end = ev.pointer;
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
                            elm.cropImage();
                        break;
                        case "search":
                            elm.zoomImg();
                        break;
                    }
                }
            });
        })(this)
        this._CANVAS.counter = 0;
    }

    drawArrow() {
        var fromx = this.touchTracker.start.x;
        var fromy = this.touchTracker.start.y;
        var tox = this.touchTracker.end.x;
        var toy = this.touchTracker.end.y;
        var angle = Math.atan2(toy - fromy, tox - fromx);
        var headlen = 10;  // arrow head size

        tox = tox - (headlen) * Math.cos(angle);
        toy = toy - (headlen) * Math.sin(angle);
        var points = [
            {
                x: fromx,  // start point
                y: fromy
            }, {
                x: fromx - (headlen / 4) * Math.cos(angle - Math.PI / 2),
                y: fromy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            },{
                x: tox - (headlen / 4) * Math.cos(angle - Math.PI / 2),
                y: toy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
            }, {
                x: tox - (headlen) * Math.cos(angle - Math.PI / 2),
                y: toy - (headlen) * Math.sin(angle - Math.PI / 2)
            },{
                x: tox + (headlen) * Math.cos(angle),  // tip
                y: toy + (headlen) * Math.sin(angle)
            }, {
                x: tox - (headlen) * Math.cos(angle + Math.PI / 2),
                y: toy - (headlen) * Math.sin(angle + Math.PI / 2)
            }, {
                x: tox - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: toy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            }, {
                x: fromx - (headlen / 4) * Math.cos(angle + Math.PI / 2),
                y: fromy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
            },{
                x: fromx,
                y: fromy
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

    cropImage() {
        let x = ((this.touchTracker.start.x - this.touchTracker.end.x) > 0) ? this.touchTracker.end.x : this.touchTracker.start.x;


        let y = ((this.touchTracker.start.y - this.touchTracker.end.y) > 0) ? this.touchTracker.end.y : this.touchTracker.start.y;
        
        let width = Math.abs(this.touchTracker.start.x - this.touchTracker.end.x);
        let height = Math.abs(this.touchTracker.start.y - this.touchTracker.end.y);

        let tempImg = new Image();
        let tempCanvas = document.createElement('canvas');
        let tempctx = tempCanvas.getContext('2d');
        tempImg.src = this._CANVAS.toDataURL();
        tempCanvas.width = width;
        tempCanvas.height = height;
        (function(elm) {
            tempImg.onload = function() {
                tempctx.drawImage(tempImg, 
                    x,y,
                    width,
                    height,
                    0,0,
                    width,
                    height);

                let tempImg2 = new Image();
                tempImg2.src = tempCanvas.toDataURL();

                elm._CANVAS.clear();
                (function(elm){
                    tempImg2.onload = function() {
                        elm.imgBackground = elm._CANVAS.setBackgroundImage(tempImg2.src, elm._CANVAS.renderAll.bind(elm._CANVAS),{
                            scaleX: elm._CANVAS.width / width,
                            scaleY: elm._CANVAS.height / height,
                            crossOrigin: 'anonymous'
                        });
                    }
                })(elm);
            }
        })(this);
    }

    updateModifications(history) {
        this._CANVAS.counter ++;
        console.log("In updateModifications")
        if(history === true) {
            var _json = JSON.stringify(this._CANVAS);
            this.state.push(_json);
        }
    }

    undoImg() {
        if(this.mods < this.state.length) {
            console.log("undoImg",this.state.length, this.mods);
            let _index = this.state.length - 1 - this.mods - 1;
            if(_index < 0 ) return;
            this._CANVAS.clear().renderAll();
            this._CANVAS.loadFromJSON(this.state[_index]);
            this._CANVAS.renderAll();
            this.mods += 1;
        }
    }

    redoImg() {
        if (this.mods > 0) {
            console.log("redoImg",this.state.length, this.mods);
            this._CANVAS.clear().renderAll();
            this._CANVAS.loadFromJSON(this.state[this.state.length - 1 - this.mods + 1]);
            this._CANVAS.renderAll();
            this.mods -= 1;
        }
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

    async uploadImage(data,delete_needed=false) {
        var headers = new HttpHeaders();
        headers.append("Accept", 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', '*');

        await this.GetCanvasAtResoution();

        if (this._CANVAS.toDataURL()) {
            var bs64img = this._CANVAS.toDataURL();
            var imageData = bs64img.split(',')[1];
        }else{
            var imageData = this.imageData;
        }

        var param = {
            'base64Image':imageData,
            'serviceid':this.serviceid,
            'columnname':this.columnname,
            'is_delete':delete_needed,
            'logged_in_user':this.user_id,
            'index':this.index,
            'documentid':this.documentid,
            'notecontent':data.title,
            'mode':'image_upload',
        };

        console.log('adding photo for', param.serviceid);
        console.log('adding photo columnname', param.columnname);
        console.log('need to delete image', param.is_delete);

        this.showLoading();
        this.httpClient.post(this.apiurl + "postPhotos.php", param, {headers: headers, observe: 'response'})
            .subscribe(data => {
                this.hideLoading();
                //console.log(data['_body']);
                if (data['body']['success'] == true) {
                    if (delete_needed === true){
                        for(var imgindex in this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos']) {
                            if (this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'][imgindex]['documentid'] == this.documentid){
                                this.appConst.workOrder[this.serviceid][this.columnname]['photos'][this.index]['photos'].splice(imgindex,1);
                            }
                        }
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

    GetCanvasAtResoution ()
    {
        var elmurl = document.querySelector<HTMLInputElement>('.img-load')!;

        if (this._CANVAS.width != elmurl.width) {
            var scaleX = elmurl.width / this._CANVAS.width;
            var scaleY = elmurl.height / this._CANVAS.height;

            var objects = this._CANVAS.getObjects();
            for (var i in objects) {
                objects[i].scaleX = objects[i].scaleX * scaleX;
                objects[i].scaleY = objects[i].scaleY * scaleY;
                objects[i].left = objects[i].left * scaleX;
                objects[i].top = objects[i].top * scaleY;
                objects[i].setCoords();
            }
            var obj = this._CANVAS.backgroundImage;
            if(obj){
                obj.scaleX = obj.scaleX * scaleX;
                obj.scaleY = obj.scaleY * scaleY;
            }

            this._CANVAS.discardActiveObject();
            this._CANVAS.setWidth(this._CANVAS.getWidth() * scaleX);
            this._CANVAS.setHeight(this._CANVAS.getHeight() * scaleY);
            this._CANVAS.renderAll();
            this._CANVAS.calcOffset();
        }
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
