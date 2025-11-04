
(function () {
  const optionList = document.querySelector('.space-options');
  const optionCards = Array.from(document.querySelectorAll('.option-card'));
  const spaceImage = document.getElementById('spaceImage');
  const spaceDescription = document.getElementById('spaceDescription');
  const spaceDetails = document.getElementById('spaceDetails');
  const officeSelect = document.getElementById('officeSpace');
  const bookNowBtn = document.getElementById('bookNow');
  const dateInput = document.getElementById('bookingDate');
  const startInput = document.getElementById('startTime');
  const endInput = document.getElementById('endTime');

const options = document.querySelectorAll('.option-card');
    const image = document.getElementById('spaceImage');
    const desc = document.getElementById('spaceDescription');

    const spaces = {
      desk: {
        img: 'Single desk 2.avif',
        desc: 'A quiet, focused workspace perfect for individual professionals. Includes power outlet, ergonomic chair, and fast Wi-Fi.'
      },
      office: {
        img: 'Private room 2.jpg',
        desc: 'A private office designed for productivity and privacy. Ideal for small teams or business meetings with air-conditioning and lockable doors.'
      },
      meeting: {
        img: 'Meeting room 1.jpg',
        desc: 'A well-equipped meeting room with projector, conference table, and comfortable seating(10-20 seats)— perfect for presentations or team discussions.'
      }
    };

    options.forEach(btn => {
      btn.addEventListener('click', () => {
        // Reset others
        options.forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');

        const type = btn.getAttribute('data-type');
        image.src = spaces[type].img;
        desc.textContent = spaces[type].desc;
      });
    });

  // Ensure a sensible default for image paths if specific file missing
  function getImageFor(type, fallbackImg) {
    if (data[type] && data[type].image) return data[type].image;
    return fallbackImg || '';
  }

  // Select a card by index or element
  function selectCard(card) {
    const selectedEl = typeof card === 'number' ? optionCards[card] : card;
    if (!selectedEl) return;

    optionCards.forEach(c => c.setAttribute('aria-pressed', 'false'));
    selectedEl.setAttribute('aria-pressed', 'true');

    const type = selectedEl.dataset.type;
    // update hidden select to keep forms / legacy code in sync
    if (officeSelect) officeSelect.value = type;

    // update preview
    const info = data[type] || {};
    spaceImage.src = getImageFor(type, selectedEl.querySelector('img')?.src || '');
    spaceImage.alt = info.label ? `${info.label} preview` : 'Space preview';
    spaceDescription.textContent = info.desc || selectedEl.querySelector('.option-label')?.textContent || '';
  }

  // Click handler for option buttons
  optionCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      selectCard(card);
      card.focus();
    });
    // Pressing Space/Enter should activate the button - default button element already does this,
    // but ensure aria-pressed updated when keyboard used directly on the button
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectCard(card);
      }
    });
  });

  // Listbox keyboard navigation (when container has focus)
  if (optionList) {
    optionList.addEventListener('keydown', (e) => {
      const focused = document.activeElement;
      const currentIndex = optionCards.indexOf(focused);
      let nextIndex = -1;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIndex = currentIndex < optionCards.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : optionCards.length - 1;
      } else if (e.key === 'Home') {
        e.preventDefault(); nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault(); nextIndex = optionCards.length - 1;
      } else if (e.key === 'Enter' || e.key === ' ') {
        // if the container has focus, activate the first card by default
        e.preventDefault();
        const toSelect = currentIndex >= 0 ? optionCards[currentIndex] : optionCards[0];
        selectCard(toSelect);
        toSelect.focus();
        return;
      }

      if (nextIndex >= 0) {
        optionCards[nextIndex].focus();
      }
    });

    // Make first card focusable if nothing else focused
    optionList.addEventListener('focus', () => {
      const active = optionCards.find(c => c.getAttribute('aria-pressed') === 'true');
      (active || optionCards[0])?.focus();
    });
  }

  // Simple validation helpers
  function parseTimeToMinutes(t) {
    if (!t) return null;
    const [hh, mm] = t.split(':').map(Number);
    return hh * 60 + mm;
  }

  function validateBooking() {
    const date = dateInput.value;
    const start = startInput.value;
    const end = endInput.value;
    const space = officeSelect.value;

    if (!date) return { ok: false, msg: 'Please choose a booking date.' };
    if (!space) return { ok: false, msg: 'Please select a space type.' };
    if (!start || !end) return { ok: false, msg: 'Please choose start and end times.' };

    const s = parseTimeToMinutes(start);
    const e = parseTimeToMinutes(end);
    if (s === null || e === null) return { ok: false, msg: 'Invalid times provided.' };
    if (e <= s) return { ok: false, msg: 'End time must be after start time.' };

    return { ok: true, booking: { date, start, end, space } };
  }

  // Show confirmation message inside preview details (aria-live region)
  function showConfirmation(message) {
    spaceDetails.innerHTML = `<h2>Booking Confirmation</h2><p id="spaceDescription">${message}</p>`;
  }

  // Save booking to localStorage (simple)
  function saveBooking(b) {
    try {
      const key = 'officeBookings_v1';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push(Object.assign({ createdAt: new Date().toISOString() }, b));
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (err) {
      // ignore localStorage errors
      console.error('Saving booking failed', err);
    }
  }

  bookNowBtn.addEventListener('click', () => {
    const res = validateBooking();
    if (!res.ok) {
      // quick accessible feedback
      showConfirmation(res.msg);
      return;
    }

    const info = data[res.booking.space] || {};
    const message = `${info.label || res.booking.space} booked on ${res.booking.date} from ${res.booking.start} to ${res.booking.end}.`;
    saveBooking(res.booking);
    showConfirmation(message);
  });

  // Initialize default selection if any
  (function init() {
    // If select has preselected value, mirror it; otherwise select first option
    const initial = officeSelect.value || optionCards[0]?.dataset.type;
    const cardToSelect = optionCards.find(c => c.dataset.type === initial) || optionCards[0];
    if (cardToSelect) selectCard(cardToSelect);
  })();
})();