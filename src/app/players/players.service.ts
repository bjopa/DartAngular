import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  constructor(private http: HttpClient) {
  }

  getAllPlayers(): Observable<HttpResponse<any>> {
    return this.http.get('http://localhost:8090/getallplayers', { observe: 'response' });
  }

  addPlayer(player: any): Observable<HttpResponse<any>> {
    return this.http.post('http://localhost:8090/regplayer', player, { observe: 'response' });
  }

}
