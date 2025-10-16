/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'inventory',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },{ // location
    id: 'location',
    title: 'Location',
    type: 'basic',
    icon: 'mat_solid:place', // Ou 'mat_solid:location_on', 'mat_solid:room'
    link: '/location'
  },
  { // magasin (Warehouse)
    id: 'magasin',
    title: 'Magasin',
    type: 'basic',
    icon: 'mat_solid:storefront', // Ou 'mat_solid:storefront', 'mat_solid:inventory_2'
    link: '/magasin'
  },
  { // picklist
    id: 'picklist',
    title: 'Picklist',
    type: 'basic',
    icon: 'mat_solid:list_alt', // Ou 'mat_solid:checklist', 'mat_solid:assignment'
    link: '/picklist'
  },
  { // userRole
    id: 'userRole',
    title: 'User Role',
    type: 'basic',
    icon: 'mat_solid:manage_accounts', // Ou 'mat_solid:supervisor_account', 'mat_solid:admin_panel_settings'
    link: '/user-role'
  },
  { // sap
    id: 'sap',
    title: 'Sap',
    type: 'basic',
    icon: 'mat_solid:account_tree', // Représente souvent un système/ERP. Ou 'mat_solid:data_object', 'mat_solid:hub'
    link: '/sap'
  },
  { // line
    id: 'line',
    title: 'Line',
    type: 'basic',
    icon: 'mat_solid:linear_scale', // Ou 'mat_solid:trending_flat', 'mat_solid:timeline'
    link: '/line'
  },
  { // return
    id: 'return',
    title: 'Return',
    type: 'basic',
    icon: 'mat_solid:undo', // Ou 'mat_solid:reply', 'mat_solid:keyboard_return'
    link: '/return'
  },
  { // movement-trace
    id: 'movement-trace',
    title: 'Movement Trace',
    type: 'basic',
    icon: 'mat_solid:track_changes', // Ou 'mat_solid:route', 'mat_solid:navigation'
    link: '/movement-trace'
  },
  { // movement-trace
    id: 'article',
    title: 'Articles',
    type: 'basic',
    icon: 'mat_solid:track_changes', // Ou 'mat_solid:route', 'mat_solid:navigation'
    link: '/articles'
  }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    
];
