// Función para verificar soporte WebGL
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

// Declarar la variable map en el scope global
let map = null;

mapboxgl.accessToken = "pk.eyJ1IjoiamFzaWx2YTc3MCIsImEiOiJjbWNoc2MwM2sweWRoMmxwcXdxcmowa3htIn0.oSnTqdxblRwYD27LJzn07g";

// Función para agregar la fuente GeoJSON
function addGeoJSONSource() {
  if (map) {
    try {
      map.addSource('kml-data', {
        type: 'geojson',
        data: 'geojson/veredasPamplona.geojson'
      });

      // Agregar una capa para mostrar los datos con colores condicionales
      map.addLayer({
        id: 'veredas-layer',
        type: 'fill',
        source: 'kml-data',
        paint: {
          // Color condicional basado en la descripción
          'fill-color': [
            'case',
            ['==', ['get', 'Descripcion'], 'Sabaneta'], '#FF8C00',  // NARANJA
            ['==', ['get', 'Descripcion'], 'Negavita'], '#FFFF00',  // AMARILLO
            ['==', ['get', 'Descripcion'], 'Naranjo'], '#FF0000',   // ROJO
            ['==', ['get', 'Descripcion'], 'Ulaga'], '#0000FF',     // AZUL
            ['==', ['get', 'Descripcion'], 'Rosal'], '#800080',     // MORADO
            /* default */ '#808080'                                 // GRIS para otros casos
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'Descripcion'], 'Sabaneta'], 0.1,
            ['==', ['get', 'Descripcion'], 'Negavita'], 0.1,
            ['==', ['get', 'Descripcion'], 'Naranjo'], 0.1,
            ['==', ['get', 'Descripcion'], 'Ulaga'], 0.1,
            ['==', ['get', 'Descripcion'], 'Rosal'], 0.1,
            /* default */ 0.6  // Mayor opacidad para casos sin descripción
          ]
        }
      });

      // Agregar contorno con colores condicionales también
      map.addLayer({
        id: 'veredas-outline',
        type: 'line',
        source: 'kml-data',
        paint: {
          // Contorno con el mismo color condicional pero más oscuro
          'line-color': [
            'case',
            ['==', ['get', 'Descripcion'], 'Sabaneta'], '#CC7000',  // NARANJA OSCURO
            ['==', ['get', 'Descripcion'], 'Negavita'], '#CCCC00',   // AMARILLO OSCURO
            ['==', ['get', 'Descripcion'], 'Naranjo'], '#CC0000',    // ROJO OSCURO
            ['==', ['get', 'Descripcion'], 'Ulaga'], '#0000CC',      // AZUL OSCURO
            ['==', ['get', 'Descripcion'], 'Rosal'], '#660066',      // MORADO OSCURO
            /* default */ '#080808'                                  // GRIS OSCURO
          ],
          'line-width': 1
        }
      });

      console.log('GeoJSON cargado exitosamente con colores condicionales');
      
    } catch (error) {
      console.error('Error al cargar GeoJSON:', error);
    }
  } else {
    console.error('El mapa no está disponible');
  }
}

// Verificar soporte antes de crear el mapa
if (!checkWebGLSupport()) {
  document.getElementById('map-container').innerHTML = 
    '<div style="padding: 20px; text-align: center; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;">' +
    '<h3>WebGL no está disponible</h3>' +
    '<p>Tu navegador no soporta WebGL o está deshabilitado.</p>' +
    '<p>Por favor, habilita WebGL o usa un navegador compatible.</p>' +
    '</div>';
} else {
  try {
    map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-72.65019340000001, 7.3783551], // Coordenadas de Pamplona, Norte de Santander
      zoom: 13,
      preserveDrawingBuffer: true, // Ayuda con algunos problemas de WebGL
      failIfMajorPerformanceCaveat: false // Permite renderizado por software
    });

    // Cuando el mapa se carga completamente
    map.on('load', () => {
      console.log('Mapa cargado exitosamente');
      
      // Agregar el GeoJSON una vez que el mapa esté listo
      addGeoJSONSource();
      
      // Agregar controles de navegación
      map.addControl(new mapboxgl.NavigationControl());
      
      // Agregar control de pantalla completa
      map.addControl(new mapboxgl.FullscreenControl());
    });

    // Manejar errores del mapa después de la inicialización
    map.on('error', (e) => {
      console.error('Map error:', e);
      document.getElementById('map-container').innerHTML = 
        '<div style="padding: 20px; text-align: center; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">' +
        '<h3>Error al cargar el mapa</h3>' +
        '<p>Hubo un problema al cargar el mapa. Por favor, recarga la página.</p>' +
        '<p><small>Error: ' + e.error.message + '</small></p>' +
        '</div>';
    });

    // Manejo de eventos de interacción con las veredas
    map.on('click', 'veredas-layer', (e) => {
      const properties = e.features[0].properties;
      
      // Crear popup con información de la vereda
      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="padding: 10px;">
            <h4>${properties.Name || 'Vereda'}</h4>
            <p><strong>Información:</strong> ${properties.Descripcion || 'No disponible'}</p>
          </div>
        `)
        .addTo(map);
    });

    // Cambiar cursor cuando se pasa sobre las veredas
    map.on('mouseenter', 'veredas-layer', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'veredas-layer', () => {
      map.getCanvas().style.cursor = '';
    });

  } catch (error) {
    console.error('Map initialization failed:', error);
    document.getElementById('map-container').innerHTML = 
      '<div style="padding: 20px; text-align: center; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">' +
      '<h3>Error de inicialización</h3>' +
      '<p>No se pudo inicializar el mapa: ' + error.message + '</p>' +
      '</div>';
  }
}