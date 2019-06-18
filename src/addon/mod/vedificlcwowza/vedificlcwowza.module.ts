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
import { AddonModVedificlcwowzaModuleHandler } from '@addon/mod/vedificlcwowza/providers/module-handler';
import { AddonModVedificlcwowzaProvider } from '@addon/mod/vedificlcwowza/providers/lecture';
import { CoreContentLinksDelegate } from '@core/contentlinks/providers/delegate';
import { AddonModVedificlcwowzaIndexLinkHandler } from './providers/index-link-handler';
// List of providers (without handlers).
export const ADDON_MOD_VEDIFICLCWOWZA_PROVIDERS: any[] = [
    AddonModVedificlcwowzaProvider
];

@NgModule({
    declarations: [
    ],
    imports: [
       
    ],
    providers: [
        AddonModVedificlcwowzaProvider,
        AddonModVedificlcwowzaModuleHandler,
        AddonModVedificlcwowzaIndexLinkHandler
    ]
})
export class AddonModVedificlcwowzaModule {
    constructor(moduleDelegate: CoreCourseModuleDelegate,moduleHandler: AddonModVedificlcwowzaModuleHandler,
        contentLinksDelegate: CoreContentLinksDelegate, linkHandler: AddonModVedificlcwowzaIndexLinkHandler) {
                moduleDelegate.registerHandler(moduleHandler);
                contentLinksDelegate.registerHandler(linkHandler);
        
    }
}
