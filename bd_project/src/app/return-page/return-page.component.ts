import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-return-page',
  templateUrl: './return-page.component.html',
  styleUrls: ['./return-page.component.css']
})
export class ReturnPageComponent implements OnInit {

  constructor(private http: HttpClient) { }

  data: any;
  book: any;

  ngOnInit() {
    this.book = null
    this.data = null
  }


  return() {
    const input = document.getElementById('numberInput') as HTMLInputElement;
    const _id = input.value;
    console.log(_id)
    this.http.post('/api/return/' + _id, {}).subscribe(
        (response) => {
          console.log(response);
        },
        (error) => {
          if (error.statusText == 'OK') {
            alert('Książka została zwrócona!')
          }
          else {
            alert('Wystąpił błąd: ' + error.error)
            console.log(error)
          }
        });
  };

  checkStatus() {
      const input = document.getElementById('statusInput') as HTMLInputElement;
      const _id = input.value;
      this.http.get<any[]>('/api/checkStatus/' + _id, {}).subscribe((data) => {
        this.data = data;
        this.book = this.data.borrowedBook;
        console.log(this.book)
        console.log(this.data)
        if (this.book == null) {
          alert('Egzemplarz jest w bibliotece!')
        }
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
