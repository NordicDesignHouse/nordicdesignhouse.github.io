const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const scrollButtons = document.querySelectorAll('[data-scroll]');
scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-scroll');
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const deviceShell = document.querySelector('.device-shell');
if (deviceShell) {
  deviceShell.addEventListener('pointermove', (event) => {
    const rect = deviceShell.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    deviceShell.style.transform = `rotateY(${x * 6}deg) rotateX(${y * -6}deg)`;
  });

  deviceShell.addEventListener('pointerleave', () => {
    deviceShell.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

function submitForm(event) {
  event.preventDefault();
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const name = document.getElementById('name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();

  if (!name || !email) {
    alert('Please fill required fields');
    return;
  }

  alert(`Thanks ${name} — your request is logged and our team will respond shortly.`);
  form.reset();
}

window.submitForm = submitForm;

