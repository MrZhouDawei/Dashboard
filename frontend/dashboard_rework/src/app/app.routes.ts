import { Routes } from '@angular/router';
// Use dynamic imports to enable lazy loading
const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/authenticationComponents/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/authenticationComponents/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./components/mainComponents/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dashboardList',
    loadComponent: ()  => import('./components/dashboardComponents/list-dashboards/list-dashboards.component').then(m => m.ListDashboardsComponent)
  },
  {
    path: 'dashboard/:name',
    loadComponent: () => import('./components/dashboardComponents/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'editDashboard/:name',
    loadComponent: () => import('./components/dashboardComponents/edit_dashboard/edit-dashboard.component').then(m => m.EditDashboardComponent)
  },
  {
    path: 'addDashboard',
    loadComponent: () => import('./components/dashboardComponents/create_dashboard/create-dashboard.component').then(m => m.CreateDashboardComponent)
  },
  {
    path: 'widgetList',
    loadComponent: () => import('./components/widgetComponents/list-widgets/list-widgets.component').then(m => m.ListWidgetsComponent)
  },
  {
    path: 'addWidget',
    loadComponent: () => import('./components/widgetComponents/create-widget/create-widget.component').then(m => m.CreateWidgetComponent)
  },
  {
    path: 'widget/:id',
    loadComponent: () => import('./components/widgetComponents/widget/widget.component').then(m => m.WidgetComponent)
  },
  {
    path: 'editWidget/:id',
    loadComponent: () => import('./components/widgetComponents/edit-widget/edit-widget.component').then(m => m.EditWidgetComponent)
  },
  {
    path: 'recoverPassword',
    loadComponent: () => import('./components/authenticationComponents/recover-password/recover-password.component').then(m => m.RecoverPasswordComponent)
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

export { routes };
