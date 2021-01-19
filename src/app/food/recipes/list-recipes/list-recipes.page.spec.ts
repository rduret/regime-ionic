import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListRecipesPage } from './list-recipes.page';

describe('ListRecipesPage', () => {
  let component: ListRecipesPage;
  let fixture: ComponentFixture<ListRecipesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListRecipesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListRecipesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
