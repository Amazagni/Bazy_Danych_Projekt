import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-return-page',
  templateUrl: './return-page.component.html',
  styleUrls: ['./return-page.component.css']
})
export class ReturnPageComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }


  return() {
    const input = document.getElementById('numberInput') as HTMLInputElement;
    const _id = input.value;
    console.log(_id)
    this.http.post('http://localhost:3080/return/' + _id, {}).subscribe(
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
  }
}
