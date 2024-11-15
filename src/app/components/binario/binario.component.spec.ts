import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinarioComponent } from './binario.component';

describe('BinarioComponent', () => {
  let component: BinarioComponent;
  let fixture: ComponentFixture<BinarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BinarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
