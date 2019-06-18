import { Injectable, ViewChild, ElementRef, ComponentFactoryResolver } from '@angular/core';
import { CoreAppProvider } from '@providers/app';
import { Observable } from 'rxjs';
import _ from 'lodash';
// import '../../../../assets/liveclass/socket.io.js';

export declare var RTCMultiConnection: any;
export declare var PdfViewer: any;

declare var getHTMLMediaElement: any;
@Injectable()
export class AddonModLiveClassProvider {
    socketURL: any = 'https://demosocket.vedific.com:9001/';
    connection = new RTCMultiConnection();
    BandwidthHandler: any = this.connection.BandwidthHandler;
    audio: boolean = true;
    video: boolean = true;
    oneway: boolean = true;
    audioBandwidth: number = 50;
    videoBandWidth: number = 256;
    screenBandwidth: number = 300;
    roomID: any = '';
    error: any[];
    user: any[];
    liveStream: any;
    isLiveStreamAvailable = false;
    DOMhtmlSelector: string;
    isUserOnline: boolean = false;
    classClosed: boolean = false;
    rejoinSecond = 3000;
    isAppInBackGround: boolean = false;
    userID: any;

    errorQuerySelector = '';
    classCloseMsg = '';
    documentTabId = '';
    gotFirstTab: boolean = false;
    tabs: any = [];
    tab: any = {};
    saved_documents: any[];
    no_content: string = 'Loading...';

    pdf_viewer: any;

    constructor(protected appProvider: CoreAppProvider) {
        this.errorQuerySelector = '.stream_status';
        this.classCloseMsg = 'Class has been closed by teacher.';
    }

    //setUser details
    saveuser(userDetails: any) {
        console.log('saveuser');
        this.user = userDetails;
        this.roomID = userDetails.room_id;
        this.userID = userDetails.user_id;
		
		
		this.connection.extra = {
            name: 'sahil',
            email: 'sahil@digivive.com',
            id:userDetails.user_id,
            image_url:'',
        };
    }
    // initialize the basic configuratnion 
    init(isAudio: boolean, isVideo: boolean, isOneWay: boolean) {
        console.log('init');
        this.connection = new RTCMultiConnection();
      //  this.connection.dontCaptureUserMedia = true;

        if (document.querySelector('.stream_status') != null)
            document.querySelector('.stream_status').innerHTML = '';
        // this.connection.userid = this.userID;
        this.error = [];
        this.connection.socketURL = this.socketURL;
        this.connection.socketMessageEvent = 'video-broadcast-demo';
        this.connection.connectionDescription = {};
        this.connection.session = {
            audio: isAudio,
            video: isVideo,
            oneway: isOneWay
        };
        this.connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };
        this.initCallback();
    }
    // assign Memory to callback in app
    initCallback() {
        const self = this;
        this.connection.onUserStatusChanged = function (event) {
            if (event.status === 'online') {
                self.isUserOnline = true;
            } else {
                self.isUserOnline = false;
            }
        };
       
        this.connection.onstreamended = function (e) {
            self.removeStream();
        }

        this.connection.onmute = function (e) {
            let isOnline = self.appProvider.isOnline();
            if (!isOnline) {
                console.log('You are offline mute.');
                return false;
            }
            if (!self.isLiveStreamAvailable) {
                this.error['status'] = false;
                this.error['message'] = 'Unable to mute the stream.';
                return false
            }
            if (!e || !e.mediaElement) {
                return;
            }
            console.log('onmute ' + e.muteType);
            if (e.muteType === 'both' || e.muteType === 'video') {
                e.mediaElement.src = null;
                if (document.querySelector('.stream_status') != null)
                    document.querySelector('.stream_status').innerHTML = 'Paused';
                var paused = e.mediaElement.pause();
                if (typeof paused !== 'undefined') {
                    paused.then(function () {
                        e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
                    });
                } else {
                    e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
                }
            } else if (e.muteType === 'audio') {
                e.mediaElement.muted = true;
                if (document.querySelector('.stream_status') != null)
                    document.querySelector('.stream_status').innerHTML = 'Audio Paused';
            }
        }
        this.connection.onunmute = function (e) {
            let isOnline = self.appProvider.isOnline();
            if (!isOnline) {
                console.log('You are offline mute.');
                return false;
            }

            if (!self.isLiveStreamAvailable) {
                this.error['status'] = false;
                this.error['message'] = 'Unable to unmute the stream.';
                return false
            }
            if (self.isAppInBackGround) {
                return false;
            }

            if (!e || !e.mediaElement || !e.stream) {
                return;
            }
            if (e.unmuteType === 'both' || e.unmuteType === 'video') {
                e.mediaElement.poster = null;
                e.mediaElement.srcObject = e.stream;
                e.mediaElement.play();
            } else if (e.unmuteType === 'audio') {
                e.mediaElement.muted = false;
            }
            if (document.querySelector('.stream_status') != null)
                document.querySelector('.stream_status').innerHTML = '';
        }
        this.connection.onMediaError = function (error) {
            self.error['status'] = false;
            self.error['message'] = error;
        };
        this.connection.onerror = function (e) {
            self.error['status'] = false;
            self.error['message'] = e;
        };
        this.connection.onSessionClosed = function (e) {
            console.log('onsessionclosed ' + e.isSessionClosed);
            if (e.isSessionClosed) {
                self.removeStream();
                self.classClosed = true;
            }
        };
        this.connection.onfailed = function (event) {
            event.peer.renegotiate();
        };
        this.connection.onPeerStateChanged = function (state) {
            if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
                self.reJoin();
            }
        }

                this.connection.onstream = function (event) {
                    self.liveStream = event;
                    self.isLiveStreamAvailable = true;
        console.log('document.getElementById(event.streamid) '+ document.getElementById(event.streamid));
                    if (document.getElementById(event.streamid)) {
                        var existing = document.getElementById(event.streamid);
                        if (existing != undefined) {
                            existing.parentNode.removeChild(existing);
                        }

                        //Remove Draggable Element
                        var existing = document.getElementById(event.streamid);
                        if (existing != undefined) {
                            existing.parentNode.removeChild(existing);
                        }
                    }
                    self.createVideoElement();
                    self.streamDetails();
                }

        this.messageEventHandler();

    }

    // validatate the connection is live on socket
    findRoom(room_id: any) {
        console.log('findroom');
        const self = this;
        let promise = new Promise((resolve, reject) => {
            this.connection.checkPresence(room_id, function (isRoomExist) {
                console.log('isRoomExist ' + isRoomExist);
                if (!isRoomExist) {
                    self.roomClosedMsg();
                }
                resolve(isRoomExist);
            });
        });
        return promise;
    }

    // display stream in dom
    displayStream(htmlSelector: string) {
        console.log('displayStream');
        this.error = [];

        this.DOMhtmlSelector = htmlSelector;
        this.connection.videosContainer = document.getElementById(this.DOMhtmlSelector);
        // this.messageEventHandler();
        if (this.domAvailable()) {
            this.joinRoom();
        }

    }

    // join with live stream
    joinRoom() {
        const self = this;
        this.connection.checkPresence(self.roomID, function (isRoomExist) {
            console.log('isRoomExist ' + isRoomExist);
            if (isRoomExist) {
                self.connection.connectionDescription = {}; 
                self.connection.connectionDescription = self.connection.join(self.roomID);
                
                console.log('connectionDescription ' + JSON.stringify( self.connection.connectionDescription));
                return;
            } else {
                self.roomClosedMsg();
            }
        });
    }

    // dynamic create dom
    createVideoElement() {
        console.log('this.connection.videosContainer ' + this.connection.videosContainer);
        console.log('this.liveStream.userid ' + this.liveStream.userid);
        
        if (this.liveStream.userid == this.liveStream.sessionid) {
            console.log('getStatusFromInitiator ');
            setTimeout(function () {
                this.getStatusFromInitiator();
                // this.getStatusFromInitiatorForHandRaise();
            }, 1000);

            const video = document.createElement('video');
            try {
                video.setAttributeNode(document.createAttribute('autoplay'));
                video.setAttributeNode(document.createAttribute('playsinline'));
                video.setAttributeNode(document.createAttribute('controls'));
            } catch (e) {
                video.setAttribute('autoplay', '1');
                video.setAttribute('playsinline', '1');
                video.setAttribute('controls', '1');
            }
            video.srcObject = this.liveStream.stream;
            video.id = this.liveStream.streamid;

            if (this.domAvailable()) {
                let width = document.getElementById(this.DOMhtmlSelector).clientWidth;
                if (width <= 0) {
                    width = 400;
                }
                video.setAttribute('width', "'" + width + "'");


                document.getElementById(this.DOMhtmlSelector).appendChild(video);
            }
        }
    }

    // check initiator status
    // is something broadast by initiator 
    getStatusFromInitiator() {
        if (this.gotFirstTab == false) {
            setTimeout(function () {
                this.connection.send({ code: 'status', eventId: 'ready', is_broadcast: false }, this.connection.sessionid);
                this.getStatusFromInitiator();
            }, 1000)
        }
    }
    getStatusFromInitiatorForHandRaise() {
        this.connection.send({ code: 'status', eventId: 'ready', for: 'hand_raise', is_broadcast: false }, this.connection.sessionid);
    }

    messageEventHandler() {
        this.connection.onmessage = function (event) {

            if ((event.data.hasOwnProperty('tabId')) && (this.tab !== undefined) && (this.tab.id !== event.data.tabId)) {
                console.log('Active Tab id Not');

                this.showTab = this.tab.id;
                if (event.data.code == 'camera') {
                    console.log('in if camera');
                } else {
                    console.log('in else camera');
                }

                //  window.pauseAllMedia();
                try {
                    // find in tabs the tab id
                    // let tab = _.find(this.tabs, (tab) => { return tab.id == event.data.tabId });
                    let tab = undefined;
                    if (tab != undefined) {
                        this.tab = tab;
                    }
                    this.setActiveTab(event.data.tabId);

                    var tabType = this.tab.type;

                    switch (tabType) {
                        case "document":
                            // window.viewer = $("#screen_container" + lecture.tab.id).data('viewer');
                            let documentTab = document.getElementById('documentTab');
                            documentTab.setAttribute('viewer', '1');
                            this.reRenderPdf(this.tab.id);
                            console.log('document');
                            break;
                        case "whiteboard":
                            // window.whiteboard = $("#screen_container" + lecture.tab.id).data('whiteboard');
                            // window.reRenderWhiteboard();
                            console.log('whiteboard');
                            break;
                        case "youtube":
                            //window.resizeYTPlayer();
                            console.log('youtube');
                            break;
                        case "video":
                            console.log('video');
                            /// window.resizeVideoPlayer();
                            break;
                        case "camera":
                            console.log('camera');
                            // window.resetCameraHeight();
                            break;
                        default:
                            console.log("No tab type: " + tabType);
                            break;
                    }

                } catch (e) { console.log(e) };

            }

            if (event.data.is_broadcast) {
                console.log('________');
                console.log(event.data.is_broadcast + " is_broadcast");
                switch (event.data.code) {
                    case "youtube":
                        console.log('handleYoutubeEvents is_broadcast');
                        // this.handleYoutubeEvents(event.data);
                        break;
                    case "document":
                        console.log('handleYoutubeEvents is_broadcast');
                        this.handleDocumentEvents(event.data);
                        break;
                    case "whiteboard":
                        console.log('whiteboard is_broadcast');
                        // this.handleWhiteboardEvents(event.data);
                        break;
                    case "video":
                        console.log('video switch is_broadcast');
                        //  this.handleVideoEvents(event.data);
                        break;
                    case "status":
                        console.log('status is_broadcast');
                        // this.handleStatusEvents(event.data);
                        break;
                    case "chat":
                        console.log('chat is_broadcast');
                        // this.handleChatEvents(event.data);
                        //setconversationCount();
                        //setLeftbarChatCounter();
                        //document.getElementById('notificationSound').play();
                        // $('#noconver').hide();
                        break;
                    case "camera":
                        console.log('handleCameraEvents is_broadcast');
                        //this.handleCameraEvents(event.data);
                        break;
                    case "poll":
                        console.log('handlePollEvents is_broadcast');
                        //  this.handlePollEvents(event.data);
                        break;
                    case "layout":
                        console.log('handleLayoutEvents is_broadcast');
                        //  this.handleLayoutEvents(event.data);
                        break;
                    default:
                        console.log("Handle Layout is_broadcast" + event);
                        break;
                }
            } else {
                if (event.data.is_broadcast != undefined) {
                    this.gotFirstTab = true;
                }
                if (event.data.code == 'youtube' && (this.connection.userid == event.data.forUser)) {
                    console.log('else handleYoutubeEvents');
                    // this.handleYoutubeEvents(event.data);
                }
                if (event.data.code == 'video' && (this.connection.userid == event.data.forUser)) {
                    console.log('else handleVideoEvents');
                    //  this.handleVideoEvents(event.data);
                }
                if (event.data.code == 'document' && (this.connection.userid == event.data.forUser)) {
                    console.log('else handleDocumentEvents');
                    //  this.handleDocumentEvents(event.data);
                }
                if (event.data.code == 'whiteboard' && (this.connection.userid == event.data.forUser)) {
                    console.log('else handleWhiteboardEvents');
                    // this.handleWhiteboardEvents(event.data);
                }
                if (event.data.code == 'camera' && (this.connection.userid == event.data.forUser)) {
                    console.log('else handleCameraEvents');
                    //this.handleCameraEvents(event.data);
                }
                if (event.data.code == 'chat') {
                    console.log('else handlePChatEvents');
                    // if ((userID == event.data.message.sender.id) || (userID == event.data.message.recever.id)) {
                    //     lecture.handlePChatEvents(event.data);
                    //     setLeftbarChatCounter();
                    //     document.getElementById('notificationSound').play();
                    //     if (lecture.currentUser.length > 0) {
                    //         if (lecture.currentUser[0].id == event.data.message.sender.id) {
                    //             //set all unread message as read
                    //             readAllChat(event.data.message.sender.id);
                    //         }
                    //     } else {
                    //         setPersonalListingCount(event.data.message.sender.id);
                    //     }
                    // }
                }
                if (event.data.code == 'hand_raise') {
                    console.log('handle handleHandRaiseEvents');
                    // this.handleHandRaiseEvents(event.data);
                }
            }

        };

    }
    // show active tab only
    setActiveTab(id) {
        _.map(this.tabs, function (tab) {
            if (tab.id == id) {
                tab.isActive = true;
                return tab;
            } else {
                tab.isActive = false;
                return tab;
            }
        });
    }

    handleDocumentEvents(data) {
        console.log(data);
        if (data.eventId == 'added') {
            if (!this.tabExists(data.tabId)) {
                this.createDocumentViewer(data);
            }
        }

        if (data.eventId == 'scroll') {
            var element = document.getElementById("tab" + data.tabId);
            // var elm = $("#tab"+data.tabId);
            // elm.animate({
            //     scrollTop: data.top*(element.scrollHeight - element.offsetHeight)
            // }, 1);
        }

        if (data.eventId == 'pagechange') {
            let viewer = '';//$("#screen_container"+data.tabId).data('viewer');
            if (viewer == undefined) {
                var docData = {
                    code: 'document',
                    tabId: data.tab.id,
                    eventId: 'added',
                    url: data.tab.url,
                    filename: data.tab.filename
                }
                this.handleDocumentEvents(docData);
            }
            // else{
            //     if(data.hasOwnProperty('drawing')){
            //         window.viewer.onPageChange(data.page, data.drawing);
            //     }else{
            //         $.getJSON(BASE_URL+'/'+data.url, function(response) {

            //             window.viewer.onPageChange(response.page, response.drawing);                        
            //         });
            //     }
            //     if(data.top != undefined){
            //         var element = document.getElementById("tab"+data.tabId);
            //         var elm = $("#tab"+data.tabId);
            //         elm.animate({
            //             scrollTop: data.top*(element.scrollHeight - element.offsetHeight)
            //         }, 1);
            //     }
            // }
        }

        if (data.eventId == 'firststatus') {
            //window.viewer = $("#screen_container"+data.tabId).data('viewer');
            let viewer = '';//$("#screen_container"+data.tabId).data('viewer');
            if (viewer == undefined) {
                var docData = {
                    code: 'document',
                    tabId: data.tab.id,
                    eventId: 'added',
                    url: data.tab.url,
                    filename: data.tab.filename
                }
                this.handleDocumentEvents(docData);
            } else {
                if (data.top != undefined) {
                    var element = document.getElementById("tab" + data.tabId);
                    // var elm = $("#tab"+data.tabId);
                    // elm.animate({
                    //     scrollTop: data.top*(element.scrollHeight - element.offsetHeight)
                    // }, 1);
                }
                if (data.hasOwnProperty('drawing')) {
                    //window.viewer.onFirstStatus(data.page, data.drawing, data.drawings, data.color);
                } else {
                    // $.getJSON(BASE_URL+'/'+data.url, function(response) {

                    //     window.viewer.onFirstStatus(response.page, response.drawing, response.drawings, response.color);                        
                    // });
                }
            }
        }

        if (data.eventId == 'drawing') {
            // window.viewer.myp.drawing = data.drawing;
            // window.viewer.myp.drag = [];
        }

        if (data.eventId == 'drawing-stopped') {
            // window.viewer.myp.drawingStopped();
        }

        if (data.eventId == 'dragged') {
            // window.viewer.myp.mDragged(data.coordinates);
        }

        if (data.eventId == 'color') {
            // window.viewer.myp.changeColor(data.color);
        }

        if (data.eventId == 'clear') {
            //  window.viewer.myp.clearDrawing(data.page);           
        }

        if (data.eventId == 'undo') {
            //  window.viewer.myp.undo(data.index);           
        }
    }

    tabExists(tabId) {

        // let tabsObject = this.tabs;
        // let index = tabsObject.filter(function (tab) {
        //     return tab.id == tabId;
        // });
        // console.log('tabExists ' + index);
        // if (index) {
        //     return true;
        // } else {
        //     return false;
        // }

        let index = _.findIndex(this.tabs, function (tab) { return tab.id == tabId });
        if (index < 0) {
            return false
        } else {
            //$('.nav-tabs a[href="#tab'+tabId+'"]').tab('show');
            return true;
        }
    }

    initializePdf(path, tabId) {

        let pdfHtml = '<div id="main' + tabId + '"  style="position:relative;"><div class="pdf_viewer"><canvas id="document' + tabId + '" width="100%"></canvas></div></div>';
        let activeTabs = document.getElementById('screen_container' + tabId);
        activeTabs.innerHTML += pdfHtml;

        this.pdf_viewer = new PdfViewer(path, tabId);
        let dataArray = { tabId: this.pdf_viewer };
        this.saved_documents.push(dataArray);



    }
    createDocumentViewer(data) {
        this.createNewTab(data.filename, data.tabId).then(function (tabId) {

            this.tab = { 'id': tabId, 'type': 'document', 'url': data.url, 'isActive': false, 'tabName': data.filename };
            this.tabs.push(this.tab);
            this.setActiveTab(tabId);

            this.initializePdf(data.url, tabId);
            // $('#tab'+tabId).data('type','document');
            this.checkNoDataShared();
        });
    }
    checkNoDataShared() {
        if (this.tabs.length >= 1) {
            this.no_content = '';
        } else {
            this.no_content = 'No content shared.';
        }
    }
    createNewTab(name, tabId) {

        let promise = new Promise((resolve, reject) => {

            let isTabCreated = document.getElementById("tab" + tabId);
            if (isTabCreated == null) {

                // create the new view here in hidden for futher reference
                let filename = name.length > 10 ? name.substring(0, 10) + '..' : name;
                let tabInput = '<input type="hidden" id="tab' + tabId + '" value="' + filename + '">';
                let activeTabs = document.getElementById('activeTabs');
                activeTabs.innerHTML += tabInput;

                let html_div = '<div class="tab-pane fade in active iframe" id="tab' + tabId + '" data-id="' + tabId + '" style="width:100%;"><div id="screen_container' + tabId + '" class="screen_container"></div></div>';
                document.getElementById('documents').innerHTML = html_div;

            }


            //hideAllTabs();
            resolve(tabId);
        });
        return promise;
    }

    // reRenderPdf(tabId) {

    //     if (!$('a[href="#tab' + tabId + '"]').hasClass('rendered')) {
    //         console.log('rendering 1st time');
    //         $('a[href="#tab' + tabId + '"]').addClass('rendered');
    //         var canvasWidth = $("#tab-content").outerWidth() - 10;
    //         $(`#document${tabId}`).attr('width', canvasWidth);
    //         $(`#screen_container${tabId} > #WACStatusBarContainer`).css('width', canvasWidth);


    //         window.viewer.reRenderPage();
    //     } else {
    //         console.log('rendered');
    //     }

    // }

    // Delete video element from dom
    removeStream(htmlSelector?: string) {
        if (!htmlSelector) {
            this.connection.videosContainer = document.getElementById(this.DOMhtmlSelector);
        }
        console.log('this.isLiveStreamAvailable ' + this.isLiveStreamAvailable);
        let isOnline = this.appProvider.isOnline();
        if (isOnline && !this.isLiveStreamAvailable && document.querySelector('.stream_status')) {
            console.log('this.roomID something ' + this.roomID);
            let self = this;
            this.connection.checkPresence(self.roomID, function (isRoomExist) {
                console.log('isRoomExist1 ' + isRoomExist);
                if (!isRoomExist) {
                    if (document.querySelector('.stream_status') != null)
                        document.querySelector('.stream_status').innerHTML = 'Class has been closed by teacher.';
                } else {
                    console.log('document.querySelector ' + document.querySelector('.stream_status'));
                    if (document.querySelector('.stream_status') != null)
                        document.querySelector('.stream_status').innerHTML = 'Something went wrong.';
                }
            });

        }
        console.log('tisOnline ? ' + isOnline);
        if (!this.isLiveStreamAvailable) {
            console.log('isOnline');
            return false;
        }
        this.isLiveStreamAvailable = false;
        this.classClosed = false;
        if (isOnline) {
            this.findRoom(this.roomID);
        }


        //this.rejoinButton = 'block';
        if (!this.connection.videosContainer) {
            this.error['status'] = false;
            this.error['message'] = 'Please provide the valid HTML selector.';
            return false;
        }

        let mediaElement = document.getElementById(this.liveStream.streamid);
        if (mediaElement) {
            console.log('mediaElement');
            mediaElement.parentNode.removeChild(mediaElement);
        }
        this.liveStream = '';
        console.log('connection');
        let videosContainer = this.connection.videosContainer;
        if (videosContainer) {
            if (videosContainer.childNodes.length > 0) {
                while (videosContainer.hasChildNodes()) {
                    videosContainer.removeChild(videosContainer.firstChild); console.log('videosContainer while');
                } console.log('videosContainer');
            }
        }
        if (this.connection.connectionDescription.remoteUserId != undefined) {
            if (!this.connection.peers[this.connection.connectionDescription.remoteUserId]) { console.log('remoteUserId'); this.connection = {}; return; }
            this.connection.peers[this.connection.connectionDescription.remoteUserId].peer.close(); console.log('peer');
        }
    }
    forceToCloseTimer() {
        this.isLiveStreamAvailable = false;
        this.classClosed = false;
        this.roomID = '';
        this.connection = {};
    }
    // mute class
    mute() {
        this.isAppInBackGround = true;
        let isOnline = this.appProvider.isOnline();
        if (!isOnline) {
            console.log('You are offline mute.');
            return false;
        }
        if (this.isLiveStreamAvailable) {
            //  dom is present
            var vid = document.querySelector('video'); console.log('vid ' + vid);
            if (vid != null) {
                vid.muted = true;
                if (this.liveStream.streamid != undefined)
                    this.connection.streamEvents[this.liveStream.streamid].stream.mute('audio');
            }
        } else {
            this.error['status'] = false;
            this.error['message'] = 'Unable to mute the stream.';
        }
    }
    // unmute class
    unmute() {
        if (!this.isAppInBackGround) {
            return false;
        }
        this.isAppInBackGround = false;
        let isOnline = this.appProvider.isOnline();
        if (!isOnline) {
            console.log('You are offline mute.');
            return false;
        }
        if (this.isLiveStreamAvailable) {
            //  dom is present
            var vid = document.querySelector('video'); console.log('vid resume' + vid);
            if (vid != null) {
                vid.muted = false;
                if (this.liveStream.streamid != undefined)
                    this.connection.streamEvents[this.liveStream.streamid].stream.unmute('audio');
            }
        } else {
            this.error['status'] = false;
            this.error['message'] = 'Unable to unmute the stream.';
        }
    }



    //rejoin the user
    reJoin() {
        console.log('rejoin');
        if (document.getElementById(this.DOMhtmlSelector) == null) {// if no dom available
            this.removeStream();
            console.log('no dom');
            return false;
        }
        let isOnline = this.appProvider.isOnline();
        if (!isOnline) {
            console.log('You are offline.');
            if (document.querySelector('.stream_status'))
                document.querySelector('.stream_status').innerHTML = 'You are offline.';
            this.removeStream();
            return false;
        }
        if (this.connection.sessionid != undefined && this.connection.peers[this.connection.sessionid] != undefined) {
            console.log('this.connection.peers[this.connection.sessionid] ' + this.connection.peers[this.connection.sessionid]);
            if (this.connection.peers[this.connection.sessionid] == undefined) {
                this.classClosed = true;
                this.removeStream();
                return false;
            }

            let videosContainer = this.connection.videosContainer;
            if (videosContainer == undefined) {
                return false;
            }
            if (videosContainer.childNodes.length == 0) {
                if (document.querySelector('.stream_status') != null)
                    document.querySelector('.stream_status').innerHTML = 'Please wait!!! Reconnecting with class.';
                console.log('rejoin 1');
                this.connection.rejoin(this.connection.connectionDescription);
                setTimeout(() => {
                    if (document.querySelector('.stream_status') != null)
                        document.querySelector('.stream_status').innerHTML = '';
                }, 2000);
            }
        } else {
            console.log('this.DOMhtmlSelector ' + this.DOMhtmlSelector);
            //reinitialize the data
            if (document.getElementById(this.DOMhtmlSelector) != null && isOnline) {
                console.log('reinitialize');
                this.init(true, true, true);
                this.displayStream(this.DOMhtmlSelector);
            } else { console.log('reinitialize else'); this.removeStream(); }
        }
    }
    // get the stream details
    streamDetails() {
        let streamDetails = [];
        if (this.liveStream.streamid) {
            streamDetails['streamid'] = this.liveStream.streamid;
            streamDetails['streamtype'] = this.liveStream.type;
            streamDetails['stream'] = this.liveStream.stream;
            streamDetails['mediaElement'] = this.liveStream.mediaElement;
            streamDetails['mediaElementType'] = this.liveStream.mediaElement.nodeName.toLowerCase();
            streamDetails['isInitiator'] = this.liveStream.userid == this.connection.userid ? true : false;
            streamDetails['isScreen'] = this.liveStream.isScreen || this.liveStream.stream.isScreen;
        }
        console.log('streamDetails ' + JSON.stringify(streamDetails));
        return streamDetails;
    }
    // set bandwidth for video 
    setBandwidth(audioBandwidth: number, videoBandWidth: number, screenBandwidth: number) {
        this.connection.bandwidth = {
            audio: audioBandwidth,
            video: videoBandWidth,
            screen: screenBandwidth
        };
    }

    // set video stream width
    setVideoWidth(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number, minFrameRate: number) {
        this.connection.mediaConstraints.mandatory = {
            minWidth: minWidth,
            maxWidth: maxWidth,
            minHeight: minHeight,
            maxHeight: maxHeight,
            minFrameRate: 30
        };
    }

    //set video quality
    setVideoQuality(width: number, height: number) {

        var width = width || 1280;
        var height = height || 720;

        var supports = navigator.mediaDevices.getSupportedConstraints();
        var constraints = {};
        if (supports.width && supports.height) {
            constraints = {
                width: width,
                height: height
            };
        }
        this.connection.applyConstraints({
            video: constraints
        });
    }

    // remove user from the stream
    revokeUser() {
        this.connection.leave();
    }
    closeSocket() {
        this.connection.closeSocket();
    }
    connectSocket() {
        const self = this;
        this.connection.connectSocket(function () {
            console.log('Successfully connected to socket.io server.');

            self.connection.socket.emit('howdy', 'hello');
        });
    }
    userStatus() {
        return this.isUserOnline;
    }
    errorLog() {
        console.log(this.error);
    }

    domAvailable() {
        if (document.getElementById(this.DOMhtmlSelector) != null) { // dom available
            return true;
        } else {
            return false;
        }
    }

    roomClosedMsg() {

        if (document.querySelector(this.errorQuerySelector) != null) { // dom available

            document.querySelector(this.errorQuerySelector).innerHTML = '';// remove error message

            if (document.querySelector(this.errorQuerySelector).innerHTML != this.classCloseMsg)
                document.querySelector(this.errorQuerySelector).innerHTML = this.classCloseMsg;
        }
    }
}

