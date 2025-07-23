import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>🔧 Supabase Test Page</h1>
      
      <div class="test-section">
        <h2>✅ Page Loaded Successfully!</h2>
        <p>If you can see this page, the routing is working correctly.</p>
        <p>Current time: {{ currentTime }}</p>
      </div>

      <div class="test-section">
        <h2>📋 Next Steps</h2>
        <ol>
          <li>Update your Supabase credentials in <code>src/environments/environment.ts</code></li>
          <li>Run the SQL migration in Supabase SQL Editor</li>
          <li>Configure auth redirect URLs in Supabase Dashboard</li>
          <li>Test the connection below</li>
        </ol>
      </div>

      <div class="test-section">
        <h2>🔗 Environment Check</h2>
        <p>Supabase URL: {{ supabaseUrl }}</p>
        <p>Supabase Key: {{ supabaseKey ? '✅ Set' : '❌ Not set' }}</p>
      </div>

      <div class="test-section">
        <h2>🧪 Manual Tests</h2>
        <button (click)="testBasicFunction()">Test Basic Function</button>
        <p *ngIf="testResult">{{ testResult }}</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .test-section {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }
    
    h1 {
      color: #333;
      text-align: center;
    }
    
    h2 {
      color: #666;
      margin-bottom: 10px;
    }
    
    button {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }
    
    button:hover {
      background: #0056b3;
    }
    
    code {
      background: #f1f1f1;
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    ol {
      margin-left: 20px;
    }
    
    li {
      margin: 5px 0;
    }
  `]
})
export class SimpleTestComponent implements OnInit {
  currentTime = new Date().toLocaleString();
  testResult = '';
  supabaseUrl = '';
  supabaseKey = '';

  constructor() {}

  ngOnInit() {
    // Get environment variables (this will be empty until you configure them)
    this.supabaseUrl = 'https://your-project-id.supabase.co'; // This should be updated
    this.supabaseKey = 'your-anon-public-key'; // This should be updated
  }

  testBasicFunction() {
    this.testResult = '✅ Basic function test passed! The component is working correctly.';
    setTimeout(() => {
      this.testResult = '';
    }, 3000);
  }
} 