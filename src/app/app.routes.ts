import { Routes } from '@angular/router';

import { AuthComponent } from './pages/auth/auth.component';
import { FeedComponent } from './pages/private/feed/feed.component';

export const routes: Routes = [
  { path: 'feed', component: FeedComponent },
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: '**', redirectTo: '/feed', pathMatch: 'full' }
];
