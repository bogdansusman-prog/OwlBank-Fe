import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-statements',
  imports: [
    RouterLink,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './statements.html',
  styleUrl: './statements.css'
})
export class Statements {

  fromDate = '';
  toDate = '';

  transactionType = 'all';

}