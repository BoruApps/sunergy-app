import { Injectable } from '@angular/core';

@Injectable()
export class AppConstants  {
    apiurl : string = 'http://192.241.134.167/phoneapi/';
    vturl : string = 'http://192.241.134.167/';
    getApiUrl() {
        return this.apiurl;
    }
    getVtUrl() {
        return this.vturl;
    }
}
