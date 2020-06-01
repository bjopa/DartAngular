import { Component, OnInit } from '@angular/core';
import { PlayersService } from './players.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
})
export class PlayersComponent implements OnInit {
  players: any;

  constructor(private playersService: PlayersService) {}

  ngOnInit(): void {
    this.getAllPlayers();
  }

  getAllPlayers(): void {
    this.playersService
      .getAllPlayers()
      .toPromise()
      .then((resp) => {
        if (resp.status === 200) {
          this.players = resp.body;
        }
      });
  }

  removePlayer(player: any): void {

  }

  addPlayer(): void {
    alert('Player Added');
    this.closeForm();
  }

  openForm() {
    document.getElementById('myForm').style.display = 'block';
  }

  closeForm() {
    document.getElementById('myForm').style.display = 'none';
  }

}
