import {Subject} from 'rxjs';

export abstract class Wanted {
  private PisCurrentlySatisfied = false;
  timeout = -1;
  time = 0;
  public position: { x: number, y: number } = {x: 0, y: 0};
  public destination: { x: number, y: number } = {x: 0, y: 0};
  public abstract label: string;

  public get remainingPercentOfTime(): number {
    return (this.timeout - this.time) / this.timeout;
  }

  public get isCurrentlySatisfied(): boolean {
    return this.PisCurrentlySatisfied;
  }

  public set isCurrentlySatisfied(value: boolean) {
    this.PisCurrentlySatisfied = value;
  }

  constructor() {
  }

  public abstract clone(): Wanted;
}

export class WantedClick extends Wanted {
  public label = 'click';

  constructor(public range = 100) {
    super();
  }

  clone(): Wanted {
    return new WantedClick(this.range);
  }
}

export class WantedKeyPress extends Wanted {
  label = 'press key';

  constructor(public key: string) {
    super();
  }

  clone(): Wanted {
    return new WantedKeyPress(this.key);
  }
}

export class WantedText extends Wanted {
  label = 'write';

  constructor(public text: string) {
    super();
  }

  clone(): Wanted {
    return new WantedText(this.text);
  }
}

export class WantedComposite extends Wanted {
  label = '';

  constructor(public wanteds: Wanted[]) {
    super();
  }

  clone(): Wanted {
    return new WantedComposite(this.wanteds);
  }
}

export class WantedShortCut extends Wanted {
  label = 'shortcut';

  public get isCurrentlySatisfied(): boolean {
    return this.wanteds.every(wanted => wanted.isCurrentlySatisfied);
  }

  public set isCurrentlySatisfied(val: boolean) {
    this.wanteds.forEach(wanted => wanted.isCurrentlySatisfied = val);
  }

  constructor(public wanteds: Wanted[]) {
    super();
  }

  clone(): Wanted {
    return new WantedShortCut(this.wanteds.map(w => w.clone()));
  }
}

export class PartyConfig {
  useClick = true;
  nbrOfClick = 10;
  useKey = true;
  keys: (string | { key: string, label: string })[] = ['Control', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Alt', 'Enter', {
    key: ' ',
    label: 'Espace'
  }];
  useTexts = false;
  texts: string[] = ['hello', 'cd ../var', 'root'];
  useKeySuite = false;

  useShortcut = false;
  shortCut: (string[] | { keys: string[], label: string })[] = [['Control', 'Alt'], ['Control', 'ArrowLeft']];
  nbrOfRandomShortcut = 10;
}

export class Party extends PartyConfig {

  minTimeout = 2000;
  maxTimeout = 20000;
  minBetween = 500;
  maxBetween = 3000;
  possibleKeys: Array<Wanted> = new Array<Wanted>();
  possibleCharacters: Array<Wanted> = new Array<Wanted>();
  possibleClics: Array<Wanted> = new Array<Wanted>();
  possibleShortcut: Array<Wanted> = new Array<Wanted>();
  possibleWanteds: Array<Wanted> = new Array<Wanted>();
}

export function initPartyRunner(config: PartyConfig): PartyRunner {
  const party = new PartyRunner();
  if (config.useClick) {
    for (let i = 0; i < config.nbrOfClick; i++) {
      party.possibleClics.push(new WantedClick(party.randomBetween(10, 100)));

    }
  }
  if (config.useKey) {
    for (let i = 0; i < 26; i++) {
      party.possibleCharacters.push(new WantedKeyPress(String.fromCharCode(97 + i)));

    }
    party.possibleKeys.push(new WantedKeyPress('Control'));
    party.possibleKeys.push(new WantedKeyPress('ArrowLeft'));
    party.possibleKeys.push(new WantedKeyPress('ArrowUp'));
    party.possibleKeys.push(new WantedKeyPress('ArrowDown'));
    party.possibleKeys.push(new WantedKeyPress('ArrowRight'));
    party.possibleKeys.push(new WantedKeyPress('Alt'));
    party.possibleKeys.push(new WantedKeyPress('Enter'));
  }
  if (config.useShortcut) {
    config.shortCut.forEach((s) => {
      if (s instanceof Array) {
        party.possibleShortcut
          .push(new WantedShortCut(s.map(w => new WantedKeyPress(w))));
      }
    });
  }

  for (let i = 0; i < config.nbrOfRandomShortcut; i++) {
    const firstKey = party.random(party.possibleKeys);
    party.possibleShortcut
      .push(
        new WantedShortCut([
          firstKey.clone(),
          party.random(party.possibleKeys.filter(k => k !== firstKey)).clone()]));
    party.possibleShortcut
      .push(
        new WantedShortCut([
          firstKey.clone(),
          party.random([...(party.possibleKeys.filter(k => k !== firstKey)),
            ...party.possibleCharacters]).clone()
        ]));
  }


  party.possibleWanteds = [...party.possibleClics, ...party.possibleCharacters, ...party.possibleKeys, ...party.possibleShortcut];
  party.possibleWanteds
    .push(new WantedText('hello world'));
  party.possibleWanteds
    .push(new WantedText('npm run start'));
  party.possibleWanteds
    .push(new WantedText('console.log()'));
  party.possibleWanteds
    .push(new WantedText('maven'));
  return party;
}

export class PartyRunner extends Party {
  play = true;
  flow: Subject<Wanted> = new Subject<Wanted>();
  maxMissed = 7;

  constructor() {
    super();
  }

  randomBetween(min, max): number {
    return Math.floor(min + Math.random() * (max - min));
  }

  run(): void {
    this.runIteration();
  }

  random<T>(arr: T[]): T {
    return arr[this.randomBetween(0, arr.length)];
  }

  runIteration(): void {
    setTimeout(() => {
      const next = this.random(this.possibleWanteds).clone();
      next.isCurrentlySatisfied = false;
      next.timeout = this.randomBetween(this.minTimeout, this.maxTimeout);
      next.position = {x: this.randomBetween(10, 90), y: this.randomBetween(10, 90)};
      next.destination = {x: this.randomBetween(10, 90), y: this.randomBetween(10, 90)};
      this.flow.next(next);
      if (this.play) {
        this.runIteration();
      }
    }, this.randomBetween(this.minBetween, this.maxBetween));

  }

}
