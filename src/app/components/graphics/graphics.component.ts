import { Component, Input, SimpleChanges } from '@angular/core';
import { Chart, registerables, scales } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Ticks } from 'chart.js/dist';

Chart.register(...registerables);
Chart.register(ChartDataLabels);
@Component({
  selector: 'app-graphics',
  standalone: true,
  imports: [],
  templateUrl: './graphics.component.html',
  styleUrl: './graphics.component.css',
})
export class GraphicsComponent {
  @Input() chartData: any;
  @Input() cityName: string | undefined;

  hourlyLabels: any = [];
  hourlyTemperatures: any = [];

  //Array di supporto che raccoglie gli indici delle ore per il grafico
  hours_indexes: any = [];

  public config: any = {
    type: 'line',
    data: {
      labels: this.hourlyLabels,
      datasets: [
        {
          data: this.hourlyTemperatures,
          fill: false,
          borderColor: 'rgb(75, 75, 75)',
          background: 'rgb(0, 0, 0)',
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: true,
          },
        },
        y: {
          display: false,
          ticks: {
            stepSize: 1, // Regola se desideri un intervallo specifico
          },
        },
      },
      legend: {
        display: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true, // Attiva i tooltip
          callbacks: {
            label: (context: any) => `${context.raw} °C`, // Mostra la temperatura con l'unità
          },
        },
        datalabels: {
          align: 'top', // Posiziona sopra il punto
          color: 'black', // Colore del testo
          font: {
            size: 12, // Dimensione del testo
          },
          formatter: (value: any) => `${value} °C`, // Mostra la temperatura con unità
        },
      },
    },
  };
  chart: any;

  ngOnInit(): void {
   
  }

  ngOnChanges(changes: SimpleChanges): void {
    
      //Controllo se i dati del grafico sono cambiati
      if (changes['chartData'] || changes['cityName']) {
        //Se il chart è undefined e lo sarà finchè non clicco su una card allora lo inizializzo
        if (this.chart === undefined) {
        this.chart = new Chart('myChart', this.config);
      }
      this.newChartData();
    }
  }

  //Funzione per aggiornare il grafico con i nuovi dati
  newChartData(): void {
    //Condizionale per evitare l'undefined in console
    if (this.chartData?.minutely_15.time) {
      //Imposto l'array di supporto ad array vuoto per evitare che ricerche precedenti lo riempiano
      this.hours_indexes = [];
      //Prendo tutti gli orari delle prossime 24h
      const hours = this.chartData.minutely_15.time;
      //Ciclo nell'array e prendo tutti gli indici degli orari che terminano con '00'
      hours.forEach((hour: string) => {
        if (hour.endsWith('00')) {
          //Inserisco tutti questi indici nell'array di supporto
          this.hours_indexes.push(hours.indexOf(hour));
        }
      });

      //Imposto hourlyLabels ad array vuoto per evitare che ricerche precedenti lo riempiano
      this.hourlyLabels = [];

      //Pusho in hourlyLabels tutti gli orari che terminano con '00' ed applico lo slice in modo da inserire solo l'orario dalla stringa in formato yyyy-mm-ddThh:mm
      hours.forEach((hour: string) => {
        if (hour.endsWith('00')) {
          this.hourlyLabels.push(hour.slice(11));
        }
      });

      //Imposto hourlyTemperature ad array vuoto per evitare che ricerche precedenti lo riempiano
      this.hourlyTemperatures = [];

      //Utilizzo tutti gli indici dell'array di supporto per ricavare tutte le temperature corrispondenti agli orari che mostrerò
      this.hours_indexes.forEach((index_temperature: number) => {
        this.hourlyTemperatures.push(
          this.chartData.minutely_15.temperature_2m[index_temperature]
        );
      });

      //Calcolo dinamicamente minTemp e maxTemp
      const minTemp = Math.min(...this.hourlyTemperatures) - 3;
      const maxTemp = Math.max(...this.hourlyTemperatures) + 3;

      //Aggiorno il config del grafico
      this.chart.options.scales.y.min = minTemp;
      this.chart.options.scales.y.max = maxTemp;

      //Aggiorno il grafico con i nuovi dati
      this.chart.data.labels = this.hourlyLabels;
      this.chart.data.datasets[0].data = this.hourlyTemperatures;
      this.chart.update();
    }
  }
}
