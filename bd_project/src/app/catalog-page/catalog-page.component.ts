import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.css']
})
export class CatalogPageComponent implements OnInit {

  data: any;
  books: any[] = [];
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get<any[]>('/api/data').subscribe((data) => {
      this.data = data;
      this.books = this.data.bookData;
      console.log(this.books);
    });
  }

  borrow(_id: string) {
    {
      this.http.post('http://localhost:3080/borrow/' + _id, {}).subscribe(
        (response) => {
          console.log(response);
          console.log("dziala!")
          // Tutaj możesz obsłużyć odpowiedź z serwera po udanej zmianie ilości danych książek
        },
        (error) => {
          if (error.statusText == 'OK') {
            alert('Książka została wypożyczona!')
          }
          else {
            alert('Wystąpił błąd: ' + error.error)
            console.log(error)
          }
          // Tutaj możesz obsłużyć błąd związany z żądaniem HTTP
        });

    }
  }
}
