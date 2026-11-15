const scene = document.querySelector('#hero-scene');
const ringButton = document.querySelector('#ring-bell');
const status = document.querySelector('#bell-status');
const soundButton = document.querySelector('#sound-toggle');
const soundLabel = document.querySelector('#sound-label');
const soundIcon = document.querySelector('#sound-icon');
let soundEnabled = false;
let bellAudio;
let resetTimer;
let soundEpoch = 0;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function setSound(enabled) {
  soundEnabled = enabled;
  soundEpoch += 1;
  soundButton.setAttribute('aria-pressed', String(enabled));
  soundButton.setAttribute('aria-label', enabled ? 'Turn bell sound off' : 'Turn bell sound on');
  soundLabel.textContent = enabled ? 'Sound on' : 'Sound off';
  soundIcon.setAttribute('href', enabled ? '#i-sound' : '#i-mute');
  if (!enabled && bellAudio) { bellAudio.pause(); bellAudio.currentTime = 0; }
}
soundButton.addEventListener('click', () => setSound(!soundEnabled));
ringButton.addEventListener('click', () => {
  clearTimeout(resetTimer);
  scene.classList.add('rung');
  scene.classList.remove('wobble');
  if (!motionQuery.matches) { void scene.offsetWidth; scene.classList.add('wobble'); }
  status.textContent = 'A very small opening ceremony.';
  if (soundEnabled) {
    bellAudio ??= new Audio('/assets/bell.wav');
    const epoch = soundEpoch;
    bellAudio.currentTime = 0;
    bellAudio.play().catch(() => {
      if (epoch !== soundEpoch) return;
      setSound(false);
      status.textContent = 'The ants rang it. Your browser kept it quiet.';
    });
  }
  resetTimer = window.setTimeout(() => {
    scene.classList.remove('rung', 'wobble');
    status.textContent = 'Still tiny. Feeling very important.';
  }, 1600);
});
document.querySelector('#after-image').decode().catch(() => {});

const personalities = {
  proud: { file: 'proud', name: 'overconfident', copy: 'Overconfident. Perfect fit.' },
  nervous: { file: 'nervous', name: 'totally-calm', copy: 'Totally calm. Allegedly.' },
  excited: { file: 'excited', name: 'too-excited', copy: 'Too excited. Already celebrating.' }
};
const download = document.querySelector('#avatar-download');
document.querySelector('.ant-picker').addEventListener('change', (event) => {
  const ant = personalities[event.target.value];
  if (!ant) return;
  download.href = '/downloads/ant-' + ant.file + '.png';
  download.download = 'ANTS-' + ant.name + '.png';
  document.querySelector('#ant-personality').textContent = ant.copy;
});

const gallery = document.querySelector('#meme-gallery');
const prev = document.querySelector('#meme-prev');
const next = document.querySelector('#meme-next');
function updateGalleryControls() {
  prev.disabled = gallery.scrollLeft <= 2;
  next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 3;
}
function moveGallery(direction) {
  const first = gallery.querySelector('figure');
  const gap = parseFloat(getComputedStyle(gallery).columnGap) || 16;
  gallery.scrollBy({left: direction * (first.getBoundingClientRect().width + gap), behavior: motionQuery.matches ? 'instant' : 'smooth'});
}
prev.addEventListener('click', () => moveGallery(-1));
next.addEventListener('click', () => moveGallery(1));
gallery.addEventListener('scroll', updateGalleryControls, {passive:true});
window.addEventListener('resize', updateGalleryControls, {passive:true});
updateGalleryControls();

const contractButton = document.querySelector('#copy-contract');
const contractAddress = document.querySelector('#contract-address');
const contractCopyLabel = document.querySelector('#copy-contract-label');
const contractStatus = document.querySelector('#contract-status');
let copyResetTimer;

function copyWithSelection(address) {
  const field = document.createElement('textarea');
  field.value = address;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.append(field);
  try {
    field.focus();
    field.select();
    field.setSelectionRange(0, address.length);
    return document.execCommand('copy');
  } finally {
    field.remove();
    contractButton.focus({preventScroll:true});
  }
}

contractButton.addEventListener('click', async () => {
  const address = contractAddress.textContent.trim();
  let copied = false;
  try {
    await navigator.clipboard.writeText(address);
    copied = true;
  } catch {
    try { copied = copyWithSelection(address); } catch { /* Show the manual option below. */ }
  }

  clearTimeout(copyResetTimer);
  contractButton.toggleAttribute('data-copied', copied);
  contractCopyLabel.textContent = copied ? 'Copied!' : 'Copy CA';
  contractStatus.textContent = copied ? 'Contract address copied.' : 'Clipboard unavailable. Press and hold the address to copy it.';
  copyResetTimer = window.setTimeout(() => {
    contractButton.removeAttribute('data-copied');
    contractCopyLabel.textContent = 'Copy CA';
    contractStatus.textContent = '';
  }, copied ? 2200 : 7000);
});

