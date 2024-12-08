// modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { SurveyModule } from "survey-angular-ui";
import { EncloseModule } from '../modules/enclose.module';
import { FuzzyModule } from '../modules/fuzzy.module';
import { WiggleModule } from '../modules/wiggle.module';
import { SaturateModule } from '../modules/saturate.module';

// handlers
import { ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from '../services/error.service';

// components
import { AppComponent } from './app.component';
import { SurveyComponent  } from '../components/survey/survey.component';
import { CustomEncloseQuestionComponent } from '../components/enclose/enclose.question';
import { CustomFuzzyQuestionComponent } from '../components/fuzzy/fuzzy.question';
import { CustomWiggleQuestionComponent } from '../components/wiggle/wiggle.question';
import { CustomSaturateQuestionComponent } from '../components/saturate/saturate.question';
import { ErrorComponent } from '../components/error/error.component';
@NgModule({
  declarations: [
    AppComponent,
    SurveyComponent,
    CustomEncloseQuestionComponent,
    CustomFuzzyQuestionComponent,
    CustomSaturateQuestionComponent,
    CustomWiggleQuestionComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    SurveyModule,
    EncloseModule,
    FuzzyModule,
    WiggleModule,
    SaturateModule
  ],
  providers: [{
    provide: ErrorHandler,
    useClass: GlobalErrorHandler
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
