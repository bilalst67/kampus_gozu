import './App.css'

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Kampüs Radarı 📍</h1>
      <p>Burası proje ana merkezimiz olacak.</p>
      
      {/* İleride haritamız buraya gelecek */}
      <div style={{ 
        width: '100%', 
        height: '400px', 
        backgroundColor: '#e0e0e0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginTop: '20px'
      }}>
        Harita Alanı (Henüz Yüklenmedi)
      </div>
    </div>
  )
}

export default App