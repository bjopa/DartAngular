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
        console.log(resp);
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
      console.log('REMOVED1');
      if (resp.status === 200) {
        console.log('REMOVED2');
      }
    }).catch(() => {
      console.log('ERROR deleting');
    });
    this.getAllPlayers();
  }

  addPlayer(): void {
    this.playerToAdd = this.firstname + '-' + this.lastname + '-' + this.nickname;
    this.playersService
    .addPlayer(this.playerToAdd)
    .toPromise()
    .then(() => {
      console.log('ADDED');
    }).catch(() => {
      console.log('ERROR adding');
    });
    this.getAllPlayers();
    this.closeForm();
    this.firstname = '';
    this.lastname = '';
    this.nickname = '';
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
