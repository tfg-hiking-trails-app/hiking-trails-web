import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MaterialModules } from '@material/material.modules';

@Component({
  selector: 'app-recommender',
  imports: [
    MaterialModules
  ],
  templateUrl: './recommender.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommenderComponent { }
