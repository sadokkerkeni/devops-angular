import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

/**
 * Common test configuration for Angular components and services
 */
export class TestConfig {
  static configureTestingModule(config: {
    declarations?: any[];
    imports?: any[];
    providers?: any[];
    component?: any;
  }) {
    const defaultImports = [
      HttpClientTestingModule,
      MatSnackBarModule,
      MatDialogModule,
      NoopAnimationsModule,
      RouterTestingModule
    ];

    const defaultProviders = [];

    return TestBed.configureTestingModule({
      declarations: config.declarations || [],
      imports: [...defaultImports, ...(config.imports || [])],
      providers: [...defaultProviders, ...(config.providers || [])]
    });
  }

  static configureComponentTesting(config: {
    component: any;
    imports?: any[];
    providers?: any[];
  }) {
    const defaultImports = [
      HttpClientTestingModule,
      MatSnackBarModule,
      MatDialogModule,
      NoopAnimationsModule,
      RouterTestingModule
    ];

    const defaultProviders = [];

    return TestBed.configureTestingModule({
      imports: [config.component, ...defaultImports, ...(config.imports || [])],
      providers: [...defaultProviders, ...(config.providers || [])]
    });
  }
}

/**
 * Mock providers for common services
 */
export const MOCK_PROVIDERS = {
  warehouseService: {
    provide: 'WarehouseService',
    useValue: {
      getWarehouses: jasmine.createSpy('getWarehouses'),
      createWarehouse: jasmine.createSpy('createWarehouse'),
      updateWarehouse: jasmine.createSpy('updateWarehouse'),
      setActiveStatus: jasmine.createSpy('setActiveStatus')
    }
  },
  articleService: {
    provide: 'ArticleService',
    useValue: {
      getArticles: jasmine.createSpy('getArticles'),
      createArticle: jasmine.createSpy('createArticle'),
      updateArticle: jasmine.createSpy('updateArticle'),
      deleteArticle: jasmine.createSpy('deleteArticle')
    }
  },
  picklistService: {
    provide: 'PicklistService',
    useValue: {
      getPicklists: jasmine.createSpy('getPicklists'),
      createPicklist: jasmine.createSpy('createPicklist'),
      updatePicklist: jasmine.createSpy('updatePicklist'),
      deletePicklist: jasmine.createSpy('deletePicklist')
    }
  },
  userService: {
    provide: 'UserService',
    useValue: {
      getUsers: jasmine.createSpy('getUsers'),
      createUser: jasmine.createSpy('createUser'),
      updateUser: jasmine.createSpy('updateUser'),
      deleteUser: jasmine.createSpy('deleteUser')
    }
  }
};

/**
 * Test utilities
 */
export class TestUtils {
  static createMockObservable<T>(data: T): Observable<T> {
    return of(data);
  }

  static createMockError(status: number, message: string = 'Error'): Observable<never> {
    return throwError(() => ({
      status,
      statusText: message,
      error: { message }
    }));
  }

  static createSpyObject<T>(name: string, methods: string[]): jasmine.SpyObj<T> {
    return jasmine.createSpyObj(name, methods);
  }
}
