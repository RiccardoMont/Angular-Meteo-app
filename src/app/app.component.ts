import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppServiceService } from '../app/services/app-service.service';
import { RouterOutlet } from '@angular/router';
import { BigCitiesComponent } from './components/big-cities/big-cities.component';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { FavouritesComponent } from './components/favourites/favourites.component';
import { CommonModule, NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import { GraphicsComponent } from './components/graphics/graphics.component';
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BigCitiesComponent,
    SearchBoxComponent,
    FavouritesComponent,
    CommonModule,
    GraphicsComponent,
    FooterComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [AppServiceService, FavouritesComponent],
})
export class AppComponent {
  //Utilizzo il viewchild per poter aggiornare visivamente il numero di card all'interno di favorites component
  @ViewChild('favoritesComponent', { static: false })
  favoritesComponent!: FavouritesComponent;

  title = 'MeteoApp';

  //Proprietà di riferimento per definire la visualizzazione del componente favorites
  hasFavorites = false;
  //Tutte le card sono sottoscritte a favoritesChanged per poter aggiornare la propria proprietà isClicked
  favoritesChanged = new Subject<void>();

  //Proprietà da passare al graphic component
  chartData: any;
  cityName: string | undefined;

  constructor(public appService: AppServiceService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    //Definisco al caricamento se il componente favorites dorà essere visualizzato o meno
    this.updateHasFavorites();

  }

  //Funzione per determinare il valore di hasFavorites
  updateHasFavorites(): void {
    //Condizione aggiunta per evitare l'errore server side nel terminale
    if (typeof localStorage !== 'undefined') {
      // Verifica se ci sono preferiti nel localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      this.hasFavorites = favorites.length > 0;
    }
  }

  //Funzione per aggiungere una città sia al localstorage sia all'array 'cities' contenunto nel favoritescomponent che darà possibilità di caricare le card visivamente
  addToFavorites(city: any): void {
    // Aggiungo la città ai preferiti nel componente favoritescomponent
    this.favoritesComponent?.cities.push(city);

    //Condizione aggiunta per evitare l'errore server side nel terminale
    if (typeof localStorage === 'undefined') return;
    //Prendo l'array dallo storage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    //Variabile booleana per determinare se la città è già tra i preferiti
    const isAlreadyFavorite = favorites.some((fav: any) => {
      //Effettuo il confronto applicando lo stringify ad entrambi altrimenti, anche se gli oggetti sono identici, mi dà false come risultato
      const isEqual = JSON.stringify(fav) === JSON.stringify(city);
      fav === city;

      return isEqual;
    });

    //Se non è già tra i preferiti, aggiungo la città allo storage
    if (!isAlreadyFavorite) {
      favorites.push(city);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    //Richiamo la funzione che cambiera il valore della proprietà di controllo su true dato che ci sarà almeno un preferito adesso
    this.updateHasFavorites();

    //Utilizzo il next per poter notificare il cambiamento a tutti i componenti sottoscritti
    this.favoritesChanged.next();
  }

  //Funzione per eliminare una città sia al localstorage sia all'array 'cities'
  removeFromFavorites(city: any): void {
    //Condizione aggiunta per evitare l'errore server side nel terminale
    if (typeof localStorage === 'undefined') return;
    //Prendo l'array
    let favoritesLocal = JSON.parse(localStorage.getItem('favorites') || '[]');

    //Definisco l'indice che mi servirà per lo splice
    const indexLocal = favoritesLocal.findIndex(
      (fav: any) =>
        fav.geometry.lat === city.geometry.lat &&
        fav.geometry.lng === city.geometry.lng
    );

    //Se verrà trovato un riscontro e quindi un indice procedo ad eliminare l'elemento dall'array dello storage
    if (indexLocal !== -1) {
      favoritesLocal.splice(indexLocal, 1);
      localStorage.setItem('favorites', JSON.stringify(favoritesLocal));
      console.log(`Removed from favorites: ${JSON.stringify(city.geometry)}`);
    }

    //Prendo in esame l'array 'cities' dal favoritescomponent per poter aggiornare la visualizzazione delle card nel componente favoritesComponent
    let favorites = this.favoritesComponent?.cities;

    //Prendo l'indice per lo splice
    const index = favorites.findIndex(
      (fav: any) =>
        fav.geometry.lat === city.geometry.lat &&
        fav.geometry.lng === city.geometry.lng
    );

    //Se trovo l'indice effettuo lo splice
    if (index !== -1) {
      favorites.splice(index, 1);
    }

    //Richiamo la funzione che cambiera il valore della proprietà di controllo su true dato che ci sarà almeno un preferito adesso
    this.updateHasFavorites();

    //Utilizzo il next per poter notificare il cambiamento a tutti i componenti sottoscritti
    this.favoritesChanged.next();
  }

  isLoading = false;

  //Funzione che, eseguita dall'emit proveniente da citycardcomponent, effettua una chiamata API con i dati di quella città per ottenere le previsioni del tempo delle 24ore successive da passare al grafico 
  showOnChart(city: any): void {
    console.log(city);

    this.isLoading = true;
    this.appService.getMeteo24h(city.geometry.lat, city.geometry.lng).subscribe(
      (dati) => {
        this.chartData = dati; 
        this.cityName = city.components.city || city.components.town || city.components._normalized_city;
        console.log('Dati grafico:', this.chartData);
        console.log('Nome città:', this.cityName);
        this.isLoading = false;
        this.cdr.detectChanges();
      },

      (errore) => {
        console.error('Errore durante il recupero dei dati:', errore); 
        this.isLoading = false;
      }
    );
  }

}
