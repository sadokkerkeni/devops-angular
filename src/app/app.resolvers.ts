import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export const initialDataResolver = () =>
{
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

    console.log('[InitialDataResolver] Starting data resolution');

    // Helper function to wrap observables with timeout and error handling
    const withTimeout = <T>(obs: any, defaultValue: T, timeoutMs: number = 2000) => {
        return obs.pipe(
            timeout(timeoutMs),
            catchError((error) => {
                console.warn('[InitialDataResolver] Service call timed out or failed, using default value:', error);
                return of(defaultValue);
            })
        );
    };

    // Fork join multiple API endpoint calls with individual error handling
    // Each service gets its own timeout so one failure doesn't block others
    return forkJoin([
        withTimeout(navigationService.get(), { compact: [], default: [], futuristic: [], horizontal: [] }, 3000),
        withTimeout(messagesService.getAll(), [], 1000),
        withTimeout(notificationsService.getAll(), [], 1000),
        withTimeout(quickChatService.getChats(), [], 1000),
        withTimeout(shortcutsService.getAll(), [], 1000),
    ]).pipe(
        catchError((error) => {
            console.error('[InitialDataResolver] Fatal error in forkJoin:', error);
            // Return minimal data structure to allow navigation
            return of([
                { compact: [], default: [], futuristic: [], horizontal: [] },
                [],
                [],
                [],
                []
            ]);
        })
    );
};
