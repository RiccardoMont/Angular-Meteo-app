# MeteoApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.11.

The app has been developed in standalone mode.


# API CALLS 
All the API calls are in app-service.service.ts.
The input text field performs API calls on change to opencagedata.com. This endpoint allows to receive geographical coordinates using the name of the city. 
Once the coordinates have been received, these ones will be used to perform another API call to OpenMeteo receiving several datas (temperature, apparent temperature, wmoCode).
All these datas are manipulated to be showed on the single cityCard.component which is composed by:
- Temperature in Celsius (°C);
- Name of the city;
- Flag of the country using the ISO 3166-1 alpha-2;
- Apparent temperature;
- Weather Icons (custom made) depending on wmocode.


# Commponents
The app has 5 main components:
- app-favourites;
- app-big-cities;
- app-search-box;
- app-graphics;
- app-footer.

# App-favourites
Every city saved on the LocalStorage will be showed on this section. This fuctionality has been enabled thanks to the heart-icon on the cityCard component. 

# App-big-cities
The array default_cities stored in big-cities.component.ts cointains the name of 10 cities, each one of them will be used to perform an Api call to openMeteo. As result the user will see 10 cityCards.

# App-search-box
The searchbar is included in this component and will perform and emit two Api calls:
- the first one to opencagedata.com where coordinates can be received in exhange of the city's name;
- the second one to openmeteo where it is possible to receive all the data about the meteo.
I choose to perform the city research on the input change and not on click beacause most of the app I expierence today do so. Guess is more charming.
After that the searchbar will emit the data to app-search-box which will generate n-number of cityCards.

# App-graphics
It's possible to see a chart after clicking on one cityCard. It will display the temperature trend for the next 24 hours.

# Emits on the code
Several emits functions are in the code. These function give the chance to save and remove the city from favorites (from any section) and to display the change immediately without refreshing the page.


# MyFirstAngularApp
It's my first Angular App! :)
