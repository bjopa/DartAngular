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
  scores = []; // stores current standings in weird array from object
  resultList = []; // combined array for displaying in html

  currentGameId = ''; // game number in db
  gameFinished = false; // control variable, if a game is finished

  fullPlayerList = []; // all players available for selection
  selected = []; // selected players from full
  currentPlayerNick = ''; // current players nick
  currentPlayerCounter = 0; // index of current player
  numberOfPlayers = 0; // total no of players in game

  storageData: any;
  savePlayerState = [];

  undoable = false;
  sendableThrow = false;

  constructor(
    private gameService: GameService,
    private playersService: PlayersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    document.getElementById('selector').style.display = 'block'; // block
    document.getElementById('gameboard').style.display = 'none'; // none
    document.getElementById('results').style.display = 'none'; // none
    this.getPlayers();
  }

  getPlayers(): void {
    this.playersService
      .getAllPlayers()
      .toPromise()
      .then((resp) => {
        if (resp.status === 200) {
          this.players = resp.body;
        }
      })
      .then(() => {
        this.addPlayersToSelection();
      });
  }

  addPlayersToSelection(): void {
    this.fullPlayerList = []; // Behövs för att kunna läsa in
    this.players.forEach((player) => {
      this.fullPlayerList.push(player.nickname);
    });
  }

  initGame(): void {
    sessionStorage.clear();
    if (this.selected.length >= 2) {
      if (
        window.confirm('Start game with ' + this.selected.length + ' players?')
      ) {
        this.addGame(this.selected);
        this.currentTarget = this.targets[0];
        this.currentPlayerNick = this.selected[this.currentPlayerCounter];
        this.numberOfPlayers = this.selected.length;
        this.selected.forEach((nick) => {
          sessionStorage.setItem(nick, '0');
        });
        this.storageData = sessionStorage;
      }
    } else {
      alert('Please select a minimum of 2 players');
    }
  }

  addGame(selected): void {
    document.getElementById('selector').style.display = 'none';
    document.getElementById('gameboard').style.display = 'grid';
    document.getElementById('results').style.display = 'none';
    this.gameService
      .addGame(selected)
      .toPromise()
      .then((resp) => {
        this.currentGameId = resp.body;
        this.createStandings();
      })
      .catch((resp) => {
        console.log('game.components => addGame: failed');
      });
  }

  /**
   * GAMELOGIC BELOW
   */

  dartThrown(hit: string) {
    this.undoable = true;
    if (!this.gameFinished) {
      // skriv förra kastet till db
      if (this.sendableThrow) {
        this.reportThrow(
          this.savePlayerState[0],
          this.savePlayerState[1],
          this.savePlayerState[2],
          this.savePlayerState[3]
        );
      }

      // spara info rapport och undo
      this.savePlayerState[0] = this.currentPlayerNick;
      this.savePlayerState[1] = this.currentGameId;
      this.savePlayerState[2] = this.dartNumber;
      this.savePlayerState[3] = hit;
      this.savePlayerState[4] = this.roundNo;
      this.savePlayerState[5] = this.arrowsLeft;
      this.savePlayerState[6] = this.hitCounter;
      this.savePlayerState[7] = this.roundScore;
      this.savePlayerState[8] = this.currentPlayerCounter;
      this.savePlayerState[9] = parseInt(
        sessionStorage.getItem(this.currentPlayerNick),
        10
      );
      this.sendableThrow = true;

      // kolla om man träffat target
      const correctHit = this.checkHit(hit, this.currentTarget);

      // bestäm pilnr totalt per spelare
      this.dartNumber =
        this.roundNo + 2 * (this.roundNo - 1) + (3 - this.arrowsLeft);

      // minska kvarvarande antal pilar
      this.arrowsLeft--;

      // poängräkning en pil
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

      // summering per pil
      this.singleScore = correctHit ? this.singleScore : 0;
      this.roundScore = this.roundScore + this.singleScore;

      // slut på spelares omgång
      if (this.arrowsLeft === 0) {
        // kolla om 41 var korrekt kastat
        if (
          this.roundNo === 6 &&
          (this.hitCounter !== 3 || this.roundScore !== 41)
        ) {
          this.roundScore = 0; // om fail, nollställ rundans poäng
        }

        // hämta, räkna om och spara totalpoäng för spelare
        const savedScore = parseInt(
          sessionStorage.getItem(this.currentPlayerNick),
          10
        );
        const totalScore =
          this.roundScore === 0
            ? Math.ceil(savedScore / 2)
            : savedScore + this.roundScore;
        sessionStorage.setItem(this.currentPlayerNick, totalScore.toString());

        // sortera aktuell ställning för resultatlista
        this.createStandings();

        // justera kontrollvariabler
        this.hitCounter = 0;
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

        // om spelet är slut, siffran ska vara 9 vid prodversion
        if (this.roundNo === 9) {
          this.endGame();
        }
      }
    }
  }

  checkHit(hit: string, target: string): boolean {
    if (target === 'Triple' || target === 'Double' || target === 'Bulls Eye') {
      if (hit.substring(0, 1) === target.substring(0, 1)) {
        return true;
      }
      return false;
    } else if (
      target === '19' ||
      target === '18' ||
      target === '17' ||
      target === '20'
    ) {
      if (hit.substring(1) === target) {
        return true;
      }
      return false;
    } else if (target === '41') {
      if (hit.substring(1) !== '0') {
        return true;
      }
      return false;
    }
  }

  // Skapa Standings-listan
  createStandings(): void {
    this.scores = Object.keys(this.storageData).map((key) => [
      key,
      this.storageData[key],
    ]);
    this.scores = this.scores.sort((a, b) => b[1] - a[1]);
    this.resultList.splice(0, this.resultList.length);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.scores.length; i++) {
      this.resultList.push({
        name: this.scores[i][0],
        score: this.scores[i][1],
      });
    }
  }

  reportThrow(
    currentPlayerNick: string,
    currentGameId: string,
    dartNumber: number,
    hit: string
  ): void {
    const reportThrowData =
      currentPlayerNick + '-' + currentGameId + '-' + dartNumber + '-' + hit;
    this.gameService
      .reportThrow(reportThrowData)
      .toPromise()
      .then((resp) => {
        console.log(reportThrowData);
      });
  }

  undoThrow(): void {
    if (!this.undoable) {
      alert('Can\'t undo');
    } else {
      this.currentPlayerNick = this.savePlayerState[0];
      this.roundNo = this.savePlayerState[4];
      this.arrowsLeft = this.savePlayerState[5];
      this.hitCounter = this.savePlayerState[6];
      this.roundScore = this.savePlayerState[7];
      this.currentPlayerCounter = this.savePlayerState[8];
      sessionStorage.setItem(
        (this.currentPlayerNick = this.savePlayerState[0]),
        this.savePlayerState[9]
      );
      this.currentTarget = this.targets[this.roundNo - 1];
      this.sendableThrow = false;
      this.undoable = false;
    }
  }

  endGame(): void {
    // rapportera slutresultat
       // tslint:disable-next-line: prefer-for-of
       for (let i = 0; i < this.scores.length; i++) {
         const reportGameData =
           this.scores[i][0] +
           '-' +
           this.currentGameId +
           '-' +
           this.scores[i][1];
         this.gameService
           .reportGame(reportGameData)
           .toPromise()
           .then((resp) => {
             console.log(
               'Game reported to db for player ' + this.scores[i][0]
             );
           });
       }

       // sätt variabler till rätt värde
       this.gameFinished = true;
       document.getElementById('selector').style.display = 'none';
       document.getElementById('gameboard').style.display = 'none';
       document.getElementById('results').style.display = 'block';
}

  // TODO rename as cancel?? eller ngt annat fiffgt....
  abortGame(): void {
    this.router.navigateByUrl('/');
  }
}
