import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})

export class HomePageComponent implements OnInit {

  data: any;
  authors: any[] = [];
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('/api/authorsData').subscribe((data) => {
      this.data = data;
      this.authors = this.data.authorsData;
      console.log(this.authors)
    });
  }
}
