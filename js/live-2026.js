"use strict";

const liveConfig = {
  hackingStartsAt: "2026-04-24T17:00:00-07:00",
  hackingEndsAt: "2026-04-26T12:00:00-07:00",
  scheduleTimeZoneLabel: "PST",
  // Add a browser-restricted Google Maps JavaScript API key here to render the real map.
  // Leave blank to use the built-in static campus fallback.
  googleMapsApiKey: "",
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
      lng: -118.1253,
      mapsUrl: "https://maps.google.com/?q=34.1377,-118.1253"
    },
    {
      id: "judging",
      name: "Judging Hall",
      type: "ceremony",
      description: "Final demos and project judging.",
      lat: 34.1386,
      lng: -118.1236,
      mapsUrl: "https://maps.google.com/?q=34.1386,-118.1236"
    },
    {
      id: "workspace",
      name: "Main Hacking Space",
      type: "workspace",
      description: "Primary workspace for teams throughout the weekend.",
      lat: 34.1379,
      lng: -118.1267,
      mapsUrl: "https://maps.google.com/?q=34.1379,-118.1267"
    },
    {
      id: "parking",
      name: "Parking",
      type: "logistics",
      description: "Recommended arrival and parking location.",
      lat: 34.1364,
      lng: -118.1248,
      mapsUrl: "https://maps.google.com/?q=34.1364,-118.1248"
    }
  ],
  schedule: [
    {
      id: "friday",
      label: "Fri Apr 24",
      startHour: 16,
      endHour: 24,
      events: [
        { title: "Check-in", location: "TBD", start: "16:00", end: "17:00" },
        { title: "Opening Ceremony", location: "Opening Ceremony", start: "17:00", end: "18:00" },
        { title: "Team Formation", location: "Main Hacking Space", start: "18:00", end: "19:00" },
        { title: "Dinner", location: "TBD", start: "19:00", end: "20:00" }
      ]
    },
    {
      id: "saturday",
      label: "Sat Apr 25",
      startHour: 8,
      endHour: 24,
      events: [
        { title: "Breakfast", location: "TBD", start: "09:00", end: "10:00" },
        { title: "Workshop Block", location: "TBD", start: "11:00", end: "12:30" },
        { title: "Lunch", location: "TBD", start: "13:00", end: "14:00" },
        { title: "Mentor Hours", location: "Main Hacking Space", start: "15:00", end: "17:00" },
        { title: "Dinner", location: "TBD", start: "19:00", end: "20:00" }
      ]
    },
    {
      id: "sunday",
      label: "Sun Apr 26",
      startHour: 8,
      endHour: 16,
      events: [
        { title: "Breakfast", location: "TBD", start: "09:00", end: "10:00" },
        { title: "Hacking Ends", location: "Main Hacking Space", start: "12:00", end: "12:15" },
        { title: "Judging", location: "Judging Hall", start: "13:00", end: "15:00" },
        { title: "Closing Ceremony", location: "TBD", start: "15:00", end: "16:00" }
      ]
    }
  ]
};

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
  document.querySelector("#location-link").href = location.mapsUrl;
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

function setupMapFilters() {
  const filters = document.querySelectorAll("[data-map-filter]");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const activeFilter = filter.dataset.mapFilter;

      filters.forEach((item) => item.classList.toggle("is-active", item === filter));
      document.querySelectorAll(".map-marker").forEach((marker) => {
        const isVisible = activeFilter === "all" || marker.dataset.locationType === activeFilter;
        marker.classList.toggle("is-hidden", !isVisible);
      });
    });
  });
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
  const markers = [];

  mapEl.classList.add("google-map");

  liveConfig.locations.forEach((location, index) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map,
      title: `${location.name} / ${location.type}`
    });

    marker.dataset = { locationType: location.type };
    marker.addListener("click", () => {
      selectLocation(location, marker);
      map.panTo({ lat: location.lat, lng: location.lng });
    });
    markers.push(marker);

    if (index === 0) {
      selectLocation(location, marker);
    }
  });

  document.querySelectorAll("[data-map-filter]").forEach((filter) => {
    filter.addEventListener("click", () => {
      const activeFilter = filter.dataset.mapFilter;

      document.querySelectorAll("[data-map-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === filter);
      });
      markers.forEach((marker) => {
        const isVisible = activeFilter === "all" || marker.dataset.locationType === activeFilter;
        marker.setVisible(isVisible);
      });
    });
  });
}

function loadGoogleMap(mapEl) {
  window.initHacktechGoogleMap = () => setupGoogleMap(mapEl);

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(liveConfig.googleMapsApiKey)}&callback=initHacktechGoogleMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    drawFallbackMap(mapEl);
    setupFallbackMarkers(mapEl);
    setupMapFilters();
  };
  document.head.append(script);
}

function setupMap() {
  const mapEl = document.querySelector("#campus-map");

  if (liveConfig.googleMapsApiKey) {
    loadGoogleMap(mapEl);
    return;
  }

  drawFallbackMap(mapEl);
  setupFallbackMarkers(mapEl);
  setupMapFilters();
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatHour(hour) {
  const normalized = hour % 24;
  const displayHour = normalized % 12 || 12;
  const suffix = normalized < 12 ? "AM" : "PM";
  return `${displayHour} ${suffix} ${liveConfig.scheduleTimeZoneLabel}`;
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

function renderSchedule(dayId) {
  const day = liveConfig.schedule.find((item) => item.id === dayId) || liveConfig.schedule[0];
  const board = document.querySelector("#schedule-board");
  const rowHeight = window.matchMedia("(max-width: 480px)").matches ? 66 : 72;
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

  day.events.forEach((event) => {
    const eventEl = document.createElement("article");
    const titleEl = document.createElement("h3");
    const detailEl = document.createElement("p");
    const startOffset = timeToMinutes(event.start) - visibleStartHour * 60;
    const duration = timeToMinutes(event.end) - timeToMinutes(event.start);

    eventEl.className = "schedule-event";
    eventEl.style.top = `${(startOffset / 60) * rowHeight}px`;
    eventEl.style.height = `${Math.max(54, (duration / 60) * rowHeight - 8)}px`;
    titleEl.textContent = event.title;
    detailEl.textContent = `${formatEventTime(event.start)}-${formatEventTime(event.end)} ${liveConfig.scheduleTimeZoneLabel} / ${event.location}`;
    eventEl.append(titleEl, detailEl);
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
  setupSchedule();
}

document.addEventListener("DOMContentLoaded", init);
