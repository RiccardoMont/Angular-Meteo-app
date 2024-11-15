import { Component, inject, Output, EventEmitter, OnInit} from '@angular/core';
import { AppServiceService } from '../../services/app-service.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BinarioComponent } from '../binario/binario.component';
import { CityCardComponent } from '../city-card/city-card.component';
import { AppComponent } from '../../app.component';
import { City } from '../../interfaces/city';


@Component({
  selector: 'app-big-cities',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule, BinarioComponent, CityCardComponent, AppComponent],
  templateUrl: './big-cities.component.html',
  styleUrl: './big-cities.component.css',
  providers: [AppServiceService],  
})
export class BigCitiesComponent implements OnInit{
  @Output() addToFavorites = new EventEmitter<any>();
  @Output() removeFromFavorites = new EventEmitter<any>();

  @Output() showThisCityChart = new EventEmitter<any>();

   //Dati che la citycard component si aspetta in entrata
  cities: City[] = [];
  hourly_index: any;
  
  private appService = inject(AppServiceService);
  
  //Principali città italiane utilizzate come default
  default_cities = [
    'Roma',
    'Torino',
    /*'Milano',
    'Genova',
    'Firenze',
    'Venezia',
    'Napoli',
    'Bari',
    'Cagliari',
    'Palermo'*/
  ]

  constructor() {}

  ngOnInit(): void {

    //Prendo i dati meteo di tute le città di default
    this.getDefaultCitiesMeteo();

  }

  //Funzione per ottenere i dati meteo delle defalt_cities
  getDefaultCitiesMeteo() {
    //Mappo all'interno di default_cities
    const coordinateObservables = this.default_cities.map(city => 
      //Per ognuna di queste città inserisco la stringa di testo ed effettuo una chiamata API per ricevere le coordinate corrispettive
      this.appService.getCoordinates(city).pipe(
        switchMap(data => {
          //Per le città inserite nell'array default_cities, il primo risultato delle richieste api è quello corretto
          const cityData = data.results[0]; 
          //Avendo adesso accesso alle coordinate le utilizzo per poter richiedere tramite un'altra chiamata API le informazioni riguardanti il meteo
          return this.appService.getMeteo(cityData.geometry.lat, cityData.geometry.lng).pipe(
            map(meteoData => ({
              //Per ogni città avrò come risultato l'oggetto cityData precedente ed in aggiunta anche i dati meteo con la chiave 'meteo'
              ...cityData,
              meteo: meteoData
            }))
          )
        })
      )
    );

    //Dopo che le chiamate api vengono eseguite aggiorno le variabili che mi serviranno
    forkJoin(coordinateObservables).subscribe(
      citiesWithMeteo => {
        //Assegno a cities il valore del nuovo oggetto che contiene le città con il proprio meteo 
        this.cities = citiesWithMeteo;
        //Prendo la prima città dell'array (Non è importante che sia la prima. Mi serve solo per poter dare un valore all' hourly_index)
        this.appService.getActualMeteo(this.cities[0]);
        //Uso il getter per accedere al valore ed assegnarlo
        this.hourly_index = this.appService.getHourlyIndex(); 
      },
      error => console.error(error)
    );

  }


  //Funzione che emette al componente padre la città da aggiungere ai preferiti
  onAddToFavorites(city: City): void {
    this.addToFavorites.emit(city);
  }

   //Funzione che emette al componente padre la città da rimuovere dai preferiti
  onRemoveFromFavorites(city: City): void {
    this.removeFromFavorites.emit(city);
  }
   
  showOnChart(city: City): void {
    this.showThisCityChart.emit(city);
  }
}