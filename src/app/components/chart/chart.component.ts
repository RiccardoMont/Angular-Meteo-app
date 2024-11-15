import { Component, Input } from '@angular/core';
import { GraphicsComponent } from '../graphics/graphics.component';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [GraphicsComponent],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent {
  @Input() hourlyTemperatures: number[] = [];
  @Input() hourlyLabels: string[] = [];

  public lineChartData = {
    labels: this.hourlyLabels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: this.hourlyTemperatures,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };

  public lineChartOptions = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Temperatura (°C)'
        }
      }
    }
  };

  ngOnInit(): void {}

}
