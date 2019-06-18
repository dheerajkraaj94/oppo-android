// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { NgModule } from '@angular/core';
import { CoreCourseModuleDelegate } from '@core/course/providers/module-delegate';
import { AddonModVedificVCModuleHandler } from '@addon/mod/vedificvc/providers/module-handler';
import { AddonModVedificVCProvider } from '@addon/mod/vedificvc/providers/lecture';
import { CoreContentLinksDelegate } from '@core/contentlinks/providers/delegate';
import { AddonModVedificVCIndexLinkHandler } from './providers/index-link-handler';
//import { AddonModLiveClassProvider } from '@addon/mod/vedificvc/providers/liveclass';
// List of providers (without handlers).
export const ADDON_MOD_VEDIFICVC_PROVIDERS: any[] = [
    AddonModVedificVCProvider
];

@NgModule({
    declarations: [
    ],
    imports: [
       
    ],
    providers: [
        AddonModVedificVCProvider,
        AddonModVedificVCModuleHandler,
        AddonModVedificVCIndexLinkHandler
     //   AddonModLiveClassProvider
    ]
})
export class AddonModVedificVCModule {
    constructor(moduleDelegate: CoreCourseModuleDelegate,moduleHandler: AddonModVedificVCModuleHandler,
        contentLinksDelegate: CoreContentLinksDelegate, linkHandler: AddonModVedificVCIndexLinkHandler) {
                moduleDelegate.registerHandler(moduleHandler);
                contentLinksDelegate.registerHandler(linkHandler);
        
    }
}
