import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { nonAuthGuard } from './guards/nonAuth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/private/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      // public routes
      {
        path: 'profile/:code',
        loadComponent: () =>
          import('./pages/public/profile/profile.component').then(m => m.ProfileComponent)
      },
      // private routes
      {
        path: '',
        canActivateChild: [authGuard],
        children: [
          {
            path: 'feed',
            loadComponent: () =>
              import('./pages/private/feed/feed.component').then(m => m.FeedComponent)
          },
          /*{
            path: 'profile',
            loadComponent: () =>
              import('./pages/private/profile/profile.component').then(m => m.ProfileComponent)
          },*/
          {
            path: 'settings',
            loadComponent: () =>
              import('./pages/private/settings/settings.component').then(m => m.SettingsComponent),
            children: [
              {
                path: 'profile',
                loadComponent: () =>
                  import('./pages/private/settings/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent)
              },
              {
                path: 'account',
                loadComponent: () =>
                  import('./pages/private/settings/account-settings/account-settings.component').then(m => m.AccountSettingsComponent)
              },
              {
                path: 'screen',
                loadComponent: () =>
                  import('./pages/private/settings/screen-settings/screen-settings.component').then(m => m.ScreenSettingsComponent)
              },
              { path: '', redirectTo: 'profile', pathMatch: 'full' }
            ]
          },
          {
            path: 'hiking-trail/:code',
            loadComponent: () =>
              import('./pages/private/hiking-trail-detail/hiking-trail-detail.component').then(m => m.HikingTrailDetailComponent)
          },
          { path: '', redirectTo: '/feed', pathMatch: 'full' },
        ]
      }
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
