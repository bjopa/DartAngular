import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayersComponent } from './players/players.component';
import { RulesComponent } from './rules/rules.component';
import { HighscoresComponent } from './highscores/highscores.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'players',
    component: PlayersComponent
  },
  {
    path: 'rules',
    component: RulesComponent
  },
  {
    path: 'highscores',
    component: HighscoresComponent
  },
  {
    path: 'game',
    component: GameComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
