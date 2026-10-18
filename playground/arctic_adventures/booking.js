(() => {
  'use strict';

  const form = document.getElementById('trip-form');
  const summary = document.getElementById('trip-summary');
  const result = document.getElementById('trip-result');
  const itineraryContent = document.getElementById('itinerary-content');
  const enquiryLink = document.getElementById('enquiry-link');
  const downloadButton = document.getElementById('download-plan');
  const languageButton = document.getElementById('language-toggle');
  const menuButton = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav');
  const shareButton = document.getElementById('share-trip');

  const businessEmail = 'skaugvollcamping@gmail.com';
  const validStays = new Set(['cabin', 'motel', 'caravan']);
  const validInterests = new Set(['kayak', 'sauna', 'hiking', 'aurora', 'food']);
  const words = {
    en: {
      invalidDate: 'Choose an arrival date today or later.',
      invalidNights: 'Choose a stay of 2 to 5 nights.',
      invalidGuests: 'Choose between 1 and 8 guests.',
      invalidStay: 'Choose one of the listed stay types.',
      planReady: 'Your suggested itinerary is ready. It is not a booking or a confirmation.',
      intro: 'Suggested itinerary',
      arrival: 'Arrival', nights: 'Nights', guests: 'Guests', stay: 'Stay', interests: 'Interests',
      noInterests: 'No specific interests selected',
      stayNames: { cabin: 'Panoramic cabin', motel: 'Motel room', caravan: 'Caravan space' },
      interestNames: { kayak: 'Kayaking', sauna: 'Seaside sauna', hiking: 'Hiking and nature', aurora: 'Northern lights', food: 'Restaurant' },
      day: 'Day',
      dayOne: 'Arrive, settle in, and take time to get to know the coast at your own pace.',
      departure: 'A relaxed final morning, then depart when it suits your plans.',
      middle: 'Leave room to slow down and enjoy the sea, mountains, or a quiet moment at camp.',
      activity: {
        kayak: 'Make time for a kayak outing along the coast. Rental and conditions require confirmation.',
        sauna: 'Set aside time for the seaside sauna. Arrangement and availability require confirmation.',
        hiking: 'Explore a nearby mountain or coastal trail at your own pace; check local conditions before setting out.',
        aurora: 'If the season, darkness, and sky conditions cooperate, look for the northern lights. Sightings are never guaranteed.',
        food: 'Consider a meal at the restaurant; opening and service arrangements require confirmation.'
      },
      caveat: 'This is a suggested itinerary. Activities, restaurant service, stay availability, and arrangements must be confirmed with Skaugvoll Camping. Northern lights and weather are never guaranteed. No booking has been made.',
      email: 'Prepare an enquiry email',
      emailSubject: 'Trip enquiry for Skaugvoll',
      emailIntro: 'Hello,\n\nI would like to ask about this possible trip to Skaugvoll:',
      emailNoBooking: '\n\nThis is an enquiry only. I understand no booking is confirmed until Skaugvoll Camping replies.',
      copied: 'Trip plan copied.',
      copyBlocked: 'Copy was blocked. A copyable version will open so you can copy it manually.',
      noPlan: 'Create your trip plan first.',
      updatePlan: 'Your trip details changed. Build your plan again.',
      shareTitle: 'My Skaugvoll trip plan',
      manualCopy: 'Copy this trip plan:',
      downloaded: 'Plain-text trip plan downloaded.'
    },
    no: {
      invalidDate: 'Velg en ankomstdato i dag eller senere.',
      invalidNights: 'Velg et opphold på 2 til 5 netter.',
      invalidGuests: 'Velg mellom 1 og 8 gjester.',
      invalidStay: 'Velg en av de oppgitte overnattingstypene.',
      planReady: 'Forslaget til reiseplan er klart. Dette er ikke en bestilling eller bekreftelse.',
      intro: 'Forslag til reiseplan',
      arrival: 'Ankomst', nights: 'Netter', guests: 'Gjester', stay: 'Overnatting', interests: 'Interesser',
      noInterests: 'Ingen spesielle interesser valgt',
      stayNames: { cabin: 'Panoramahytte', motel: 'Motellrom', caravan: 'Bobilplass' },
      interestNames: { kayak: 'Kajakk', sauna: 'Badstue ved sjøen', hiking: 'Fottur og natur', aurora: 'Nordlys', food: 'Restaurant' },
      day: 'Dag',
      dayOne: 'Ankom, finn deg til rette, og bli kjent med kysten i ditt eget tempo.',
      departure: 'En rolig siste morgen før avreise når det passer planene dine.',
      middle: 'Sett av tid til å senke tempoet og nyte sjøen, fjellene eller en stille stund på stedet.',
      activity: {
        kayak: 'Sett av tid til en kajakktur langs kysten. Leie og forhold må bekreftes.',
        sauna: 'Sett av tid til badstuen ved sjøen. Avtale og tilgjengelighet må bekreftes.',
        hiking: 'Utforsk en nærliggende fjell- eller kyststi i ditt eget tempo; sjekk lokale forhold før turen.',
        aurora: 'Hvis sesongen, mørket og værforholdene ligger til rette, kan du se etter nordlys. Observasjoner kan ikke garanteres.',
        food: 'Vurder et måltid i restauranten; åpningstider og servering må bekreftes.'
      },
      caveat: 'Dette er et forslag til reiseplan. Aktiviteter, restaurantservering, overnatting og avtaler må bekreftes med Skaugvoll Camping. Nordlys og vær kan aldri garanteres. Ingen bestilling er gjort.',
      email: 'Forbered en e-postforespørsel',
      emailSubject: 'Forespørsel om reise til Skaugvoll',
      emailIntro: 'Hei,\n\nJeg ønsker å spørre om denne mulige reisen til Skaugvoll:',
      emailNoBooking: '\n\nDette er kun en forespørsel. Jeg forstår at ingen bestilling er bekreftet før Skaugvoll Camping svarer.',
      copied: 'Reiseplanen er kopiert.',
      copyBlocked: 'Kopiering ble blokkert. En tekst du kan kopiere manuelt åpnes.',
      noPlan: 'Lag reiseplanen først.',
      updatePlan: 'Reisedetaljene er endret. Sett sammen planen på nytt.',
      shareTitle: 'Min reiseplan for Skaugvoll',
      manualCopy: 'Kopier denne reiseplanen:',
      downloaded: 'Reiseplanen er lastet ned som ren tekst.'
    }
  };

  let language = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'no';
  let currentPlan = null;
  let summaryKey = null;
  let invalidateGeneratedPlan = () => {};

  function localTodayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getArrivalError(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return words[language].invalidDate;
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return words[language].invalidDate;
    if (value < localTodayISO()) return words[language].invalidDate;
    return '';
  }

  function selectedInterests() {
    if (!form) return [];
    return Array.from(form.querySelectorAll('input[name="interests"]:checked'))
      .map(input => input.value)
      .filter(value => validInterests.has(value));
  }

  function readAndValidate() {
    if (!form) return { error: words[language].invalidDate, errorKey: 'invalidDate' };
    const arrivalInput = form.elements.namedItem('arrival');
    const nightsInput = form.elements.namedItem('nights');
    const guestsInput = form.elements.namedItem('guests');
    const stayInput = form.elements.namedItem('stay');
    const arrival = arrivalInput && arrivalInput.value;
    const nights = Number(nightsInput && nightsInput.value);
    const guests = Number(guestsInput && guestsInput.value);
    const stay = stayInput && stayInput.value;

    const dateError = getArrivalError(arrival);
    if (arrivalInput && typeof arrivalInput.setCustomValidity === 'function') arrivalInput.setCustomValidity(dateError);
    if (dateError) return { error: dateError, errorKey: 'invalidDate', field: arrivalInput };
    if (!Number.isInteger(nights) || nights < 2 || nights > 5) return { error: words[language].invalidNights, errorKey: 'invalidNights', field: nightsInput };
    if (!Number.isInteger(guests) || guests < 1 || guests > 8) return { error: words[language].invalidGuests, errorKey: 'invalidGuests', field: guestsInput };
    if (!validStays.has(stay)) return { error: words[language].invalidStay, errorKey: 'invalidStay', field: stayInput };
    return { value: { arrival, nights, guests, stay, interests: selectedInterests() } };
  }

  function formatDate(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'nb-NO', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  }

  function makeItinerary(plan) {
    const t = words[language];
    const days = [];
    const totalDays = plan.nights + 1;
    for (let number = 1; number <= totalDays; number += 1) {
      let text;
      if (number === 1) text = t.dayOne;
      else if (number === totalDays) text = t.departure;
      else text = t.middle;
      if (number > 1 && number < totalDays && plan.interests.length) {
        const activityDays = totalDays - 2;
        const dayIndex = number - 2;
        const start = Math.floor(dayIndex * plan.interests.length / activityDays);
        const end = Math.floor((dayIndex + 1) * plan.interests.length / activityDays);
        plan.interests.slice(start, end).forEach(interest => {
          if (t.activity[interest]) text += ` ${t.activity[interest]}`;
        });
      }
      days.push({ number, text });
    }
    return days;
  }

  function appendText(parent, tag, text, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function plainTextFor(plan) {
    const t = words[language];
    const lines = [
      t.intro,
      `${t.arrival}: ${formatDate(plan.arrival)}`,
      `${t.nights}: ${plan.nights}`,
      `${t.guests}: ${plan.guests}`,
      `${t.stay}: ${t.stayNames[plan.stay]}`,
      `${t.interests}: ${plan.interests.length ? plan.interests.map(key => t.interestNames[key]).join(', ') : t.noInterests}`,
      '',
      ...makeItinerary(plan).map(item => `${t.day} ${item.number}: ${item.text}`),
      '',
      t.caveat
    ];
    return lines.join('\n');
  }

  function renderPlan() {
    if (!currentPlan) return;
    const t = words[language];
    const itinerary = makeItinerary(currentPlan);
    summaryKey = 'planReady';
    if (summary) summary.textContent = t.planReady;
    const output = itineraryContent || result;
    if (output) {
      output.replaceChildren();
      appendText(output, 'h3', t.intro);
      const details = document.createElement('p');
      details.textContent = `${t.arrival}: ${formatDate(currentPlan.arrival)} · ${t.nights}: ${currentPlan.nights} · ${t.guests}: ${currentPlan.guests} · ${t.stay}: ${t.stayNames[currentPlan.stay]}`;
      output.appendChild(details);
      const interestLine = document.createElement('p');
      interestLine.textContent = `${t.interests}: ${currentPlan.interests.length ? currentPlan.interests.map(key => t.interestNames[key]).join(', ') : t.noInterests}`;
      output.appendChild(interestLine);
      const list = document.createElement('ol');
      list.className = 'trip-itinerary';
      itinerary.forEach(item => {
        const li = document.createElement('li');
        li.className = 'itinerary-day';
        appendText(li, 'h3', `${t.day} ${item.number}`);
        appendText(li, 'p', item.text);
        list.appendChild(li);
      });
      output.appendChild(list);
      appendText(output, 'p', t.caveat, 'trip-caveat');
    }
    if (result && result.hidden) result.hidden = false;
    if (enquiryLink) {
      const body = `${t.emailIntro}\n\n${plainTextFor(currentPlan)}${t.emailNoBooking}`;
      enquiryLink.href = `mailto:${businessEmail}?subject=${encodeURIComponent(t.emailSubject)}&body=${encodeURIComponent(body)}`;
    }
  }

  function setSummary(message, key = null) {
    summaryKey = key;
    if (summary) summary.textContent = message;
  }

  function updateLanguage() {
    const t = words[language];
    document.documentElement.lang = language === 'en' ? 'en' : 'nb';
    document.title = language === 'en' ? 'Arctic Adventure Skaugvoll — where the mountains meet the sea' : 'Arctic Adventure Skaugvoll — der fjellet møter havet';
    document.querySelectorAll('[data-no][data-en]').forEach(element => {
      element.innerHTML = element.getAttribute(language === 'en' ? 'data-en' : 'data-no') || '';
    });
    document.querySelectorAll('[data-no-aria-label][data-en-aria-label]').forEach(element => {
      element.setAttribute('aria-label', element.getAttribute(language === 'en' ? 'data-en-aria-label' : 'data-no-aria-label'));
    });
    document.querySelectorAll('[data-no-alt][data-en-alt]').forEach(element => {
      element.setAttribute('alt', element.getAttribute(language === 'en' ? 'data-en-alt' : 'data-no-alt'));
    });
    if (languageButton) {
      languageButton.textContent = language === 'en' ? 'NO' : 'EN';
      languageButton.setAttribute('aria-label', language === 'en' ? 'Switch to Norwegian' : 'Bytt til engelsk');
    }
    if (nav) nav.setAttribute('aria-label', language === 'en' ? 'Main menu' : 'Hovedmeny');
    const exploreLink = document.querySelector('.circle-link');
    if (exploreLink) exploreLink.setAttribute('aria-label', language === 'en' ? 'Explore Skaugvoll' : 'Utforsk Skaugvoll');
    const brand = document.querySelector('.site-header .brand');
    if (brand) brand.setAttribute('aria-label', language === 'en' ? 'Arctic Adventure Skaugvoll — home' : 'Arctic Adventure Skaugvoll — hjem');
    if (form) {
      const arrival = form.elements.namedItem('arrival');
      if (arrival) arrival.min = localTodayISO();
    }
    if (currentPlan) renderPlan();
    else if (summary && summaryKey) summary.textContent = t[summaryKey] || summary.textContent;
  }

  function showManualCopy(text) {
    const message = words[language].manualCopy;
    window.prompt(message, text);
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error('Clipboard API unavailable');
  }

  if (form) {
    const arrival = form.elements.namedItem('arrival');
    if (arrival) arrival.min = localTodayISO();
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (arrival && typeof arrival.setCustomValidity === 'function') arrival.setCustomValidity('');
      const checked = readAndValidate();
      if (checked.error) {
        setSummary(checked.error, checked.errorKey);
        if (summary) summary.dataset.generated = 'true';
        if (checked.field && typeof checked.field.focus === 'function') checked.field.focus();
        if (checked.field && typeof checked.field.reportValidity === 'function') checked.field.reportValidity();
        return;
      }
      currentPlan = checked.value;
      renderPlan();
      if (summary) summary.dataset.generated = 'true';
      if (result && typeof result.scrollIntoView === 'function') {
        result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      }
    });
    if (arrival) arrival.addEventListener('input', () => arrival.setCustomValidity(''));
    invalidateGeneratedPlan = () => {
      if (!currentPlan) return;
      currentPlan = null;
      summaryKey = 'updatePlan';
      setSummary(words[language].updatePlan, 'updatePlan');
      if (result) result.hidden = true;
      if (itineraryContent) itineraryContent.replaceChildren();
      if (enquiryLink) enquiryLink.href = `mailto:${businessEmail}`;
    };
    form.addEventListener('input', invalidateGeneratedPlan);
    form.addEventListener('change', invalidateGeneratedPlan);
  }

  if (languageButton) {
    languageButton.addEventListener('click', () => {
      language = language === 'en' ? 'no' : 'en';
      updateLanguage();
    });
  }

  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open', !expanded);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a[href^="#"]')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll('.plan-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      if (!form) return;
      const stay = trigger.getAttribute('data-stay');
      const interest = trigger.getAttribute('data-interest');
      if (stay && validStays.has(stay)) {
        const input = form.elements.namedItem('stay');
        if (input) input.value = stay;
      }
      if (interest && validInterests.has(interest)) {
        const input = form.querySelector(`input[name="interests"][value="${interest}"]`);
        if (input) input.checked = true;
      }
      invalidateGeneratedPlan();
      const plan = document.getElementById('plan');
      if (plan && typeof plan.scrollIntoView === 'function') {
        plan.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      if (!currentPlan) {
        setSummary(words[language].noPlan, 'noPlan');
        return;
      }
      const blob = new Blob([plainTextFor(currentPlan)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skaugvoll-trip-plan-${currentPlan.arrival}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSummary(words[language].downloaded, 'downloaded');
    });
  }

  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      if (!currentPlan) {
        setSummary(words[language].noPlan, 'noPlan');
        return;
      }
      const text = plainTextFor(currentPlan);
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({ title: words[language].shareTitle, text });
          return;
        } catch (error) {
          if (error && error.name === 'AbortError') return;
        }
      }
      try {
        await copyText(text);
        setSummary(words[language].copied, 'copied');
      } catch (_error) {
        setSummary(words[language].copyBlocked, 'copyBlocked');
        showManualCopy(text);
      }
    });
  }

  updateLanguage();
})();
