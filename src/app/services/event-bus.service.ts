import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class EventBusService {

  private refreshFeedSource = new Subject<void>();
  refreshFeed$ = this.refreshFeedSource.asObservable();

  refreshFeed() {
    this.refreshFeedSource.next();
  }

  private refreshHikingTrailDetail = new Subject<void>();
  refreshHikingTrailDetail$ = this.refreshHikingTrailDetail.asObservable();

  refreshHikingTrail() {
    this.refreshHikingTrailDetail.next();
  }

}
