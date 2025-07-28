
document.addEventListener('DOMContentLoaded', async function () {
  const storeSelector = document.getElementById('storeSelector');
  const floorSelector = document.getElementById('floorSelector');
  const imageTypeSelect = document.getElementById('imageTypeSelect');
  const mapContainer = document.getElementById('mapContainer');

  let allMarkers = [];

  async function loadMarkerData() {
    try {
      const response = await fetch('data/all_marker_positions.json');
      if (!response.ok) throw new Error('fetch失敗: ' + response.statusText);
      const data = await response.json();
      allMarkers = data;
      populateStoreSelector();
    } catch (e) {
      console.error('JSON読み込み失敗', e);
      alert('JSONが読み込めません。GitHub Pagesなど https:// 経由で開いてください。');
    }
  }

  function populateStoreSelector() {
    const stores = [...new Set(allMarkers.map(d => d.store_id))].sort();
    storeSelector.innerHTML = '<option value="">店舗選択</option>';
    stores.forEach(id => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = id;
      storeSelector.appendChild(opt);
    });
  }

  function populateFloorSelector(storeId) {
    const floors = [...new Set(allMarkers.filter(d => d.store_id === storeId).map(d => d.floor))];
    floorSelector.innerHTML = '<option value="">フロア選択</option>';
    floors.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      floorSelector.appendChild(opt);
    });
  }

  function loadMapImage(storeId, floor, type) {
    const imgPath = `images/${storeId}_${floor}_${type}.jpg`;
    mapContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = imgPath;
    img.alt = 'マップ画像';
    mapContainer.appendChild(img);
  }

  storeSelector.addEventListener('change', () => {
    const storeId = storeSelector.value;
    populateFloorSelector(storeId);
  });

  floorSelector.addEventListener('change', () => {
    const storeId = storeSelector.value;
    const floor = floorSelector.value;
    const type = imageTypeSelect.value;
    if (storeId && floor) {
      loadMapImage(storeId, floor, type);
    }
  });

  imageTypeSelect.addEventListener('change', () => {
    const storeId = storeSelector.value;
    const floor = floorSelector.value;
    const type = imageTypeSelect.value;
    if (storeId && floor) {
      loadMapImage(storeId, floor, type);
    }
  });

  await loadMarkerData();
});
