import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  addGame(selected): Observable<HttpResponse<any>> {
    return this.http.post('http://localhost:8090/addgame', selected, {observe: 'response'});
  }

  reportThrow(throwData: string): Observable<HttpResponse<any>> {
    return this.http.post('http://localhost:8090/reportthrow', throwData , {observe: 'response'});
  }

  reportGame(gameData: string): Observable<HttpResponse<any>> {
    return this.http.post('http://localhost:8090/reportgame', gameData , {observe: 'response'});
  }

}
