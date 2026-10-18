(() => {
  'use strict';

  const referenceDate = '2026-10-18';
  const bookings = [
    {ref:'DEMO-2601',guest:'Demogjest 01',arrival:'2026-10-17',departure:'2026-10-20',unit:'Panoramahytte',status:'confirmed',label:'Bekreftet',party:'2 gjester',note:'Ankomst etter kl. 16 · eksempelnotat'},
    {ref:'DEMO-2602',guest:'Demogjest 02',arrival:'2026-10-18',departure:'2026-10-22',unit:'Motellrom',status:'requested',label:'Forespurt',party:'1 gjest',note:'Spør om sen ankomst · eksempelnotat'},
    {ref:'DEMO-2603',guest:'Demogjest 03',arrival:'2026-10-20',departure:'2026-10-23',unit:'Campingplass',status:'pending',label:'Avventer',party:'4 gjester',note:'Ønsker plass nær sjøen · eksempelnotat'},
    {ref:'DEMO-2604',guest:'Demogjest 04',arrival:'2026-10-24',departure:'2026-10-27',unit:'Panoramahytte',status:'confirmed',label:'Bekreftet',party:'3 gjester',note:'Sauna vurderes separat · eksempelnotat'},
    {ref:'DEMO-2605',guest:'Demogjest 05',arrival:'2026-10-12',departure:'2026-10-14',unit:'Motellrom',status:'cancelled',label:'Avbestilt',party:'2 gjester',note:'Eksempel på avbestilt opphold'}
  ];
  const dateFormat = new Intl.DateTimeFormat('nb-NO',{day:'numeric',month:'short'});
  const byId = id => document.getElementById(id);
  const tbody = byId('booking-rows');
  const dialog = byId('booking-dialog');

  function dateLabel(value) {
    return dateFormat.format(new Date(`${value}T12:00:00`)).replace('.', '');
  }
  function stayLength(booking) {
    return Math.round((new Date(`${booking.departure}T12:00:00`) - new Date(`${booking.arrival}T12:00:00`)) / 86400000);
  }
  function renderCounts() {
    byId('count-total').textContent = bookings.length;
    byId('count-confirmed').textContent = bookings.filter(item => item.status === 'confirmed').length;
    byId('count-followup').textContent = bookings.filter(item => ['requested','pending'].includes(item.status)).length;
  }
  function renderBookings() {
    const term = byId('booking-search').value.trim().toLocaleLowerCase('nb-NO');
    const filter = byId('status-filter').value;
    const visible = bookings.filter(item => (filter === 'all' || item.status === filter) && `${item.guest} ${item.ref} ${item.unit} ${item.label} ${item.arrival} ${item.departure}`.toLocaleLowerCase('nb-NO').includes(term)).sort((a,b) => a.arrival.localeCompare(b.arrival));
    tbody.replaceChildren();
    visible.forEach(item => {
      const tr = document.createElement('tr');
      const guestCell = document.createElement('td');
      guestCell.innerHTML = `<span class="guest-name">${item.guest}</span><span class="booking-ref">${item.ref}</span>`;
      const stayCell = document.createElement('td');
      stayCell.innerHTML = `<span class="stay-date">${dateLabel(item.arrival)} – ${dateLabel(item.departure)}</span><span class="stay-sub">${stayLength(item)} netter</span>`;
      const unitCell = document.createElement('td');
      unitCell.innerHTML = `<span class="unit-name">${item.unit}</span>`;
      const statusCell = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `badge badge-${item.status}`;
      badge.textContent = item.label;
      statusCell.append(badge);
      const buttonCell = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'details-button';
      button.textContent = 'Se detaljer';
      button.setAttribute('aria-label', `Se detaljer for ${item.guest}, ${item.ref}`);
      button.addEventListener('click', () => showDetails(item));
      buttonCell.append(button);
      [guestCell,stayCell,unitCell,statusCell,buttonCell].forEach(cell => tr.append(cell));
      tbody.append(tr);
    });
    byId('empty-state').hidden = visible.length !== 0;
    tbody.closest('table').hidden = visible.length === 0;
  }
  function showDetails(item) {
    byId('dialog-title').textContent = `${item.guest} · ${item.ref}`;
    const fields = [
      ['Status',item.label],['Ankomst',`${dateLabel(item.arrival)} 2026`],['Avreise',`${dateLabel(item.departure)} 2026`],
      ['Overnatting',item.unit],['Reisefølge',item.party],['Merknad',item.note],['Referansedag',`${dateLabel(referenceDate)} 2026`]
    ];
    const list = byId('dialog-details');
    list.replaceChildren();
    fields.forEach(([label,value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term,description);
      list.append(row);
    });
    dialog.showModal();
  }

  renderCounts();
  renderBookings();
  byId('booking-search').addEventListener('input', renderBookings);
  byId('status-filter').addEventListener('change', renderBookings);

  const templates = {
    norway:'En liten pause ved kysten. Her møtes fjell, hav og den gode følelsen av å ha god tid. Velkommen til Skaugvoll Camping.\n\nSe konseptforslaget: https://calmdownoscar.com/playground/arctic_adventures/\n\n#skaugvoll #nordnorge #kystliv',
    winter:'Når mørket senker seg, får kysten et nytt lys. Ta vare på de stille vinterdagene – og la naturen bestemme tempoet.\n\nSe konseptforslaget: https://calmdownoscar.com/playground/arctic_adventures/\n\n#skaugvoll #vinterlys #nordnorge',
    english:'A little pause by the coast. Mountains, sea and room to take the day as it comes. Welcome to Skaugvoll Camping.\n\nExplore the concept: https://calmdownoscar.com/playground/arctic_adventures/\n\n#skaugvoll #northernNorway #coastlife',
    'english-winter':'As the evenings grow darker, the coast finds a different kind of light. Make space for quiet winter days and let nature set the pace.\n\nExplore the concept: https://calmdownoscar.com/playground/arctic_adventures/\n\n#skaugvoll #winterlight #northernNorway'
  };
  const caption = byId('caption');
  const templateSelect = byId('template-select');
  const preview = byId('caption-preview');
  const status = byId('copy-status');
  function updatePreview() { preview.textContent = caption.value; }
  templateSelect.addEventListener('change', () => {
    caption.value = templates[templateSelect.value];
    updatePreview();
    status.textContent = '';
    status.classList.remove('error');
  });
  caption.value = templates[templateSelect.value];
  caption.addEventListener('input', updatePreview);
  updatePreview();

  function fallbackCopy() {
    const previousFocus = document.activeElement;
    caption.focus();
    caption.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    caption.setSelectionRange(caption.value.length, caption.value.length);
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    return copied;
  }
  byId('copy-caption').addEventListener('click', async () => {
    status.textContent = '';
    status.classList.remove('error');
    let copied = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try { await navigator.clipboard.writeText(caption.value); copied = true; } catch (_) { copied = fallbackCopy(); }
    } else {
      copied = fallbackCopy();
    }
    if (copied) {
      status.textContent = 'Bildeteksten er kopiert.';
    } else {
      status.textContent = 'Kopiering ble blokkert. Marker teksten i feltet og kopier den manuelt.';
      status.classList.add('error');
      caption.focus();
      caption.select();
    }
  });
})();
