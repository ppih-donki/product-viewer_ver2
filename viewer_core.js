
let allMarkers = [];
let errorProducts = [];

document.addEventListener('DOMContentLoaded', async function () {
  const storeSelector = document.getElementById('storeSelector');
  const floorSelector = document.getElementById('floorSelector');
  const imageTypeSelect = document.getElementById('imageTypeSelect');
  const csvInput = document.getElementById('csvInput');
  const exportBtn = document.getElementById('exportBtn');
  const mapContainer = document.getElementById('mapContainer');
  const productList = document.getElementById('productList');
  const errorList = document.getElementById('errorList');

  async function loadMarkerData() {
    const res = await fetch('data/all_marker_positions.json');
    allMarkers = await res.json();
    const stores = [...new Set(allMarkers.map(d => d.store_id))];
    storeSelector.innerHTML = '<option value="">店舗選択</option>';
    stores.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      storeSelector.appendChild(opt);
    });
  }

  function populateFloors(storeId) {
    const floors = [...new Set(allMarkers.filter(d => d.store_id === storeId).map(d => d.floor))];
    floorSelector.innerHTML = '<option value="">フロア選択</option>';
    floors.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      floorSelector.appendChild(opt);
    });
  }

  function drawMarkers(storeId, floor, imageType) {
    const markers = allMarkers.filter(d => d.store_id === storeId && d.floor === floor);
    const imgPath = `images/${storeId}_${floor}_${imageType}.jpg`;
    mapContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = imgPath;
    img.style.width = "100%";
    img.onload = () => {
      markers.forEach((m, idx) => {
        const marker = document.createElement('div');
        marker.className = 'marker';
        marker.style.left = (m.x * img.width) + 'px';
        marker.style.top = (m.y * img.height) + 'px';
        marker.textContent = idx + 1;
        marker.title = m.shelf_id;
        marker.addEventListener('click', () => showProductList(m));
        mapContainer.appendChild(marker);
      });
    };
    mapContainer.appendChild(img);
  }

  function showProductList(marker) {
    productList.innerHTML = '';
    (marker.products || []).forEach(p => {
      const div = document.createElement('div');
      div.textContent = `JAN: ${p.jan}, 商品名: ${p.name}`;
      div.addEventListener('click', () => {
        errorProducts.push(p);
        renderErrorList();
      });
      productList.appendChild(div);
    });
  }

  function renderErrorList() {
    errorList.innerHTML = '';
    errorProducts.forEach((p, i) => {
      const li = document.createElement('li');
      li.textContent = `JAN: ${p.jan}, 商品名: ${p.name}`;
      errorList.appendChild(li);
    });
  }

  function exportCSV() {
    const csv = Papa.unparse(errorProducts);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'error_products.csv';
    a.click();
  }

  storeSelector.addEventListener('change', () => {
    populateFloors(storeSelector.value);
  });

  floorSelector.addEventListener('change', () => {
    const s = storeSelector.value;
    const f = floorSelector.value;
    const t = imageTypeSelect.value;
    if (s && f) drawMarkers(s, f, t);
  });

  imageTypeSelect.addEventListener('change', () => {
    const s = storeSelector.value;
    const f = floorSelector.value;
    const t = imageTypeSelect.value;
    if (s && f) drawMarkers(s, f, t);
  });

  csvInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        console.log('CSV Loaded:', results.data);
        // CSVからJANリストだけ読み取って、誤登録品候補として扱う
        errorProducts = results.data.map(row => ({
          jan: row.JAN || row.jan,
          name: row.商品名 || row.name || ''
        }));
        renderErrorList();
      }
    });
  });

  exportBtn.addEventListener('click', exportCSV);

  await loadMarkerData();
});
