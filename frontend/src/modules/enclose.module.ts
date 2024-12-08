import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncloseComponent } from '../components/enclose/enclose.component';

@NgModule({
    declarations: [
        EncloseComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        EncloseComponent
    ]
})
export class EncloseModule { }