import { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet varsayılan ikon ayarları
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function SelectionMap({ onKonumSec }) {
    const kampusSiniri = [
        [40.2170, 28.8570], 
        [40.2380, 28.8870]
    ];

    const [position, setPosition] = useState(null);
    const markerRef = useRef(null);

    function MapClickEvent() {
        useMapEvents({
            click: (e) => {
                const tiklananNokta = e.latlng;
                const sinirKutusu = L.latLngBounds(kampusSiniri);
                
                if (sinirKutusu.contains(tiklananNokta)) {
                    setPosition(tiklananNokta);
                    if (onKonumSec) onKonumSec(tiklananNokta.lat, tiklananNokta.lng);
                } else {
                    alert("Lütfen kampüs sınırları içini işaretleyiniz.");
                }
            }
        });
        return null;
    }

    // Sürükleme (Drag) olayları
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const yeniKonum = marker.getLatLng();
                    const sinirKutusu = L.latLngBounds(kampusSiniri);
                    if (sinirKutusu.contains(yeniKonum)) {
                        setPosition(yeniKonum);
                        if (onKonumSec) onKonumSec(yeniKonum.lat, yeniKonum.lng);
                    } else {
                        alert("Lütfen kampüs sınırları dışına çıkmayınız!");
                        marker.setLatLng(position);
                    }
                }
            },
        }),
        [onKonumSec, position],
    );

    return (
        <div style={{ width: "100%", height: "100%", position: "relative", zIndex: 0 }}>
            <MapContainer 
                bounds={kampusSiniri} 
                maxBounds={kampusSiniri}
                maxBoundsViscosity={1.0}
                minZoom={14.5}
                scrollWheelZoom={true} 
                dragging={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <Rectangle 
                    bounds={kampusSiniri} 
                    pathOptions={{ color: '#ff0000', weight: 2, fillOpacity: 0.05, dashArray: '5, 10' }} 
                />

                <MapClickEvent />

                {position && (
                    <Marker
                        draggable={true}
                        eventHandlers={eventHandlers}
                        position={position}
                        ref={markerRef}
                    >
                        <Popup minWidth={90}>
                            <span>Konum Seçildi</span>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}

export default SelectionMap;