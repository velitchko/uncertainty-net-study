import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EncloseComponent } from '../components/enclose/enclose.component';
import { SaturateComponent } from '../components/saturate/saturate.component';
import { WiggleComponent } from '../components/wiggle/wiggle.component';
import { FuzzyComponent } from '../components/fuzzy/fuzzy.component';
import { SurveyComponent } from '../components/survey/survey.component';

const routes: Routes = [
  { path: 'enclose', component: EncloseComponent },
  { path: 'saturate', component: SaturateComponent },
  { path: 'wiggle', component: WiggleComponent },
  { path: 'fuzzy', component: FuzzyComponent },
  { path: 'survey', component: SurveyComponent },
  { path: '**', redirectTo: 'survey' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
