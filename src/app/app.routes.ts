import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { nonAuthGuard } from './guards/nonAuth.guard';
import { AuthComponent } from './pages/auth/auth.component';
import { FeedComponent } from './pages/private/feed/feed.component';
import { ExploreComponent } from './pages/public/explore/explore.component';

export const routes: Routes = [
  {
    path: 'feed',
    component: FeedComponent,
    canMatch: [authGuard],
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    component: AuthComponent,
    canMatch: [nonAuthGuard],
    canActivate: [nonAuthGuard],
  },
  { path: 'explore', component: ExploreComponent },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth', pathMatch: 'full' }
];
