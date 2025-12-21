/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'basic',
    icon: 'mat_solid:dashboard',
    link: '/dashboard'
  },
  {
    id: 'operations',
    title: 'Opérations',
    type: 'group',
    children: [
      { id: 'magasin', title: 'Magasin', type: 'basic', icon: 'mat_solid:storefront', link: '/magasin' },
      { id: 'picklist', title: 'Picklist', type: 'basic', icon: 'mat_solid:list_alt', link: '/picklist' },
      { id: 'articles', title: 'Articles', type: 'basic', icon: 'mat_solid:inventory_2', link: '/articles' },
      { id: 'movement-trace', title: 'Traçabilité', type: 'basic', icon: 'mat_solid:track_changes', link: '/movement-trace' },
      { id: 'returns', title: 'Retours', type: 'basic', icon: 'mat_solid:undo', link: '/returns' }
    ]
  },
  {
    id: 'integrations',
    title: 'Intégrations',
    type: 'group',
    children: [
      { id: 'sap', title: 'SAP', type: 'basic', icon: 'mat_solid:hub', link: '/sap' },
      { id: 'line', title: 'Ligne', type: 'basic', icon: 'mat_solid:timeline', link: '/line' }
    ]
  },
  {
    id: 'administration',
    title: 'Administration',
    type: 'group',
    children: [
      { id: 'userRole', title: 'Utilisateurs & rôles', type: 'basic', icon: 'mat_solid:manage_accounts', link: '/user-role' },
      { id: 'role-management', title: 'Permissions', type: 'basic', icon: 'mat_solid:admin_panel_settings', link: '/role-management' }
    ]
  },
  {
    id: 'communication',
    title: 'Communication',
    type: 'group',
    children: [{ id: 'messaging', title: 'Messagerie', type: 'basic', icon: 'mat_solid:chat', link: '/messaging' }]
  }
];
export const compactNavigation: FuseNavigationItem[] = [
    { // dashboard
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'mat_solid:dashboard',
        link: '/dashboard'
    },
    { // magasin (Warehouse)
        id: 'magasin',
        title: 'Magasin',
        type: 'basic',
        icon: 'mat_solid:storefront',
        link: '/magasin'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    { // dashboard
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'mat_solid:dashboard',
        link: '/dashboard'
    },
    { // magasin (Warehouse)
        id: 'magasin',
        title: 'Magasin',
        type: 'basic',
        icon: 'mat_solid:storefront',
        link: '/magasin'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    { // dashboard
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'mat_solid:dashboard',
        link: '/dashboard'
    },
    { // magasin (Warehouse)
        id: 'magasin',
        title: 'Magasin',
        type: 'basic',
        icon: 'mat_solid:storefront',
        link: '/magasin'
    }
];
