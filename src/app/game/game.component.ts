import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { PlayersService } from '../players/players.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  players: any;

  constructor(private gameService: GameService, private playersService: PlayersService) { }

  ngOnInit(): void {
  }

  prepareGame(): void {
    this.playersService
      .getAllPlayers()
      .toPromise()
      .then((resp) => {
        if (resp.status === 200) {
          console.log(resp.body);
          this.players = resp.body;
        }
      });
  }

  newGame(): void {
    this.gameService
    .newGame()
    .toPromise()
    .then((resp) => {
      console.log('YES! startGame');
    })
    .catch((resp) => {
      console.log('NO! startGame');
    });
  }

}
