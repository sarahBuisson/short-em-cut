import {ComponentFixture, TestBed} from '@angular/core/testing';

import {WantShortcutComponent} from './want-shortcut.component';
import {WantClickComponent} from '../want-click/want-click.component';
import {WantKeyComponent} from '../want-key/want-key.component';
import {WantedClick, WantedComposite, WantedKeyPress, WantedShortCut} from '../../../domain/model';

describe('WantCompositeComponent', () => {
  let component: WantShortcutComponent;
  let fixture: ComponentFixture<WantShortcutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WantShortcutComponent, WantClickComponent, WantKeyComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WantShortcutComponent);
    component = fixture.componentInstance;
    component.want = new WantedShortCut([new WantedClick(), new WantedKeyPress('a')]);
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should be done if all wanted are done', () => {
    // When
    component.want.wanteds.forEach(w => w.isCurrentlySatisfied = true);
    // Then
    expect(component.maybeDone(new MouseEvent(''))).toBeTruthy();
  });

  it('should be done if some wanted arent done', () => {
    // When
    component.want.wanteds.forEach(w => w.isCurrentlySatisfied = true);
    component.want.wanteds[0].isCurrentlySatisfied = false;
    // Then
    expect(component.maybeDone(new MouseEvent(''))).toBeFalse();
  });
});
