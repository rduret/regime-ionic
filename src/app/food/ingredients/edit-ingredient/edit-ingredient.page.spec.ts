import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditIngredientPage } from './edit-ingredient.page';

describe('EditIngredientPage', () => {
  let component: EditIngredientPage;
  let fixture: ComponentFixture<EditIngredientPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditIngredientPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditIngredientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
