//Modules
import { NgModule } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy, IonRouterOutlet } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';

import { AuthService } from './services/auth.service';
import { WeightService } from './services/weight.service';
import { AuthGuard } from './guards/auth.guard';

import { RecipesResolver, MeasuresResolver, IngredientsResolver, UnitsResolver } from './resolvers/resolvers';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatPaginatorIntlFr } from './weight/list-measures/MatPaginatorIntlFr';
import { MAT_DATE_LOCALE } from '@angular/material/core';

import { MatButtonModule } from '@angular/material/button';
import { IonicGestureConfig } from './utils/IonicGestureConfig';
import { Camera } from '@ionic-native/camera/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file/ngx';

firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
    Camera,
    File,
    IngredientsResolver,
    MeasuresResolver,
    RecipesResolver,
    StatusBar,
    SplashScreen,
    UnitsResolver,
    WeightService,
    WebView,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: MatPaginatorIntl, useClass: MatPaginatorIntlFr},
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
