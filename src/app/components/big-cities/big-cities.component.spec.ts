import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigCitiesComponent } from './big-cities.component';

describe('BigCitiesComponent', () => {
  let component: BigCitiesComponent;
  let fixture: ComponentFixture<BigCitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BigCitiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BigCitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
