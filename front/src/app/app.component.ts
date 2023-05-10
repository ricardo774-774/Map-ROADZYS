import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MapCustomService } from './map-custom.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('asGeoCoder') asGeoCoder: ElementRef;
  modeInput: 'start' | 'end';
  wayPoints: WayPoints = {start: null, end: null};

  constructor( 
    private mapCustomService: MapCustomService,
    private render2: Renderer2,
    private socket: Socket
  ) {
  }

  ngOnInit(): void {
    this.mapCustomService.buildMap()
      .then(({geocoder, map}) => {
        // this.asGeoCoder
        this.render2.appendChild(this.asGeoCoder.nativeElement,
          geocoder.onAdd(map)
        );
        console.log('*** Todo Bien *** ');
      })
      .catch((err) => {
        console.log('*** Error *** ', err);
      });
    
    // Defines if the location is start or end
    this.mapCustomService.cbAddress.subscribe((getPoint) => {
      if(this.modeInput == 'start'){
        this.wayPoints.start = getPoint;
      }
      if(this.modeInput == 'end'){
        this.wayPoints.end = getPoint;
      }
    });

    this.socket.fromEvent('position')
      .subscribe(({coords}) => {
        console.log(coords);
        this.mapCustomService.addMarkerCustom(coords);
      })
  }

  // Draw Route With the WayPoints
  drawRoute(): void {
    const coords = [
      this.wayPoints.start.center,
      this.wayPoints.end.center
    ];
    this.mapCustomService.loadCoords(coords);
  }

  changeMode(mode: 'start' | 'end'): void {
    this.modeInput = mode;
  }

  testMarker(): void {
    this.mapCustomService.addMarkerCustom( [-103.336937, 20.6548621] )
  }
}

export class WayPoints {
  start: any;
  end: any;
}