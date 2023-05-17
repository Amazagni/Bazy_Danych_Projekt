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
    this.http.get<any[]>('/api/data').subscribe((data) => {
      this.data = data;
      this.users = this.data.userData;
      this.user = this.users.find((u) => u._id === this.userId);
      console.log(this.user);
    });
  }

}
