// ruta.js
export function cargarRutaUlaga(map) {
  // Ruta al archivo GeoJSON
  const rutaGeoJSON = './geojson/RutaUlaga.geojson';
  
  try {
    // Añadir fuente
    map.addSource('ruta-source-RutaUlaga', {
      type: 'geojson',
      data: rutaGeoJSON
    });

    // Añadir capa para la línea
    map.addLayer({
      id: 'ruta-linea-RutaUlaga',
      type: 'line',
      source: 'ruta-source-RutaUlaga',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#FF0000',
        'line-width': 5,
        'line-opacity': 0.8
      },
      filter: ['==', '$type', 'LineString']
    });
    
    // Añadir puntos para los marcadores
    map.addLayer({
      id: 'ruta-puntos-RutaUlaga',
      type: 'circle',
      source: 'ruta-source-RutaUlaga',
      paint: {
        'circle-radius': 8,
        'circle-color': '#3b82f6',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      },
      filter: ['==', '$type', 'Point']
    });

    // Añadir etiquetas para los puntos
    map.addLayer({
      id: 'ruta-etiquetas-RutaUlaga',
      type: 'symbol',
      source: 'ruta-source-RutaUlaga',
      layout: {
        'text-field': ['get', 'Name'],
        'text-size': 12,
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 1
      },
      filter: ['==', '$type', 'Point']
    });

    console.log('Capas de ruta añadidas correctamente');
  } catch (error) {
    console.error('Error al cargar la ruta:', error);
    alert('Error al cargar la ruta: ' + error.message);
  }
}