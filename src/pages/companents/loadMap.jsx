import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/map.css';

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

function Map({ sorunlar, onKonumSec }) {
    const kampusSiniri = [
        [40.2170, 28.8570], 
        [40.2380, 28.8870]
    ];
    
    const [tiklananKonum, setTiklananKonum] = useState(null); 

    // Harita tıklama olaylarını dinleyen alt bileşen
    function MapEvents() {
        useMapEvents({
            click: (e) => {
                const tiklananNokta = e.latlng;
                const sinirKutusu = L.latLngBounds(kampusSiniri);

                if (sinirKutusu.contains(tiklananNokta)) {
                    setTiklananKonum([tiklananNokta.lat, tiklananNokta.lng]);
                    if (onKonumSec) {
                        onKonumSec(tiklananNokta.lat, tiklananNokta.lng);
                    }
                } else {
                    alert("Lütfen sadece kampüs sınırları içini seçiniz!");
                }
            }
        });
        return null;
    }

    return (
        <div className="harita-kutusu">
            <MapContainer 
                bounds={kampusSiniri} 
                maxBounds={kampusSiniri}
                maxBoundsViscosity={1.0}
                minZoom={14.3}
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
                    pathOptions={{ color: '#ff0000', weight: 2, fillOpacity: 0.0 }} 
                />

                <MapEvents />

                {/* Seçilen Konum İşaretçisi */}
                {tiklananKonum && (
                    <Marker position={tiklananKonum}>
                        <Popup>
                            Seçilen Konum <br />
                            {tiklananKonum[0].toFixed(5)}, {tiklananKonum[1].toFixed(5)}
                        </Popup>
                    </Marker>
                )} 

                {/* Kayıtlı Sorun İşaretçileri */}
                {sorunlar && sorunlar.map((sorun) => (
                    <Marker 
                        key={sorun.SorunID || Math.random()}
                        position={[parseFloat(sorun.Latitude), parseFloat(sorun.Longitude)]}
                    >
                        <Popup>
                            <strong>{sorun.Baslik}</strong> <br />
                            {sorun.KonumMetni} <br />
                            <hr style={{margin: "5px 0"}}/>
                            <small>{sorun.Aciklama}</small>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default Map;