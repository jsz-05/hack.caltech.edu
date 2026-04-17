"use strict";

const liveConfig = {
  hackingStartsAt: "2026-04-24T17:00:00-07:00",
  hackingEndsAt: "2026-04-26T12:00:00-07:00",
  googleMapsApiKey: "",
  mapTileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  mapAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  googleDocUrl: "https://docs.google.com/document/d/e/2PACX-EXAMPLE/pub",
  devpostUrl: "https://devpost.com/software/example-project",
  mapBounds: {
    north: 34.1419,
    south: 34.1354,
    west: -118.1288,
    east: -118.1211
  },
  locations: [
    {
      id: "opening",
      name: "Opening Ceremony",
      type: "ceremony",
      description: "Check-in, opening remarks, and kickoff.",
      lat: 34.1377,
      lng: -118.1253
    },
    {
      id: "judging",
      name: "Judging Hall",
      type: "ceremony",
      description: "Final demos and project judging.",
      lat: 34.1386,
      lng: -118.1236
    },
    {
      id: "workspace",
      name: "Main Hacking Space",
      type: "workspace",
      description: "Primary workspace for teams throughout the weekend.",
      lat: 34.1379,
      lng: -118.1267
    },
    {
      id: "parking",
      name: "Parking",
      type: "logistics",
      description: "Recommended arrival and parking location.",
      lat: 34.1364,
      lng: -118.1248
    }
  ],
  schedule: [
    {
      id: "friday",
      label: "Fri Apr 24",
      startHour: 16,
      endHour: 24,
      events: [
        { title: "Check-in", location: "Beckman Lawn", start: "16:00", end: "17:00", description: "Pick up your badge, wristband, and weekend materials." },
        { title: "Sponsor Expo", location: "Hameetman Lobby", start: "16:15", end: "17:00", description: "Meet sponsors and learn about prizes, APIs, and recruiting opportunities.", links: [{ label: "Sponsor list", url: "#" }] },
        { title: "Opening Ceremony", location: "Ramo Auditorium", start: "17:00", end: "18:00", description: "Welcome remarks, rules, theme reveal, and kickoff." },
        { title: "Team Formation", location: "Main Hacking Space", start: "18:00", end: "19:00", description: "Find teammates or add people to your group before hacking begins." },
        { title: "First-Time Hacker Meetup", location: "Avery Courtyard", start: "18:15", end: "19:00", description: "A low-pressure intro session for first-time participants." },
        { title: "Dinner", location: "Beckman Mall", start: "19:00", end: "20:00", description: "Dinner pickup and seating." }
      ]
    },
    {
      id: "saturday",
      label: "Sat Apr 25",
      startHour: 8,
      endHour: 24,
      events: [
        { title: "Breakfast", location: "Beckman Mall", start: "09:00", end: "10:00", description: "Morning food service for hackers." },
        { title: "Workshop Block", location: "Annenberg 105", start: "11:00", end: "12:30", description: "Technical workshops and sponsor demos.", links: [{ label: "Slides", url: "#" }] },
        { title: "Hardware Lab Hours", location: "Moore B270", start: "11:30", end: "13:00", description: "Borrow parts, debug circuits, and get hardware support." },
        { title: "Sponsor Office Hours", location: "Hameetman Lobby", start: "12:00", end: "13:00", description: "Ask sponsor engineers questions about APIs, careers, and prizes." },
        { title: "Lunch", location: "Beckman Mall", start: "13:00", end: "14:00", description: "Lunch pickup and seating." },
        { title: "Mentor Hours", location: "Main Hacking Space", start: "15:00", end: "17:00", description: "Mentors circulate through the hacking space to help teams unblock." },
        { title: "Mini Event", location: "Avery Courtyard", start: "15:30", end: "16:30", description: "Take a break and meet other hackers." },
        { title: "Dinner", location: "Beckman Mall", start: "19:00", end: "20:00", description: "Dinner pickup and seating." }
      ]
    },
    {
      id: "sunday",
      label: "Sun Apr 26",
      startHour: 8,
      endHour: 16,
      events: [
        { title: "Breakfast", location: "Beckman Mall", start: "09:00", end: "10:00", description: "Morning food service for hackers." },
        { title: "Hacking Ends", location: "Main Hacking Space", start: "12:00", end: "12:15", description: "Submission deadline. Make sure your Devpost is complete." },
        { title: "Judging", location: "Judging Hall", start: "13:00", end: "15:00", description: "Teams present projects to judges." },
        { title: "Sponsor Demos", location: "Annenberg 105", start: "13:00", end: "14:00", description: "Sponsor challenge finalists present selected demos." },
        { title: "Closing Ceremony", location: "Ramo Auditorium", start: "15:00", end: "16:00", description: "Awards, closing remarks, and wrap-up." }
      ]
    }
  ]
};

let activeMapController = null;
let activeScheduleModalTrigger = null;

function withEmbeddedParam(url) {
  const separator = url.includes("?") ? "&" : "?";
  return url.includes("embedded=true") ? url : `${url}${separator}embedded=true`;
}

const countdownEls = {
  status: document.querySelector("#countdown-status"),
  days: document.querySelector("#countdown-days"),
  hours: document.querySelector("#countdown-hours"),
  minutes: document.querySelector("#countdown-minutes"),
  seconds: document.querySelector("#countdown-seconds")
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = Date.now();
  const start = new Date(liveConfig.hackingStartsAt).getTime();
  const end = new Date(liveConfig.hackingEndsAt).getTime();
  let target = start;
  let label = "Until hacking starts";

  if (now >= start && now < end) {
    target = end;
    label = "Until hacking ends";
  } else if (now >= end) {
    target = now;
    label = "Hacktech 2026 has ended";
  }

  const remaining = Math.max(0, target - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownEls.status.textContent = label;
  countdownEls.days.textContent = pad(days);
  countdownEls.hours.textContent = pad(hours);
  countdownEls.minutes.textContent = pad(minutes);
  countdownEls.seconds.textContent = pad(seconds);
}

function setupTabs() {
  const tabControls = document.querySelectorAll("[data-tab-target]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  tabControls.forEach((control) => {
    control.addEventListener("click", () => {
      const targetId = control.dataset.tabTarget;

      tabControls.forEach((item) => item.classList.toggle("is-active", item === control));
      tabPanels.forEach((panel) => panel.classList.toggle("is-active", panel.id === targetId));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function setExternalLinks() {
  const faqFrame = document.querySelector(".faq-frame");
  const devpostLink = document.querySelector(".live-tab-link");

  faqFrame.src = withEmbeddedParam(liveConfig.googleDocUrl);
  devpostLink.href = liveConfig.devpostUrl;
}

function projectLocation(location) {
  const { north, south, west, east } = liveConfig.mapBounds;
  const x = ((location.lng - west) / (east - west)) * 100;
  const y = ((north - location.lat) / (north - south)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(94, Math.max(6, y))
  };
}

function getCoordinateLink(location) {
  const label = encodeURIComponent(location.name);
  const coords = `${location.lat},${location.lng}`;
  const userAgent = navigator.userAgent || "";
  const isAppleTouchDevice = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAppleTouchDevice) {
    return `https://maps.apple.com/?ll=${coords}&q=${label}`;
  }

  if (/Android/.test(userAgent)) {
    return `geo:${coords}?q=${coords}(${label})`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${coords}`;
}

function drawFallbackMap(mapEl) {
  const fragments = document.createDocumentFragment();
  const paths = [
    { left: "12%", top: "48%", width: "76%", height: "10px" },
    { left: "48%", top: "14%", width: "10px", height: "72%" },
    { left: "25%", top: "28%", width: "44%", height: "8px" }
  ];
  const buildings = [
    { left: "18%", top: "20%", width: "18%", height: "16%" },
    { left: "57%", top: "18%", width: "20%", height: "18%" },
    { left: "18%", top: "60%", width: "22%", height: "18%" },
    { left: "61%", top: "58%", width: "18%", height: "20%" },
    { left: "39%", top: "39%", width: "14%", height: "14%" }
  ];

  paths.forEach((path) => {
    const el = document.createElement("span");
    el.className = "map-path";
    Object.assign(el.style, path);
    fragments.append(el);
  });

  buildings.forEach((building) => {
    const el = document.createElement("span");
    el.className = "map-building";
    Object.assign(el.style, building);
    fragments.append(el);
  });

  mapEl.append(fragments);
}

function selectLocation(location, marker) {
  document.querySelectorAll(".map-marker").forEach((item) => {
    item.classList.toggle("is-selected", item === marker);
  });

  document.querySelector("#location-type").textContent = location.type;
  document.querySelector("#location-name").textContent = location.name;
  document.querySelector("#location-description").textContent = location.description;
  document.querySelector("#map-coordinates-link").href = getCoordinateLink(location);
}

function setupFallbackMarkers(mapEl) {
  liveConfig.locations.forEach((location, index) => {
    const marker = document.createElement("button");
    const tooltip = document.createElement("span");
    const tooltipType = document.createElement("span");
    const point = projectLocation(location);

    marker.className = "map-marker";
    marker.type = "button";
    marker.dataset.locationType = location.type;
    marker.style.left = `${point.x}%`;
    marker.style.top = `${point.y}%`;
    marker.title = `${location.name} / ${location.type}`;
    marker.setAttribute("aria-label", `${location.name}, ${location.type}`);
    tooltip.className = "map-marker-tooltip";
    tooltip.textContent = location.name;
    tooltipType.textContent = location.type;
    tooltip.append(tooltipType);
    marker.append(tooltip);
    marker.addEventListener("click", () => selectLocation(location, marker));
    mapEl.append(marker);

    if (index === 0) {
      selectLocation(location, marker);
    }
  });
}

function setupFallbackUserLocation(mapEl, location) {
  let userMarker = document.querySelector(".map-user-marker");
  const point = projectLocation(location);

  if (!userMarker) {
    userMarker = document.createElement("span");
    userMarker.className = "map-marker map-user-marker";
    userMarker.innerHTML = '<span class="map-marker-tooltip">You are here<span>Current location</span></span>';
    mapEl.append(userMarker);
  }

  userMarker.style.left = `${point.x}%`;
  userMarker.style.top = `${point.y}%`;
}

function setupLeafletMap(mapEl) {
  const center = liveConfig.locations[0] || { lat: 34.1377, lng: -118.1253 };
  const map = L.map(mapEl, {
    scrollWheelZoom: false
  }).setView([center.lat, center.lng], 17);
  const bounds = [];
  let userMarker = null;
  let userCircle = null;

  mapEl.classList.add("interactive-map");

  L.tileLayer(liveConfig.mapTileUrl, {
    maxZoom: 19,
    attribution: liveConfig.mapAttribution
  }).addTo(map);

  liveConfig.locations.forEach((location, index) => {
    const icon = L.divIcon({
      className: "",
      html: '<span class="venue-pin" aria-hidden="true"></span>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    const marker = L.marker([location.lat, location.lng], {
      icon,
      title: `${location.name} / ${location.type}`
    }).addTo(map);

    marker.bindTooltip(`${location.name}<span>${location.type}</span>`, {
      className: "venue-tooltip",
      direction: "top",
      offset: [0, -18],
      opacity: 1
    });
    marker.on("click", () => selectLocation(location, marker));
    bounds.push([location.lat, location.lng]);

    if (index === 0) {
      selectLocation(location, marker);
    }
  });

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [52, 52], maxZoom: 18 });
  }

  activeMapController = {
    setUserLocation(location) {
      const latLng = [location.lat, location.lng];
      const userIcon = L.divIcon({
        className: "",
        html: '<span class="user-pin" aria-hidden="true"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      if (!userMarker) {
        userMarker = L.marker(latLng, {
          icon: userIcon,
          title: "You are here"
        }).addTo(map);
        userMarker.bindTooltip("You are here<span>Current location</span>", {
          className: "venue-tooltip",
          direction: "top",
          offset: [0, -12],
          opacity: 1
        });
      } else {
        userMarker.setLatLng(latLng);
      }

      if (!userCircle) {
        userCircle = L.circle(latLng, {
          radius: location.accuracy || 20,
          color: "#2f8cff",
          fillColor: "#2f8cff",
          fillOpacity: 0.12,
          weight: 1
        }).addTo(map);
      } else {
        userCircle.setLatLng(latLng);
        userCircle.setRadius(location.accuracy || 20);
      }

      map.setView(latLng, Math.max(map.getZoom(), 18));
    }
  };
}

function setupGoogleMap(mapEl) {
  const center = liveConfig.locations[0] || { lat: 34.1377, lng: -118.1253 };
  const map = new google.maps.Map(mapEl, {
    center,
    zoom: 17,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true
  });
  const bounds = new google.maps.LatLngBounds();
  let userMarker = null;
  let userCircle = null;

  mapEl.classList.add("google-map");

  liveConfig.locations.forEach((location, index) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map,
      title: `${location.name} / ${location.type}`
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${location.name}</strong><br>${location.type}`
    });

    marker.addListener("mouseover", () => infoWindow.open({ anchor: marker, map }));
    marker.addListener("mouseout", () => infoWindow.close());
    marker.addListener("click", () => selectLocation(location, marker));
    bounds.extend(marker.getPosition());

    if (index === 0) {
      selectLocation(location, marker);
    }
  });

  if (liveConfig.locations.length > 1) {
    map.fitBounds(bounds, 52);
  }

  activeMapController = {
    setUserLocation(location) {
      const position = { lat: location.lat, lng: location.lng };

      if (!userMarker) {
        userMarker = new google.maps.Marker({
          position,
          map,
          title: "You are here",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#2f8cff",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3
          }
        });
      } else {
        userMarker.setPosition(position);
      }

      if (!userCircle) {
        userCircle = new google.maps.Circle({
          map,
          center: position,
          radius: location.accuracy || 20,
          strokeColor: "#2f8cff",
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: "#2f8cff",
          fillOpacity: 0.12
        });
      } else {
        userCircle.setCenter(position);
        userCircle.setRadius(location.accuracy || 20);
      }

      map.setCenter(position);
      map.setZoom(Math.max(map.getZoom() || 17, 18));
    }
  };
}

function loadGoogleMap(mapEl) {
  window.initHacktechGoogleMap = () => setupGoogleMap(mapEl);

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(liveConfig.googleMapsApiKey)}&callback=initHacktechGoogleMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    if (window.L) {
      setupLeafletMap(mapEl);
      return;
    }
    drawFallbackMap(mapEl);
    setupFallbackMarkers(mapEl);
  };
  document.head.append(script);
}

function setupMap() {
  const mapEl = document.querySelector("#campus-map");

  if (liveConfig.googleMapsApiKey) {
    loadGoogleMap(mapEl);
    return;
  }

  if (window.L) {
    setupLeafletMap(mapEl);
    return;
  }

  drawFallbackMap(mapEl);
  setupFallbackMarkers(mapEl);
  activeMapController = {
    setUserLocation(location) {
      setupFallbackUserLocation(mapEl, location);
    }
  };
}

function setupCurrentLocation() {
  const locateButton = document.querySelector("#locate-me-btn");
  const status = document.querySelector("#location-status");

  locateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      status.textContent = "Location is not supported by this browser.";
      return;
    }

    status.textContent = "Requesting location...";
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        if (!activeMapController) {
          status.textContent = "Map is still loading. Try again in a moment.";
          return;
        }

        activeMapController.setUserLocation(location);
        status.textContent = "Current location shown on map.";
      },
      () => {
        status.textContent = "Location permission was denied or unavailable.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatHour(hour) {
  const normalized = hour % 24;
  const displayHour = normalized % 12 || 12;
  const suffix = normalized < 12 ? "AM" : "PM";
  return `${displayHour} ${suffix}`;
}

function formatEventTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const normalized = hours % 24;
  const displayHour = normalized % 12 || 12;
  const suffix = normalized < 12 ? "AM" : "PM";
  const minuteText = minutes === 0 ? "" : `:${String(minutes).padStart(2, "0")}`;
  return `${displayHour}${minuteText} ${suffix}`;
}

function getScheduleStartHour(day) {
  const firstEventMinutes = Math.min(...day.events.map((event) => timeToMinutes(event.start)));
  return Math.max(0, Math.floor(firstEventMinutes / 60) - 1);
}

function layoutScheduleEvents(events) {
  const sortedEvents = events
    .map((event, index) => ({
      ...event,
      index,
      startMinutes: timeToMinutes(event.start),
      endMinutes: timeToMinutes(event.end)
    }))
    .sort((first, second) => first.startMinutes - second.startMinutes || first.endMinutes - second.endMinutes);
  const clusters = [];
  let currentCluster = [];
  let currentClusterEnd = -1;

  sortedEvents.forEach((event) => {
    if (!currentCluster.length || event.startMinutes < currentClusterEnd) {
      currentCluster.push(event);
      currentClusterEnd = Math.max(currentClusterEnd, event.endMinutes);
      return;
    }

    clusters.push(currentCluster);
    currentCluster = [event];
    currentClusterEnd = event.endMinutes;
  });

  if (currentCluster.length) {
    clusters.push(currentCluster);
  }

  return clusters.flatMap((cluster) => {
    const columns = [];

    cluster.forEach((event) => {
      const columnIndex = columns.findIndex((columnEnd) => columnEnd <= event.startMinutes);
      const assignedColumn = columnIndex === -1 ? columns.length : columnIndex;

      columns[assignedColumn] = event.endMinutes;
      event.column = assignedColumn;
    });

    return cluster.map((event) => ({
      ...event,
      columnCount: columns.length
    }));
  });
}

function openScheduleModal(event, trigger) {
  const modal = document.querySelector("#schedule-modal");
  const title = document.querySelector("#schedule-modal-title");
  const time = document.querySelector("#schedule-modal-time");
  const location = document.querySelector("#schedule-modal-location");
  const description = document.querySelector("#schedule-modal-description");
  const links = document.querySelector("#schedule-modal-links");

  activeScheduleModalTrigger = trigger;
  title.textContent = event.title;
  time.textContent = `${formatEventTime(event.start)}-${formatEventTime(event.end)}`;
  location.textContent = event.location;
  description.textContent = event.description || "More details coming soon.";
  links.innerHTML = "";
  (event.links || []).forEach((link) => {
    const linkEl = document.createElement("a");

    linkEl.href = link.url;
    linkEl.textContent = link.label;
    linkEl.target = "_blank";
    linkEl.rel = "noopener";
    links.append(linkEl);
  });

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector(".schedule-modal-close").focus();
}

function closeScheduleModal() {
  const modal = document.querySelector("#schedule-modal");

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (activeScheduleModalTrigger) {
    activeScheduleModalTrigger.focus();
  }
}

function setupScheduleModal() {
  document.querySelectorAll("[data-schedule-modal-close]").forEach((element) => {
    element.addEventListener("click", closeScheduleModal);
  });
  document.addEventListener("keydown", (event) => {
    const modalIsOpen = document.querySelector("#schedule-modal").classList.contains("is-open");

    if (event.key === "Escape" && modalIsOpen) {
      closeScheduleModal();
    }
  });
}

function openConstructionModal() {
  const modal = document.querySelector("#construction-modal");

  if (!modal || sessionStorage.getItem("hacktechLiveConstructionDismissed") === "true") {
    return;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.querySelector(".construction-modal-ack").focus();
}

function closeConstructionModal() {
  const modal = document.querySelector("#construction-modal");

  if (!modal) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  sessionStorage.setItem("hacktechLiveConstructionDismissed", "true");
}

function setupConstructionModal() {
  document.querySelectorAll("[data-construction-modal-close]").forEach((element) => {
    element.addEventListener("click", closeConstructionModal);
  });
  document.addEventListener("keydown", (event) => {
    const modal = document.querySelector("#construction-modal");
    const modalIsOpen = modal && modal.classList.contains("is-open");

    if (event.key === "Escape" && modalIsOpen) {
      closeConstructionModal();
    }
  });
  window.setTimeout(openConstructionModal, 300);
}

function renderSchedule(dayId) {
  const day = liveConfig.schedule.find((item) => item.id === dayId) || liveConfig.schedule[0];
  const board = document.querySelector("#schedule-board");
  const rowHeight = parseFloat(getComputedStyle(board).getPropertyValue("--row-height")) || 88;
  const visibleStartHour = getScheduleStartHour(day);
  const totalHours = day.endHour - visibleStartHour;
  const totalHeight = totalHours * rowHeight;
  const timeColumn = document.createElement("div");
  const eventColumn = document.createElement("div");

  timeColumn.className = "time-column";
  eventColumn.className = "event-column";
  eventColumn.style.minHeight = `${totalHeight}px`;

  for (let hour = visibleStartHour; hour < day.endHour; hour += 1) {
    const slot = document.createElement("div");
    slot.className = "time-slot";
    slot.textContent = formatHour(hour);
    timeColumn.append(slot);
  }

  layoutScheduleEvents(day.events).forEach((event) => {
    const eventEl = document.createElement("article");
    const contentEl = document.createElement("div");
    const titleEl = document.createElement("h3");
    const timeEl = document.createElement("p");
    const locationEl = document.createElement("p");
    const startOffset = event.startMinutes - visibleStartHour * 60;
    const duration = event.endMinutes - event.startMinutes;
    const gap = 8;
    const eventWidth = `calc((100% - 20px - ${gap * (event.columnCount - 1)}px) / ${event.columnCount})`;

    eventEl.className = "schedule-event";
    if (duration <= 30) {
      eventEl.classList.add("is-short");
    }
    if (duration <= 15) {
      eventEl.classList.add("is-tiny");
    }
    if (event.columnCount > 1) {
      eventEl.classList.add("is-overlapping");
    }
    eventEl.tabIndex = 0;
    eventEl.setAttribute("role", "button");
    eventEl.setAttribute("aria-label", `${event.title}, ${formatEventTime(event.start)} to ${formatEventTime(event.end)}, ${event.location}`);
    eventEl.style.top = `${(startOffset / 60) * rowHeight}px`;
    eventEl.style.height = `${Math.max(22, (duration / 60) * rowHeight - 6)}px`;
    eventEl.style.left = `calc(10px + (${eventWidth} + ${gap}px) * ${event.column})`;
    eventEl.style.width = eventWidth;
    contentEl.className = "schedule-event-content";
    titleEl.textContent = event.title;
    timeEl.className = "schedule-event-time";
    timeEl.textContent = `${formatEventTime(event.start)}-${formatEventTime(event.end)}`;
    locationEl.className = "schedule-event-location";
    locationEl.textContent = event.location;
    contentEl.append(titleEl, timeEl, locationEl);
    eventEl.append(contentEl);
    eventEl.addEventListener("click", () => openScheduleModal(event, eventEl));
    eventEl.addEventListener("keydown", (keyboardEvent) => {
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        openScheduleModal(event, eventEl);
      }
    });
    eventColumn.append(eventEl);
  });

  board.innerHTML = "";
  board.style.minHeight = `${totalHeight}px`;
  board.append(timeColumn, eventColumn);
}

function setupSchedule() {
  const daysEl = document.querySelector(".schedule-days");

  liveConfig.schedule.forEach((day, index) => {
    const dayButton = document.createElement("button");
    dayButton.className = `schedule-day${index === 0 ? " is-active" : ""}`;
    dayButton.type = "button";
    dayButton.textContent = day.label;
    dayButton.addEventListener("click", () => {
      document.querySelectorAll(".schedule-day").forEach((item) => {
        item.classList.toggle("is-active", item === dayButton);
      });
      renderSchedule(day.id);
    });
    daysEl.append(dayButton);
  });

  renderSchedule(liveConfig.schedule[0].id);
  window.addEventListener("resize", () => {
    const activeDay = document.querySelector(".schedule-day.is-active");
    const activeIndex = [...document.querySelectorAll(".schedule-day")].indexOf(activeDay);
    renderSchedule(liveConfig.schedule[Math.max(0, activeIndex)].id);
  });
}

function init() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  setupTabs();
  setExternalLinks();
  setupMap();
  setupCurrentLocation();
  setupScheduleModal();
  setupConstructionModal();
  setupSchedule();
}

document.addEventListener("DOMContentLoaded", init);
