import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListMeasuresPage } from './list-measures.page';

describe('ListMeasuresPage', () => {
  let component: ListMeasuresPage;
  let fixture: ComponentFixture<ListMeasuresPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListMeasuresPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListMeasuresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
