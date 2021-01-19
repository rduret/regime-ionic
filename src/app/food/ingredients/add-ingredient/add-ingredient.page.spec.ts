import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddIngredientPage } from './add-ingredient.page';

describe('AddIngredientPage', () => {
  let component: AddIngredientPage;
  let fixture: ComponentFixture<AddIngredientPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddIngredientPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddIngredientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
