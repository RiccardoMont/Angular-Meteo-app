import {
  AfterContentInit,
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { AppServiceService } from '../../services/app-service.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-city-card',
  standalone: true,
  imports: [CommonModule, AppComponent],
  templateUrl: './city-card.component.html',
  styleUrl: './city-card.component.css',
  providers: [AppServiceService],
})
export class CityCardComponent implements OnChanges {
  @Input() city: any;
  @Input() hourly_index: number | undefined;

  @Output() updateFavorites = new EventEmitter<boolean>();

  @Output() addToFavorites = new EventEmitter<any>();
  @Output() removeFromFavorites = new EventEmitter<any>();

  @Output() showThisCityChart = new EventEmitter<any>();

  //Proprietà di supporto per gestire l'hover
  isHovered = false;
  //Proprietà di supporto per gestire l'appartenenza di una card ai preferiti o meno
  isClicked = false;
  

  private favoritesChangedSub: Subscription;

  constructor(private appService: AppServiceService, private appComponent: AppComponent) {

    //Aggiorno isClicked ogni volta che i preferiti cambiano
    this.favoritesChangedSub = this.appComponent.favoritesChanged.subscribe(() => {
      this.isClicked = this.isFavorite(); 
    });
  }

  ngOnInit(): void {
    //Controllo se l'elemento è tra i preferiti
    this.isClicked = this.isFavorite();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['city']) {
      this.isClicked = this.isFavorite();
    }
    this.updateWeatherElements();
  }


  ngOnDestroy(): void {
    // Annullo l’iscrizione 
    this.favoritesChangedSub.unsubscribe();
  }

  onHover(hover: boolean): void {
    //Cambio il valore di isHovered se il mouse è sopra l'elemento o se lascia l'elemento
    this.isHovered = hover;
  }

  //Funzione di toggle per aggiungere o rimuovere l'elemento dal localstorage (dai preferiti)
  toggleFavorite(): void {
    //Nel caso sia già 'cliccato' e quindi aggiunto, allora invio l'emit per la rimozione
    if (this.isClicked) {
      this.removeFromFavorites.emit(this.city);
    }
    //Se non è 'cliccato' o presente nel localstorage allora invio l'emit per l'aggiunta
    else {
      this.addToFavorites.emit(this.city);
    }

    //Invio l'emit per indurre il controllo e l'aggiornamento dei preferiti
    this.updateFavorites.emit();
  }

  //Funzione di controllo per l'array 'favorites' nel local storage in modo da poter vedere se una città è già presente al caricamento della pagina
  isFavorite(): boolean {
    //Condizione aggiunta per evitare l'errore server side nel terminale
    if (typeof localStorage === 'undefined') return false;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    console.log('Favorites:', favorites);

    const isAlreadyFavorite = favorites.some((fav: any) =>
      fav.geometry.lat === this.city.geometry.lat &&
      fav.geometry.lng === this.city.geometry.lng
  );

    return isAlreadyFavorite;
  }
  

  //Lista dei codici wmo in base al quale emetto dei div per le icone
  weatherMap: { [key: number]: string[] } = {
    0: [],       // Cielo sgombro
    1: [],       // Pricipalmente sgombro
    2: ['cloud'],     // Parzialmente nuvoloso
    3: ['cloud'],               // Nuvoloso

    //Nebbia
    45: ['fog'], 
    48: ['fog'],

    //Pioggerella
    51: ['cloud', 'light-drizzle'], //Leggera
    53: ['cloud', 'drizzle'], //Moderata
    55: ['cloud', 'drizzle', 'light-drizzle'], //Forte
    
    //Pioggerella gelata
    56: ['cloud', 'light-drizzle'], //Leggera
    57: ['cloud', 'drizzle', 'light-drizzle'], //Forte

    //Pioggia
    61: ['cloud', 'ligh-rain'], //Leggera
    63: ['cloud', 'rain'], //Moderata
    65: ['cloud', 'rain', 'light-rain'], //Forte

    //Pioggia ghiacciata
    66: ['cloud', 'ligh-rain'], //Leggera
    67: ['cloud', 'rain'], //Forte

    //Neve
    71: ['cloud', 'light-snow'], //Leggera
    73: ['cloud', 'snow'], //Moderata
    75: ['cloud', 'snow', 'light-snow'], //Forte

    //Grani di neve
    77: ['cloud', 'snow'],

    //Acquazzoni
    80: ['cloud', 'rain'], //Leggera
    81: ['cloud', 'rain', 'light-rain'], //Moderata
    82: ['cloud', 'rain', 'light-rain'], //Forte

    //Nevicata ingente/improvvisa
    85: ['cloud', 'snow'], //Leggera
    86: ['cloud', 'snow', 'light-snow'], //Forte

    //Temporali
    95: ['cloud', 'rain', 'bolt2'], //Normale
    96: ['cloud', 'hail', 'bolt2'], //Normale con grandine
    99: ['cloud', 'hail', 'bolt', 'bolt2'], //Forte con grandine


  };

  //Array di stringhe di supporto per quando dovrò ciclare e creare più div nella card
  activeWeatherElements: string[] = [];

  

  //Funzine che mi resituisce il codice wmo della città
  getWeatherElements(): string[] {
    //prendo il codice wmo corrispondente all'ora corrente
    const wmoCode = this.city.meteo.hourly.weather_code[this.hourly_index!];
    //Dipendentemente dal codice prendo uno degli array della lista dei codici qui sopra
    const weatherConditions = [...(this.weatherMap[wmoCode] || [])];
    //Con la variabile is_day decido se utilizzare il sole o la luna
    const timeClass = this.city.meteo.current.is_day === 1 ? 'sun' : 'moon';
    //In determinati casi voglio che il sole o la luna siano visibili insieme ad altri elementi. Questi i codici wmo dove voglio che accada ciò
    if (wmoCode === 0 || wmoCode === 1 || wmoCode === 2 || wmoCode === 45 || wmoCode === 48 ) {
      //In questi casi li metto nell'array che sto estrapolando per passarlo alla card nel dom
      weatherConditions.push(timeClass);
    }

    return weatherConditions;
  }


  //All'array di supporto assegno il valore della funzione che mi restituisce le classi (o elementi icona) che la card dovrà avere per rappresentare le condizioni meteo
  updateWeatherElements(): void {
    this.activeWeatherElements = this.getWeatherElements();
  }


  //Emetto il segnale per trasmettere la città da mostrare sul grafico
  showOnChart(){
    this.showThisCityChart.emit(this.city);
  }
}


