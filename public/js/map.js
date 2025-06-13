const [lng, lat] = coordinates;
const leafletCoords = [lat, lng];

const map = L.map('map').setView(leafletCoords, 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.marker(leafletCoords)
  .addTo(map)
  .bindPopup('Property Location')
  .openPopup();
