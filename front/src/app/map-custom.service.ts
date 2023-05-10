import { EventEmitter, Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import MapboxGeocoder  from '@mapbox/mapbox-gl-geocoder';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class MapCustomService {

  cbAddress: EventEmitter<any> = new EventEmitter<any>();

  mapbox = (mapboxgl as typeof mapboxgl);
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/navigation-night-v1';
  lat = 20.6548608;
  lng = -103.3311266;
  zoom = 3;
  WayPoints: Array<any>=[];
  markerDriver: any = null;

  constructor(
    private httpClient: HttpClient,
    private socket: Socket
  ) {
    this.mapbox.accessToken = environment.mapPk;
  }

  buildMap(): Promise<any>{
    return new Promise((resolve, reject) => {
      // TODO: Build Map
      try {
        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: this.zoom,
          center: [this.lng, this.lat]
        });

        // TODO: here we build the places finder

        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl
        });

        geocoder.on('result', ($event) => {
          const { result } = $event;
          geocoder.clear();
          this.cbAddress.emit(result);
        })

        resolve({
          map: this.map,
          geocoder
        });

      } catch (error) {
        console.log('Error Building Map')
        reject(error);
      }
    });
  }

  loadCoords(coords: any): void {
    const url = [
      `https://api.mapbox.com/directions/v5/mapbox/driving/`,
      `${coords[0][0]},${coords[0][1]};${coords[1][0]},${coords[1][1]}`,
      `?steps=true&geometries=geojson&access_token=${environment.mapPk}`,
    ].join('');

    // get the route
    this.httpClient.get(url).subscribe((res: any) => {

      const data = res.routes[0];
      const route = data.geometry.coordinates;

      this.map.addSource('route', {
        type:'geojson',
        data:{
          type:'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        }
      });

      // Defining Route Layout
      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint:{
          'line-color': 'green',
          'line-width': 6
        }
      });

      this.WayPoints = route;
      this.map.fitBounds([route[0], route[route.length - 1]]), {
        padding: 100,
      };

      this.socket.emit('find-driver', {points: route});
    });
  }

  addMarkerCustom(coords: any): void {
    const el = document.createElement('div');
    el.className = 'marker';
    if (!this.markerDriver) {
      this.markerDriver = new mapboxgl.Marker(el);
    } else {
      this.markerDriver
      .setLngLat(coords)
      .addTo(this.map);
    }
  }

}
