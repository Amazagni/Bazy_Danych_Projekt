import { DatabaseService } from './../database.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css']
})
export class HistoryPageComponent implements OnInit {

  userId: string = '6460d1e3ac388251224c672f';
  data: any;
  users: any[] = [];
  user:any;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('/api/userData').subscribe((data) => {
      this.data = data;
      this.user = this.data.userData[0];
    });
  }

  formatDate(dateString: string) {
    if (dateString == null) {
      return "Wypożyczona"
    }
    const date = new Date(dateString);
    const formattedDate = `${date.getUTCDate()}-${date.getUTCMonth() + 1}-${date.getUTCFullYear()}`;
    return formattedDate;
  };
}


