import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';

export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        // Check if the response is our custom ApiResponse wrapper
        if (event.body && typeof event.body === 'object' && 'success' in event.body) {
          // If it has a 'data' property, unwrap it. Otherwise just return the body or null
          if ('data' in event.body) {
            return event.clone({ body: event.body.data });
          } else {
            return event.clone({ body: event.body }); // Or we could just return event
          }
        }
      }
      return event;
    })
  );
};
