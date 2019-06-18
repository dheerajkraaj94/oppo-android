import { Injectable } from '@angular/core';
declare var io;
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media';
import { Observable } from 'rxjs/Observable';
import { Toast } from '@ionic-native/toast';
import { CoreAppProvider } from '@providers/app';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Insomnia } from '@ionic-native/insomnia';
import { Network } from '@ionic-native/network';
import { Events } from 'ionic-angular';
import { CoreSitesProvider } from '@providers/sites';

export enum ConnectionStatusEnum {
    Online,
    Offline
}
@Injectable()
export class WowzaSubscriber {

    url: string = 'rtsp://webrtcedu21.nexg.tv/';//'rtsp://centwss.nexg.tv:8088';//'rtsp://webrtcedu.nexg.tv/';
    applicationName: string = 'live/';
    videoType: string = '';//'mp4:';
    // hls_ext: string = "/playlist.m3u8";
    hls_ext: string = "";
    socket: any;

    hls_ulr: string = '';
    room_id: any = '';
    c_type:number = 1;

    streamOldStatus = 'started';
    init_player: any = '';
    interval: any;previousStatus:any;
    user_id: any = '';
    user_name: any = '';
    img_url: any = '';
    app_id: any = '';
    //wsToken: any = 'b4c678ced6a9bdac91e4ef98751c7748';
    currentSite: any = this.sitesProvider.getCurrentSite();
    siteUrl:any =  this.currentSite.getURL();
    wsToken: any = this.currentSite.getToken();
    socket_url:any = 'https://socket.vedific.com:9002';//'https://socket.vedific.com:9002';//'https://multitenentsocket.vedific.com:9002'
    socket_transport = 'websocket';

    teacher_id: any;
    teacher_name:any;
    teacher_image:any;
    mobile_image_url:any = '';
    constructor(private streamingMedia: StreamingMedia, private sitesProvider: CoreSitesProvider, private toast: Toast, protected appProvider: CoreAppProvider,
        public network :Network, private screenOrientation: ScreenOrientation, private insomnia: Insomnia,
        public eventCtrl : Events) { 
            this.previousStatus = ConnectionStatusEnum.Online;
        }

        init(data:any){
            if (data.vedificvc_settings != undefined) {
                this.url = 'rtsp://'+data.vedificvc_settings.media_url;
                this.applicationName = data.vedificvc_settings.wowza_transcode_app + '/';
                this.socket_url = data.vedificvc_settings.socket_url;
                switch(data.vedificvc_settings.socket_type){
                    case 'websocket':
                    this.socket_transport = "websocket";
                    break;
                    case 'polling':
                    this.socket_transport = "pooling";
                    break;
                    case 'polling_websocket':
                    this.socket_transport = "polling_websocket";
                    break;
                    default:
                    this.socket_transport = "websocket";
                    break
                }
            }    
        }

    connectSocket(room_id: any, user_id: any, userName: any, img_url: any, app_id:any, class_type:number): Promise<any> {
        this.c_type = class_type;
        this.user_id = user_id;
        this.user_name = userName;
        this.img_url = img_url;
        this.app_id = app_id;
        this.disconnectSocket();
        this.room_id = room_id;
        this.wowzaHLSURL();
        this.mobile_image_url = img_url;
        if(this.mobile_image_url.includes('pluginfile.php') && !this.mobile_image_url.includes('webservice')){
            this.mobile_image_url = this.mobile_image_url.replace('/pluginfile.php', '/webservice/pluginfile.php');
        }
        console.log(this.mobile_image_url);
        if(this.socket_transport == 'polling_websocket'){
            this.socket = io( this.socket_url+'/?app_id='+app_id+'&room_id=' + room_id + '&user_id=' + user_id + '&user_name=' + userName + '&image_url=' + img_url+'&device_type=app&mobile_image_url='+this.mobile_image_url, {
                transports: ['websocket', 'pooling'],
            });
            console.log(this.socket_url+'/?app_id='+app_id+'&room_id=' + room_id + '&user_id=' + user_id + '&user_name=' + userName + '&image_url=' + img_url+'&device_type=app&mobile_image_url='+this.mobile_image_url, {
                transports: ['websocket', 'pooling'],
            })
        }else{
            this.socket = io( this.socket_url+'/?app_id='+app_id+'&room_id=' + room_id + '&user_id=' + user_id + '&user_name=' + userName + '&image_url=' + img_url+'&device_type=app&mobile_image_url='+this.mobile_image_url, {
                transports: [this.socket_transport],
            });
            console.log(this.socket_url+'/?app_id='+app_id+'&room_id=' + room_id + '&user_id=' + user_id + '&user_name=' + userName + '&image_url=' + img_url+'&device_type=app&mobile_image_url='+this.mobile_image_url, {
                transports: [this.socket_transport],
            });
        }
        
        
      
        return new Promise((resolve, reject) => {

            this.socket.on('connect', function (data) {
                console.log('connect data '+JSON.stringify(data));
            });
            this.socket.on('disconnect', function (data) {
                console.log('disconnect data '+JSON.stringify(data));
            });
            this.socket.emit('sync', {});
            this.socket.on('sync', function (data) {
                console.log('sync data '+JSON.stringify(data));
                resolve(data);
            });
            this.socket.on('personal', function (data) {
                resolve(data);
            });

        });
    }
    reInitSocket(room_id,user_id,userName,userImage, app_id, class_type){
        // if(typeof this.init_player == 'object'){
            this.disconnectSocket();
            this.connectSocket(room_id, user_id, userName, userImage, app_id, class_type);
     //   }
    }
    getRoom() {
        let observable = new Observable(observer => {
            this.socket.on('rooms', (data) => {
                console.log('rooms service => ' + JSON.stringify(data));
                observer.next(data);
            });
        })
        return observable;
    }
    wasTeacherOffline: number = 0;
    getUser(publisher_id) {
        let observable = new Observable(observer => {
            this.socket.on('users', (data) => {
                console.log('user data '+JSON.stringify(data));
                if (data.user_id == publisher_id && data.status == 0 && this.streamOldStatus != 'stopped') {
                    // this.closePlayer();
                    // this.unlockScreen();
                    clearInterval(this.interval);
                    this.wasTeacherOffline = 1;
                    this.streamOldStatus = 'publisher_offline';
                    let publisher_offline = { 'status': true };
                    observer.next(publisher_offline);
                } else if (data.user_id == publisher_id && data.status == 1 && this.wasTeacherOffline == 1) {
                    this.wasTeacherOffline = 0;
                    let publisher_offline = { 'status': false };
                    observer.next(publisher_offline);
                }
            });
        })
        return observable;
    }
    socketDisconnect() {
        let observable = new Observable(observer => {
            this.socket.on('disconnect', () => {
                this.socket = '';
                let disconnect_status = { 'status': true };
                observer.next(disconnect_status);
            });
        })
        return observable;
    }
    disconnectSocket() {
        if (typeof this.socket == 'object') {
            this.socket.disconnect();
        }

        this.socket = '';
    }
    wowzaHLSURL() {
        if (this.room_id == '') { this.hls_ulr = ''; return; }
        this.hls_ulr = this.url + this.applicationName + this.videoType + this.room_id + '_source' + this.hls_ext;
        return this.hls_ulr;
    }
    isPlayerCalled: number = 0;
    handleStreamStatus(stream_status: string, isMuted: boolean, showPop?: any) {

        let timer = 5000;

        clearInterval(this.interval);
        this.unlockScreen();
        switch (stream_status) {
            case 'paused':
                let self = this;
                this.interval = setTimeout(function () {
                    //   self.videoPlayer.close();
                    if (showPop) {
                       // self.toastMsg('This class has been paused by teacher.');
                    }
                }, timer);

                console.log('paused called');
                this.streamOldStatus = stream_status;
                break;
            case 'playing':
                //  this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
                console.log('this.streamOldStatus ' + this.streamOldStatus);
                if (this.streamOldStatus != 'playing') {

                    if (this.isPlayerCalled == 1) {
                        let p_this = this;
                        this.interval = setTimeout(() => {
                            if (typeof this.init_player == 'string') {
                                console.log('initPlayer timer');
                                p_this.initPlayer();
                            }
                        }, 6000);
                    } else {
                        let first_this = this;
                        this.interval = setTimeout(() => {
                            console.log('initPlayer ');
                            first_this.initPlayer();
                        }, 1500);
                    }


                    this.isPlayerCalled = 1;
                }
                this.streamOldStatus = stream_status;
                break;
            case 'stopped':

                this.streamOldStatus = stream_status;
                let self_this = this;
                this.interval = setTimeout(function () {
                    // self_this.videoPlayer.close();
                    if (showPop) {
                      //  self_this.toastMsg('This class has been cloesd by teacher.');
                    }
                }, timer);

                break;
            case 'socketDisconnect':
                this.streamOldStatus = stream_status;
               // this.toastMsg('Class Closed');
                break;
            case 'no_connection':
                this.streamOldStatus = stream_status;
                let s_this = this;
                this.interval = setTimeout(function () {
                    // s_this.videoPlayer.close();
                    //  s_this.toastMsg('No Internet');
                    s_this.toast.show('No Internet', '5000', 'center').subscribe(
                        toast => {
                            console.log(toast + ' toast called');
                        }
                    );
                }, timer);
                break;
            case 'no_error':
                this.streamOldStatus = stream_status;
                break;
            default:
                this.streamOldStatus = stream_status;
                // this.toastMsg('This class is not started yet.');
                break;
        }
    }
    toastMsg(msg: string) {
        // this.toast.show(msg, '5000', 'center').subscribe(
        //     toast => {
        //         console.log(toast + ' toast called');
        //     }
        // );
    }
    isSocketConnected() {
        if (typeof this.socket == 'object') {
            return true;
        }else{
            return false;
        }
    }
    initPlayer() {
        let hls_ulr = this.wowzaHLSURL();
        const api_url = this.siteUrl+'/api/rooms/';
        if (hls_ulr != '') {console.log('hls_ulr '+ hls_ulr);
        const plugin_url = api_url+'#landscape#'+this.room_id+'#123456789#'+this.user_id+'#'+this.user_name+'#'+this.mobile_image_url+'#app#'+this.app_id+'#'+this.app_id+'#'+this.wsToken+'#'+this.siteUrl+'#'+this.socket_url+'#'+this.c_type;
        console.log(plugin_url);
        this.disconnectSocket();
            let options: StreamingVideoOptions = {
                successCallback: () => {
                    this.init_player = '';
                    this.resumeVideo();
                    console.log('Video played');
                 //   this.connectSocket(this.room_id, this.user_id, this.user_name, this.img_url, this.app_id, this.c_type);
                },
                errorCallback: (e) => {
                  //  this.connectSocket(this.room_id, this.user_id, this.user_name, this.img_url, this.app_id, this.c_type);
                    this.init_player = '';
                    this.toast.show('Stream is not available. Please try again.', '5000', 'center').subscribe(
                        toast => {
                            console.log(toast + ' toast called');
                        }
                    );
                },
                orientation: plugin_url,
                shouldAutoClose: true,
                controls: false,
            };
            this.init_player = this.streamingMedia.playVideo(hls_ulr, options);
        }
    }

    closePlayer() {

        if (typeof this.init_player == 'object') {
            //this.videoPlayer.close();
        }
        this.init_player = '';

    }
    destroyPlayerInstance(){
        this.init_player = '';
    }
    forcedisconnectSocket() {
       
      //  this.socket.disconnect();
   
    this.socket = '';
}
    resumeVideo() {

    }
    unlockScreen() {
        console.log(typeof this.screenOrientation);
        if (typeof this.screenOrientation == 'object') {
            this.screenOrientation.unlock();
        }
    }
    clearIntervals() {
        clearInterval(this.interval);
    }
    isInternet() {
        let observable = new Observable(observer => {
            let isOnline = this.appProvider.isOnline();
            let online_status = { 'status': isOnline };
            observer.next(online_status);
        })
        return observable;
    }
    initializeNetworkEvents(): void {
        this.network.onDisconnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Online) {
                this.eventCtrl.publish('network:offline');
            }
            this.previousStatus = ConnectionStatusEnum.Offline;
        });
        this.network.onConnect().subscribe(() => {
            if (this.previousStatus === ConnectionStatusEnum.Offline) {
                this.eventCtrl.publish('network:online');
            }
            this.previousStatus = ConnectionStatusEnum.Online;
        });
    }
}

// initPlayer() {
//     let hls_ulr = this.wowzaHLSURL();;
//     if (hls_ulr != '') {
//         this.insomnia.keepAwake()
//             .then(
//                 () => console.log('success'),
//                 () => console.log('error')
//             );


//         this.init_player = this.videoPlayer.play(hls_ulr).then(() => {
//             this.init_player = '';
//             //  this.disconnectSocket();
//             this.resumeVideo();
//             this.unlockScreen();
//             this.insomnia.allowSleepAgain()
//                 .then(
//                     () => console.log('success'),
//                     () => console.log('error')
//                 );
//         }).catch(e => {
//             this.init_player = '';
//             // this.disconnectSocket();
//             // this.toastMsg(e);
//             this.unlockScreen();
//             this.insomnia.allowSleepAgain()
//                 .then(
//                     () => console.log('success'),
//                     () => console.log('error')
//                 );
//         });
//     }
// }