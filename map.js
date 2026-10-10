'use strict';

const TILE_SIZE = 256;
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const MIN_ZOOM = 4;
const MAX_ZOOM = 18;

function project(lat, lon, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin(lat * Math.PI / 180);
  return {
    x: (lon + 180) / 360 * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  };
}

function unproject(x, y, zoom) {
  const scale = TILE_SIZE * 2 ** zoom;
  const n = Math.PI - 2 * Math.PI * y / scale;
  return {
    lat: 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))),
    lon: x / scale * 360 - 180
  };
}

class TileMap {
  constructor(container, options = {}) {
    this.container = container;
    this.center = options.center || { lat: 52.2873, lon: 76.9674 };
    this.zoom = options.zoom || 12;
    this.tiles = new Map();
    this.markers = [];
    this.pointers = new Map();
    this.pinchDistance = 0;

    this.tileLayer = document.createElement('div');
    this.tileLayer.className = 'map-tiles';
    this.markerLayer = document.createElement('div');
    this.markerLayer.className = 'map-markers';
    container.append(this.tileLayer, this.markerLayer);
    container.insertAdjacentHTML('beforeend', `
      <div class="map-controls">
        <button type="button" data-map="in" aria-label="Приблизить">+</button>
        <button type="button" data-map="out" aria-label="Отдалить">−</button>
        <button type="button" data-map="locate" aria-label="Где я">${options.locateIcon || ''}</button>
      </div>
      <a class="map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a>`);

    this.onLocate = options.onLocate;
    container.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
    container.addEventListener('pointermove', (event) => this.handlePointerMove(event));
    container.addEventListener('pointerup', (event) => this.handlePointerUp(event));
    container.addEventListener('pointercancel', (event) => this.handlePointerUp(event));
    container.addEventListener('wheel', (event) => {
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      this.zoomAt(this.zoom + (event.deltaY < 0 ? 1 : -1), event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    container.addEventListener('dblclick', (event) => {
      const rect = container.getBoundingClientRect();
      this.zoomAt(this.zoom + 1, event.clientX - rect.left, event.clientY - rect.top);
    });
    $$('[data-map]', container).forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      const action = button.dataset.map;
      if (action === 'locate') {
        if (this.onLocate) this.onLocate();
        return;
      }
      this.zoomAt(this.zoom + (action === 'in' ? 1 : -1), container.clientWidth / 2, container.clientHeight / 2);
    }));
    $$('[data-map]', container).forEach((button) => button.addEventListener('pointerdown', (event) => event.stopPropagation()));

    this.observer = new ResizeObserver(() => this.render());
    this.observer.observe(container);
    this.render();
  }

  get size() {
    return { width: this.container.clientWidth || 300, height: this.container.clientHeight || 300 };
  }

  viewOrigin() {
    const { width, height } = this.size;
    const centerPoint = project(this.center.lat, this.center.lon, this.zoom);
    return { left: centerPoint.x - width / 2, top: centerPoint.y - height / 2, width, height };
  }

  render() {
    const { left, top, width, height } = this.viewOrigin();
    const limit = 2 ** this.zoom;
    const needed = new Set();

    for (let tileX = Math.floor(left / TILE_SIZE); tileX <= Math.floor((left + width) / TILE_SIZE); tileX += 1) {
      for (let tileY = Math.floor(top / TILE_SIZE); tileY <= Math.floor((top + height) / TILE_SIZE); tileY += 1) {
        if (tileY < 0 || tileY >= limit) continue;
        const key = `${this.zoom}/${tileX}/${tileY}`;
        needed.add(key);
        let tile = this.tiles.get(key);
        if (!tile) {
          tile = new Image();
          tile.className = 'map-tile';
          tile.alt = '';
          tile.draggable = false;
          tile.src = TILE_URL.replace('{z}', this.zoom).replace('{x}', ((tileX % limit) + limit) % limit).replace('{y}', tileY);
          this.tileLayer.appendChild(tile);
          this.tiles.set(key, tile);
        }
        tile.style.transform = `translate(${tileX * TILE_SIZE - left}px, ${tileY * TILE_SIZE - top}px)`;
      }
    }
    this.tiles.forEach((tile, key) => {
      if (!needed.has(key)) {
        tile.remove();
        this.tiles.delete(key);
      }
    });
    this.markers.forEach((marker) => {
      const point = project(marker.lat, marker.lon, this.zoom);
      marker.element.style.transform = `translate(${point.x - left}px, ${point.y - top}px)`;
    });
  }

  setView(center, zoom) {
    this.center = center;
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    this.render();
  }

  zoomAt(zoom, pixelX, pixelY) {
    const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
    if (next === this.zoom) return;
    const { left, top, width, height } = this.viewOrigin();
    const anchor = unproject(left + pixelX, top + pixelY, this.zoom);
    const anchorPoint = project(anchor.lat, anchor.lon, next);
    this.center = unproject(anchorPoint.x - pixelX + width / 2, anchorPoint.y - pixelY + height / 2, next);
    this.zoom = next;
    this.render();
  }

  fit(points, padding = 46) {
    if (!points.length) return;
    if (points.length === 1) {
      this.setView(points[0], 15);
      return;
    }
    const { width, height } = this.size;
    const lats = points.map((point) => point.lat);
    const lons = points.map((point) => point.lon);
    const center = {
      lat: (Math.min(...lats) + Math.max(...lats)) / 2,
      lon: (Math.min(...lons) + Math.max(...lons)) / 2
    };
    for (let zoom = 17; zoom >= MIN_ZOOM; zoom -= 1) {
      const a = project(Math.max(...lats), Math.min(...lons), zoom);
      const b = project(Math.min(...lats), Math.max(...lons), zoom);
      if (b.x - a.x <= width - padding * 2 && b.y - a.y <= height - padding * 2) {
        this.setView(center, zoom);
        return;
      }
    }
    this.setView(center, MIN_ZOOM);
  }

  addMarker({ lat, lon, html, className = '', onClick }) {
    const element = document.createElement('div');
    element.className = `map-marker ${className}`;
    element.innerHTML = html;
    if (onClick) {
      element.addEventListener('click', (event) => {
        event.stopPropagation();
        onClick();
      });
      element.addEventListener('pointerdown', (event) => event.stopPropagation());
    }
    this.markerLayer.appendChild(element);
    const marker = { lat, lon, element };
    this.markers.push(marker);
    this.render();
    return marker;
  }

  removeMarker(marker) {
    marker.element.remove();
    this.markers = this.markers.filter((item) => item !== marker);
  }

  handlePointerDown(event) {
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.container.setPointerCapture(event.pointerId);
    this.container.classList.add('is-dragging');
    if (this.pointers.size === 2) this.pinchDistance = this.currentPinch();
  }

  handlePointerMove(event) {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    this.pointers.set(event.pointerId, current);

    if (this.pointers.size === 2) {
      const distance = this.currentPinch();
      const rect = this.container.getBoundingClientRect();
      const [first, second] = Array.from(this.pointers.values());
      const middleX = (first.x + second.x) / 2 - rect.left;
      const middleY = (first.y + second.y) / 2 - rect.top;
      if (distance > this.pinchDistance * 1.35) {
        this.zoomAt(this.zoom + 1, middleX, middleY);
        this.pinchDistance = distance;
      } else if (distance < this.pinchDistance * 0.7) {
        this.zoomAt(this.zoom - 1, middleX, middleY);
        this.pinchDistance = distance;
      }
      return;
    }

    const { left, top, width, height } = this.viewOrigin();
    this.center = unproject(left + width / 2 - (current.x - previous.x), top + height / 2 - (current.y - previous.y), this.zoom);
    this.render();
  }

  handlePointerUp(event) {
    this.pointers.delete(event.pointerId);
    if (!this.pointers.size) this.container.classList.remove('is-dragging');
  }

  currentPinch() {
    const [first, second] = Array.from(this.pointers.values());
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  destroy() {
    this.observer.disconnect();
  }
}
