import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuzzyComponent } from '../components/fuzzy/fuzzy.component';

@NgModule({
    declarations: [
        FuzzyComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        FuzzyComponent
    ]
})
export class FuzzyModule { }