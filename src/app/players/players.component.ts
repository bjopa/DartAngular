import { Component, OnInit } from '@angular/core';
import { PlayersService } from './players.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
})
export class PlayersComponent implements OnInit {
  players: any;
  firstname: string;
  lastname: string;
  nickname: string;
  playerToAdd: string;

  constructor(private playersService: PlayersService) {}

  ngOnInit(): void {
    this.getAllPlayers();
  }

  getAllPlayers(): void {
    this.playersService
      .getAllPlayers()
      .toPromise()
      .then((resp) => {
        console.log(resp.status);
        if (resp.status === 200) {
          console.log('Players fetched');
          this.players = resp.body;
        }
      });
  }

  deletePlayer(nickname: string): void {
    this.playersService
    .deletePlayer(nickname)
    .toPromise()
    .then((resp) => {
      console.log(resp.status);
      this.getAllPlayers();
    }).catch((e) => {
      console.log('ERROR deleting - ', e);
    });
  }

  addPlayer(): void {
    this.playerToAdd = this.firstname + '-' + this.lastname + '-' + this.nickname;
    this.playersService
    .addPlayer(this.playerToAdd)
    .toPromise()
    .then((resp) => {
      console.log(resp.status);
      this.getAllPlayers();
      this.closeForm();
      this.firstname = '';
      this.lastname = '';
      this.nickname = '';
    }).catch((e) => {
      console.log('ERROR adding - ', e);
    });
  }

  openForm() {
    document.getElementById('myForm').style.display = 'block';
    document.getElementById('dimmer').style.display = 'block';
  }

  closeForm() {
    document.getElementById('myForm').style.display = 'none';
    document.getElementById('dimmer').style.display = 'none';
  }

}
