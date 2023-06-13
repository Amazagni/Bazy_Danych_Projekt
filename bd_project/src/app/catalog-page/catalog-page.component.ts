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
    this.http.get<any[]>('/api/bookData').subscribe((data) => {
      this.data = data;
      this.books = this.data.bookData;
      console.log(this.books)
    });
  }

  borrow(_id: string) {
    {
      this.http.post('/api/borrow/' + _id, {}).subscribe(
        (response) => {
        },
        (error) => {
          if (error.statusText == 'OK') {
            alert('Książka została wypożyczona!')
          }
          else {
            alert('Wystąpił błąd: ' + error.error)
            console.log(error)
          }
        });

    }
  }

  capitalizeName(name: string): string {
    name = name.toLowerCase()
    const [firstName, lastName] = name.split(' ');
    const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const capitalizedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    return capitalizedFirstName + '_' + capitalizedLastName;
  }

  find() {
    const input = document.getElementById('numberInput') as HTMLInputElement;
    let _id = input.value;
    if (_id == '') {
      this.http.get<any[]>('/api/bookData').subscribe((data) => {
        this.data = data;
        this.books = this.data.bookData;
      });
    }
    else {
      _id = this.capitalizeName(_id)
      this.http.get<any[]>('/api/bookByAuthor/' + _id, {}).subscribe((data) => {
        this.data = data;
        this.books = this.data.bookData;
      });
    }
    // this.http.post('/api/return/' + _id, {}).subscribe(
    //     (response) => {
    //       console.log(response);
    //     },
    //     (error) => {
    //       if (error.statusText == 'OK') {
    //         alert('Książka została zwrócona!')
    //       }
    //       else {
    //         alert('Wystąpił błąd: ' + error.error)
    //         console.log(error)
    //       }
    //     });
  }
}
