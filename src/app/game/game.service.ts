import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  newGame(): Observable<HttpResponse<any>> {
    return this.http.get('http://localhost:8090/newgame', {observe: 'response'});
  }


}
