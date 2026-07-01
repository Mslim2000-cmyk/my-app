import { Routes } from '@angular/router';
import { BoardListComponent } from './boards-list/board-list.component';
import { BoardDetailsComponent } from './boards-details/board-details.component';

export const BOARDS_ROUTES: Routes = [
  {
    path: '',
    component: BoardListComponent,
    title: 'Boards - IoT Protocol Engine'
  },
  {
    path: ':id',
    component: BoardDetailsComponent,
    title: 'Board Details - IoT Protocol Engine'
  }
];
