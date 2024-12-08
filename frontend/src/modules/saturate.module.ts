import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaturateComponent } from '../components/saturate/saturate.component';

@NgModule({
    declarations: [
        SaturateComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SaturateComponent
    ]
})
export class SaturateModule { }