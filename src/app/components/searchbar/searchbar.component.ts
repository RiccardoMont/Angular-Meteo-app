import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { AppServiceService } from '../../services/app-service.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { City } from '../../interfaces/city';


@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
  providers: [AppServiceService],
})
export class SearchbarComponent {
  @Output() sendDataEvent = new EventEmitter<any>();

  cities: City[] = [];
  hourly_index: any;
  private appService = inject(AppServiceService);

  constructor() {}

  //Funzione per avere i dati meteo delle città che si stanno ricercando
  getCitiesMeteo(event: Event) {
    //Prendo il valore del campo testo input per la ricerca delle citta
    const cityName = (<HTMLInputElement>event.target).value;

    //Eseguo la chiamata API per ottenere le coordinate inserendo il nome
    this.appService
      .getCoordinates(cityName)
      .pipe(
        switchMap((data) => {
          const cities = data.results.filter((city: City) => //Utilizzo prima il filter per poter prendere solo le città o paesi ed evitare altri 'luoghi geografici' che hanno una composizione dell'oggetto leggermente diversa e visivamente possono creare dei duplicati che però non si comportano come vorrei
            city.components.city || city.components.town || city.components._normalized_city
          ).map((city: City) => ({
            ...city,
          }));

          //Mappo le città a un array di osservabili che richiedono i dati meteo per ogni città
          const meteoObservables = cities.map((city: City) =>
            this.appService.getMeteo(city.geometry.lat, city.geometry.lng).pipe(
              map((meteoData) => ({
                ...city,
                meteo: meteoData,
              }))
            )
          );

          //Uso forkJoin per combinare tutti gli osservabili dei dati meteo
          return forkJoin(meteoObservables);
        })
      )
      .subscribe(
        (citiesWithMeteo: any) => {
          //Aggiorno il vaolere di cities che sarà poi passato al search-box component
          this.cities = citiesWithMeteo;
          // Se necessario, puoi anche emettere l'evento per comunicare i dati al componente padre
          this.sendDataEvent.emit(this.cities);
        },
        (error) => console.error(error)
      );
  }
}
