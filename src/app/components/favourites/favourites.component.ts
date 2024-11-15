import { Component, inject, Output, EventEmitter } from '@angular/core';
import { AppServiceService } from '../../services/app-service.service';
import { CommonModule } from '@angular/common';
import { BinarioComponent } from '../binario/binario.component';
import { CityCardComponent } from '../city-card/city-card.component';
import { forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { City } from '../../interfaces/city';


@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [BinarioComponent, CityCardComponent, CommonModule],
  templateUrl: './favourites.component.html',
  styleUrl: './favourites.component.css',
  providers: [AppServiceService],
})
export class FavouritesComponent {
  @Output() updateHasFavorites = new EventEmitter<any>();

  @Output() addToFavorites = new EventEmitter<any>();
  @Output() removeFromFavorites = new EventEmitter<any>();

  @Output() showThisCityChart = new EventEmitter<any>();

  //Dati che la citycard component si aspetta in entrata
  cities: City[] = [];
  hourly_index: any;

  //Variabile di supporto per ordinare i preferiti per la temperatura
  isUp = false;

  constructor(private appService: AppServiceService) {}

  ngOnInit(): void {
    //Ottengo il meteo in riferimento a tutte le città tra i preferiti
    this.getFavoritesCitiesMeteo();
  }

  //Funzione per verificare se ci sono preferiti nel local storage
  updateFavorites(): void {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    //Utilizzo questa assegnazione perché non funzionava senza quadre e rest parameter
    this.cities = [...favorites];
    this.updateHasFavorites.emit();
  }

  //Funzione per ottenere il meteo di tutte le città preferite
  getFavoritesCitiesMeteo() {
    //Prendo il contenuto dal localstorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    //Ciclo dentro l'array ottenuto
    const cityMeteoObservables = favorites.map((cityData: any) => {
      //Per ognuna delle città, inserisco le coordinate ed effettuo la chiamata API che inserirà il meteo all'interno dell'oggetto della città
      return this.appService
        .getMeteo(cityData.geometry.lat, cityData.geometry.lng)
        .pipe(
          map((meteoData) => ({
            ...cityData,
            meteo: meteoData,
          }))
        );
    });

    //Dopo che le chiamate api vengono eseguite aggiorno le variabili che mi serviranno
    forkJoin(cityMeteoObservables).subscribe(
      (updatedFavorites: any) => {
        //Riassegno il valore a cities dato che ora le città avranno dati meteo (o nuovi dati meteo se già li possedevano)
        this.cities = updatedFavorites.filter((city: City) => city !== null);

        //Prendo la prima città dell'array (Non è importante che sia la prima. Mi serve solo per poter dare un valore all' hourly_index)
        this.appService.getActualMeteo(this.cities[0]);

        //Imposto l'hourly_index
        this.hourly_index = this.appService.getHourlyIndex();

        //Aggiorno i dati nel localstorage
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      },
      (error) => console.error(error)
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

  //Emit per comunicare la città da trasmettere poi al grafico
  showOnChart(city: City): void {
    this.showThisCityChart.emit(city);
  }


  //Funzione per ordinare in base alla temperatura
  orderByTemperature(): void {

    //Cambio il valore della variabile di supporto
    this.isUp = !this.isUp;

    //Nel caso positivo ordino per ordine crescente
    if(this.isUp){

      this.cities.sort((cityA, cityB) => {
        const tempA = cityA.meteo.hourly.temperature_2m[this.hourly_index];
        const tempB = cityB.meteo.hourly.temperature_2m[this.hourly_index];
        return tempA - tempB;
      });
      
    } 
    //Altrimenti ordino per ordine decrescente
    else {
      this.cities.sort((cityA, cityB) => {
        const tempA = cityA.meteo.hourly.temperature_2m[this.hourly_index];
        const tempB = cityB.meteo.hourly.temperature_2m[this.hourly_index];
        return tempB - tempA; 
      });
    }

  }


}
