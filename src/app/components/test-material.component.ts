import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-test-material',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div style="padding: 20px;">
      <h2>Angular Material Test</h2>
      <button mat-raised-button color="primary">Primary Button</button>
      <button mat-button color="accent">Accent Button</button>
    </div>
  `
})
export class TestMaterialComponent {} 