import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { AppServiceService } from '../../services/app-service.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { BinarioComponent } from '../binario/binario.component';
import { CityCardComponent } from '../city-card/city-card.component';
import { FavouritesComponent } from '../favourites/favourites.component';
import { City } from '../../interfaces/city';


@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [
    HttpClientModule,
    FormsModule,
    CommonModule,
    SearchbarComponent,
    BinarioComponent,
    CityCardComponent,
  ],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css',
  providers: [AppServiceService, FavouritesComponent],
})
export class SearchBoxComponent {
  @Output() addToFavorites = new EventEmitter<any>();
  @Output() removeFromFavorites = new EventEmitter<any>();

  //Dati che la citycard component si aspetta in entrata
  cities: City[] = [];
  hourly_index: any;

  @Output() showThisCityChart = new EventEmitter<any>();

  private appService = inject(AppServiceService);

  constructor() {}

  //Funzione per ricevere i dati dal componente searchbar
  receiveData(data: any) {
    this.cities = data;
    this.appService.getActualMeteo(this.cities[0]);
    this.hourly_index = this.appService.getHourlyIndex();
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
