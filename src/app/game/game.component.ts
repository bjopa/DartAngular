import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';
import { PlayersService } from '../players/players.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  name = 'playerList'; // bindlabel in game.html

  players: any; // to save fetched playerdata from db

  targets = ['19', 'Double', '18', 'Triple', '17', '41', '20', 'Bulls Eye']; // round targets
  currentTarget = ''; // read from targets[]

  dartNumber = 1; // total dartnumber (1-24)
  arrowsLeft = 3; // remaining darts in round (3-1)
  roundNo = 1; // round tracker

  singleScore = 0; // score for single dart
  roundScore = 0; // score for three darts in round
  hitCounter = 0; // count no of hits per round (1-3)

  currentGameId = ''; // game number in db

  fullPlayerList = []; // all players available for selection
  selected = []; // selected players from full
  currentPlayerNick = ''; // current players nick
  currentPlayerCounter = 0; // index of current player
  numberOfPlayers = 0; // total no of players in game

  constructor(
    private gameService: GameService,
    private playersService: PlayersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    document.getElementById('selector').style.display = 'grid'; // block
    document.getElementById('gameboard').style.display = 'none'; // none
    this.getPlayers();
  }

  getPlayers(): void {
    this.playersService
      .getAllPlayers()
      .toPromise()
      .then((resp) => {
        if (resp.status === 200) {
          this.players = resp.body;
          console.log(this.players);
        }
      })
      .then(() => {
        this.addPlayersToSelection();
      });
  }

  addPlayersToSelection(): void {
    let i = 1;
    this.fullPlayerList = []; // Behövs för att kunna läsa in
    this.players.forEach((player) => {
      this.fullPlayerList.push(player.nickname);
    });
  }

  initGame(): void {
    if (this.selected.length >= 1) {
      if (
        window.confirm('Start game with ' + this.selected.length + ' players?')
      ) {
        this.addGame(this.selected);
        this.currentTarget = this.targets[0];
        this.currentPlayerNick = this.selected[this.currentPlayerCounter];
        this.numberOfPlayers = this.selected.length;
        this.selected.forEach((nick) => {
          localStorage.setItem(nick, '0');
        });
      }
    } else {
      alert('Please select a minimum of 2 players');
    }
  }

  addGame(selected): void {
    document.getElementById('selector').style.display = 'none';
    document.getElementById('gameboard').style.display = 'grid';
    this.gameService
      .addGame(selected)
      .toPromise()
      .then((resp) => {
        this.currentGameId = resp.body;
        console.log('New GameId: ' + this.currentGameId);
      })
      .catch((resp) => {
        console.log('game.components => addGame: failed');
      });
  }

  /**
   * GAMELOGIC BELOW
   */

  dartThrown(hit: string) {
    if (window.confirm('Confirm hit on ' + hit)) {
      // test
      this.dartNumber = this.roundNo + (2 * (this.roundNo - 1)) + (3 - this.arrowsLeft);
      // minska kvarvarande antal pilar
      this.arrowsLeft--;
      // poängräkning en pil och summering per runda
      switch (hit.substring(0, 1)) {
        case 'S':
          this.singleScore = parseInt(hit.substring(1), 10);
          this.hitCounter++;
          break;
        case 'D':
          this.singleScore = 2 * parseInt(hit.substring(1), 10);
          this.hitCounter++;
          break;
        case 'T':
          this.singleScore = 3 * parseInt(hit.substring(1), 10);
          this.hitCounter++;
          break;
        case 'B':
          this.singleScore = parseInt(hit.substring(1), 10);
          this.hitCounter++;
          break;
        case 'R':
          this.singleScore = parseInt(hit.substring(1), 10);
          this.hitCounter++;
          break;
        default:
          this.singleScore = 0;
          break;
      }
      this.roundScore = this.roundScore + this.singleScore;
      if (
        this.roundNo === 6 &&
        this.hitCounter !== 3 &&
        this.roundScore !== 41
      ) {
        this.roundScore = 0;
      }
      // slut på spelares omgång
      if (this.arrowsLeft === 0) {
        // hämta, räkna om och spara totalpoäng för spelare
        const savedScore = parseInt(
          localStorage.getItem(this.currentPlayerNick),
          10
        );
        const totalScore =
          this.roundScore === 0
            ? Math.ceil(savedScore / 2)
            : savedScore + this.roundScore;
        localStorage.setItem(this.currentPlayerNick, totalScore.toString());
        console.log(
          this.currentPlayerNick +
            ' points: ' +
            localStorage.getItem(this.currentPlayerNick)
        );
        // återställ kontrollvariabler
        this.arrowsLeft = 3;
        this.currentPlayerCounter++;
        this.roundScore = 0;
        // slut på en full runda
        if (this.currentPlayerCounter === this.numberOfPlayers) {
          this.currentTarget = this.targets[this.roundNo];
          this.roundNo++;
          this.currentPlayerCounter = 0;
        }
        this.currentPlayerNick = this.selected[this.currentPlayerCounter];
        // om spelet är slut
        if (this.roundNo === 9) {
          // TODO skicka data för alla spelare
          console.log('GAME ENDED');
          this.selected.forEach(nick => {
            console.log(nick + ': ' + localStorage.getItem(nick));
          });
        }

      }
    }
  }

  checkHit(hit: string): boolean {
    return hit.substring(1) === this.currentTarget;
  }

  // TODO rename as cancel?? eller ngt annat fiffgt....
  home(): void {
    this.router.navigateByUrl('/');
  }
}
