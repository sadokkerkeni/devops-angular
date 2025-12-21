import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
// roleGuard removed - no role-based access control
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/dashboard' - default page after login
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing routes
    // {
    //     path: '',
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},

    //     ]
    // },

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            // All routes accessible to all authenticated users (no role guard)
            { path: 'dashboard', loadChildren: () => import('app/modules/admin/dashboard/dashboard.routes') },
            { path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes') },
            { path: 'magasin', loadChildren: () => import('app/modules/admin/magasin/magasin.routes') },
            { path: 'picklist', loadChildren: () => import('app/modules/admin/picklist/picklist.routes') },
            { path: 'user-role', loadChildren: () => import('app/modules/admin/user-role/user-role.routes') },
            { path: 'role-management', loadChildren: () => import('app/modules/admin/role-management/role-management.routes') },
            { path: 'sap', loadChildren: () => import('app/modules/admin/sap/sap.routes') },
            { path: 'line', loadChildren: () => import('app/modules/admin/line/line.routes') },
            { path: 'return', loadChildren: () => import('app/modules/admin/return-line/return.routes') },
            { path: 'returns', loadChildren: () => import('app/modules/admin/returns/returns.routes') }, // New returns list route
            { path: 'movement-trace', loadChildren: () => import('app/modules/admin/movment-trace/movment-trace.routes') },
            { path: 'articles', loadChildren: () => import('app/modules/admin/article/article.routes') },
            { path: 'profile', loadChildren: () => import('app/modules/admin/profile/profile.routes') },
            { path: 'messaging', loadChildren: () => import('app/modules/admin/messaging/messaging.routes') },
        ]
    },



];
