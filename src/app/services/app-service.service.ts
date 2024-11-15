import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  hourly_index: number|undefined;

  //Proprietà che vanno a comporre la stringa per la chiamata API
  private apiUrl = 'https://api.open-meteo.com/v1/forecast?';
  private openCageCoordinates = 'https://api.opencagedata.com/geocode/v1/json?'
  private apiItaOnly = '&country=IT';
  private openCageKey = '&key=e3cbde286351474b9d5c0537026d870e';

  constructor(private http: HttpClient) { }

  //Chiamata api ad OpenCage che in cambio del nome della città mi restituisce le coordinate geografiche
  getCoordinates(city: string): Observable<any>{

    return this.http.get(`${this.openCageCoordinates}q=${city}&language=it${this.openCageKey}`);

  }

  //Chiamata api ad Open-meteo
  getMeteo(lat: number, lng: number){

    //Inserendo latitudine e longitudine chiedo di avere is_day (per determinare giorno e notte), la temperatura, la temperatura percepita ed il wmo code (per determinare il meteo)
    return this.http.get(`${this.apiUrl}latitude=${lat}&longitude=${lng}&current=is_day&hourly=temperature_2m,apparent_temperature,weather_code`);

  }

  //L'api open meteo mi restituisce diversi array tra cui quello hourly, i cui indici corrisponderanno ognuno ad un'ora ben specifica. Tramite questa funzione ciclo per trovare l'indice che corrisponde alla fascia di oraria presente e lo salvo nella variabile hourly_index che verrà poi passata al city-card.component
  getActualMeteo(city: any){
    const now = Date.now();
    
      for(let i=0; i<city.meteo.hourly.time.length; i++){

        const dateFromHourlyArray = new Date(city.meteo.hourly.time[i]);

        const timestampArrayHourly = dateFromHourlyArray.getTime();

        if(now === timestampArrayHourly){
          this.hourly_index = i;
          return
        } else if (now < timestampArrayHourly){
          this.hourly_index = (i-1);
          return
        } else {
          console.log('sono posteriore');
        }

      }
      
  }


  //Getter per l'hourly_index
  getHourlyIndex(): number | undefined {
    return this.hourly_index;
  }


  //Chiamata API per ottenere le le temperature, di una determinata città, delle successive 24h
  getMeteo24h(lat: number, lng: number){
    return this.http.get(`${this.apiUrl}latitude=${lat}&longitude=${lng}&minutely_15=temperature_2m&hourly=temperature_2m&forecast_minutely_15=96`)
  }

}
