import { Routes } from '@angular/router';

import { AuthComponent } from './pages/auth/auth.component';
import { authGuard } from './guards/auth.guard';
import { ExploreComponent } from './pages/public/explore/explore.component';
import { FeedComponent } from './pages/private/feed/feed.component';
import { nonAuthGuard } from './guards/nonAuth.guard';

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
