import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EventBusService {

  private refreshFeedSource = new Subject<void>();
  refreshFeed$ = this.refreshFeedSource.asObservable();

  refreshFeed() {
    this.refreshFeedSource.next();
  }

}
