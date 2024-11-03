"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { Marker, MarkerClusterer } from "@googlemaps/markerclusterer";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

const API_KEY = "AIzaSyAIceB8-w-tSsn_JwRfRUuuPBQie_ri8zs";

interface Poi {
  key: string;
  location: { lat: number; lng: number };
}

const allMarkers = [
  {
    key: "operaHouse",
    location: { lat: -33.8567844, lng: 151.213108 },
  },
  {
    key: "tarongaZoo",
    location: { lat: -33.8472767, lng: 151.2188164 },
  },
  {
    key: "manlyBeach",
    location: { lat: -33.8209738, lng: 151.2563253 },
  },
  {
    key: "hyderPark",
    location: { lat: -33.8690081, lng: 151.2052393 },
  },
  {
    key: "theRocks",
    location: { lat: -33.8587568, lng: 151.2058246 },
  },
  {
    key: "circularQuay",
    location: { lat: -33.858761, lng: 151.2055688 },
  },
  {
    key: "harbourBridge",
    location: { lat: -33.852228, lng: 151.2038374 },
  },
  {
    key: "kingsCross",
    location: { lat: -33.8737375, lng: 151.222569 },
  },
  {
    key: "botanicGardens",
    location: { lat: -33.864167, lng: 151.216387 },
  },
  {
    key: "museumOfSydney",
    location: { lat: -33.8636005, lng: 151.2092542 },
  },
  {
    key: "maritimeMuseum",
    location: { lat: -33.869395, lng: 151.198648 },
  },
  {
    key: "kingStreetWharf",
    location: { lat: -33.8665445, lng: 151.1989808 },
  },
  { key: "aquarium", location: { lat: -33.869627, lng: 151.202146 } },
  {
    key: "darlingHarbour",
    location: { lat: -33.87488, lng: 151.1987113 },
  },
  {
    key: "barangaroo",
    location: { lat: -33.8605523, lng: 151.1972205 },
  },
];

const PoiMarkers = (props: { pois: Poi[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.LatLng | null>(null);

  const icon = {
    url: "big-cluster.png",
    scaledSize: new google.maps.Size(40, 40),
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderer = {
    render({
      count,
      position,
    }: {
      count: number;
      position: google.maps.LatLng;
    }) {
      return new google.maps.Marker({
        label: { text: String(count), color: "white", fontSize: "15px" },
        position,
        icon,
        // adjust zIndex to be above other markers
        zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      });
    },
  };

  // Initialize MarkerClusterer, if the map has changed
  useEffect(() => {
    if (!map) return;

    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map, renderer });
    }
  }, [map, renderer]);

  // Update markers, if the markers array has changed
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  const handleClick = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      if (!map) return;
      if (!ev.latLng) return;

      setSelectedMarker(ev.latLng);
      // console.log("marker clicked:", ev.latLng.toString());
      map.panTo(ev.latLng);
    },
    [map]
  );

  const isPoiSelected = (poi: Poi) =>
    selectedMarker?.toJSON().lat === poi.location.lat &&
    selectedMarker?.toJSON().lng === poi.location.lng;

  return (
    <>
      {props.pois.map((poi: Poi) => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={(marker) => setMarkerRef(marker, poi.key)}
          onClick={handleClick}
          style={{
            borderWidth: isPoiSelected(poi) ? 5 : 0,
            borderRadius: "50%",
            borderColor: "#FFDC0A",
          }}
        >
          <Image
            alt="hey-world"
            width="20"
            height="20"
            src="/small-cluster.png"
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

const GoogleMap = () => {
  const map = useMap();
  const [visibleMarkers, setVisibleMarkers] = useState<Poi[]>([]);

  map?.addListener("bounds_changed", () => {
    const bounds = map?.getBounds();
    if (!bounds) return;

    const visibleMarkers = allMarkers.filter((marker) => {
      // show only if the marker is inside the boundries
      const markerPosition = new google.maps.LatLng(
        marker.location.lat,
        marker.location.lng
      );
      return bounds.contains(markerPosition);
    });

    setVisibleMarkers(visibleMarkers);
  });

  return (
    <>
      <Map
        mapId="6d981d098c150f99"
        style={{ width: "100vw", height: "100vh" }}
        defaultCenter={{ lat: -33.8567844, lng: 151.213108 }}
        defaultZoom={12}
        gestureHandling={"greedy"}
      >
        <PoiMarkers pois={allMarkers} />
      </Map>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          width: "90vw",
        }}
      >
        {visibleMarkers.map((marker) => (
          <div
            style={{
              margin: 5,
              width: 250,
              height: 100,
              backgroundColor: "white",
              flex: "0 0 auto",
              color: "black",
              textAlign: "center",
            }}
            key={marker.key}
          >
            {marker.key}
          </div>
        ))}
      </div>
    </>
  );
};

export default function Home() {
  return (
    <APIProvider apiKey={API_KEY}>
      <GoogleMap />
    </APIProvider>
  );
}
