import React, { useState, useEffect } from 'react';
import './App.css'

function App() {
    return(
        <div style={{padding:'20px'}}>
            <h1>Kampüs Radarı 📍</h1>
            <p style={{fontFamily:'arial'}}>Burası proje üssümüz Burda: <br />
                Popüler sorunlar <br/>
                Kaç sorun paylaştın <br/>
                ...
                </p>
            {/*Ileride harita buray gelcek*/}
            <div tsyle={{
                widht:'80%',
                height:'400px',
                bacgroundColor:'gray',
                display:'flex',
                alignitems:'center',
                justifyContent:'center',
            }}>
                Harita burda gözükecek
            </div>
        </div>
    )
}

export default App;