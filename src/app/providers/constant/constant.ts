import { Injectable } from '@angular/core';

@Injectable()
export class AppConstants  {
    workOrder: object = {};
    apiurl : string = 'https://devl06.borugroup.com/sunergy/phoneapi/';
    vturl : string = 'https://devl06.borugroup.com/sunergy/';
    
    getApiUrl() {
        return this.apiurl;
    }
    getVtUrl() {
        return this.vturl;
    }
}
