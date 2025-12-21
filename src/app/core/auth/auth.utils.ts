import { FuseNavigationItem } from '@fuse/components/navigation';

/**
 * Auth Utils class for token management
 */
export class AuthUtils
{
    /**
     * Check if token is expired
     */
    static isTokenExpired(token: string): boolean
    {
        if (!token)
        {
            return true;
        }

        try
        {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp;
            
            if (!exp)
        {
            return true;
        }

            const expirationDate = new Date(exp * 1000);
            return expirationDate < new Date();
        }
        catch (error)
        {
            return true;
        }
    }
}

/**
 * Role-based access control configuration
 * Maps each role to the routes they can access
 * This must match the route guards in app.routes.ts
 */
export const ROLE_ACCESS: Record<string, string[]> = {
  'Administrateur': ['*'], // Admin has access to everything
  'Admin': ['*'], // Backward compatibility - Admin has access to everything
  'Magasinier': ['/example'], // Inventory (example) only
  'Opérateur': ['/picklist'], // Picklist only
  'Chef de ligne': ['/line', '/return'], // Line and return
  'Appro-ligne': ['/return'], // Return only
  'Contrôle qualité': ['/return'], // Return only
  'User': ['/profile'], // Default user can access profile
};

/**
 * Check if a route is accessible for given roles
 * MODIFIED: All authenticated users can access all routes
 */
export function isRouteAccessible(route: string, roles: string[]): boolean {
  // All authenticated users have access to all routes
  if (roles && roles.length > 0) {
    return true;
  }
  
  // If no roles, deny access (user not authenticated)
  return false;
}

/**
 * Filter navigation items to show only those accessible by the user's roles
 * MODIFIED: All authenticated users see all navigation items
 */
export function filterNavigationByRoles(items: FuseNavigationItem[], roles: string[]): FuseNavigationItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  // If no roles, return empty (user not authenticated)
  if (!roles || roles.length === 0) {
    return [];
  }

  // MODIFIED: All authenticated users see all navigation items
  // Return all items with children processed recursively
  return items.map(item => ({
    ...item,
    children: item.children ? filterNavigationByRoles(item.children, roles) : undefined
  }));
}
