import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WiggleComponent } from '../components/wiggle/wiggle.component';

@NgModule({
    declarations: [
        WiggleComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        WiggleComponent
    ]
})
export class WiggleModule { }