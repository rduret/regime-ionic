import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SingleRecipePage } from './single-recipe.page';

describe('SingleRecipePage', () => {
  let component: SingleRecipePage;
  let fixture: ComponentFixture<SingleRecipePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleRecipePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SingleRecipePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
