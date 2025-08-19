import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { nonAuthGuard } from './guards/nonAuth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./pages/private/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'feed',
        loadComponent: () =>
          import('./pages/private/feed/feed.component').then(m => m.FeedComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/private/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/private/settings/settings.component').then(m => m.SettingsComponent)
      },
      { path: '', redirectTo: '/auth', pathMatch: 'full' },
    ],
  },
  {
    path: 'auth',
    canMatch: [nonAuthGuard],
    loadComponent: () =>
      import('./pages/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./pages/public/explore/explore.component').then(m => m.ExploreComponent)
  },
  { path: '**', redirectTo: '/auth', pathMatch: 'full' }
];
