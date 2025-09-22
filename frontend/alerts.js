// ui-enhancements.js (auto-toasts en fetch para POST/PUT/PATCH/DELETE)
(() => {
  /* ========= PALETA desde CSS variables ========= */
  const css = getComputedStyle(document.documentElement);
  const BRAND_PRIMARY = css.getPropertyValue('--brand-primary')?.trim() || '#522a70';
  const BRAND_ACCENT  = css.getPropertyValue('--brand-accent')?.trim()  || '#fbd050';
  const BRAND_PAPER   = css.getPropertyValue('--brand-paper')?.trim()   || '#faf8f3';
  const BRAND_DARK    = css.getPropertyValue('--brand-dark')?.trim()    || '#222023';

  /* ========= 1) Estilos para overlay/spinner y swal ========= */
  const style = document.createElement('style');
  style.textContent = `
  .global-spinner-overlay{
    position: fixed; inset: 0; background: rgba(250,248,243,.70);
    display: none; align-items: center; justify-content: center; z-index: 20000;
    backdrop-filter: blur(1px);
  }
  .global-spinner-card{
    background: #fff; border-radius: 16px; padding: 1rem 1.25rem;
    box-shadow: 0 10px 30px rgba(0,0,0,.12); display: flex; align-items: center; gap: .75rem;
    border: 1px solid rgba(0,0,0,.06);
  }
  .global-spinner-text{ font-weight: 600; color: ${BRAND_DARK}; }
  .global-spinner-card .spinner-border{
    color: ${BRAND_PRIMARY};
    border-right-color: transparent !important;
  }

  /* SweetAlert2 themed */
  .swal2-popup{
    background: ${BRAND_PAPER} !important;
    color: ${BRAND_DARK} !important;
    border-radius: 16px !important;
    border: 1px solid rgba(0,0,0,.06);
  }
  .swal2-title{ color: ${BRAND_DARK} !important; }
  .swal2-styled.swal2-confirm{
    background: ${BRAND_PRIMARY} !important;
    border: none !important;
  }
  .swal2-styled.swal2-cancel{
    background: ${BRAND_ACCENT} !important;
    color: #222 !important;
    border: none !important;
  }
  .swal2-actions{ gap: .5rem; }
  .swal2-icon.swal2-success [class^='swal2-success-line'],
  .swal2-icon.swal2-success .swal2-success-ring{
    border-color: ${BRAND_PRIMARY} !important;
    color: ${BRAND_PRIMARY} !important;
  }
  .swal2-icon.swal2-warning{ border-color: ${BRAND_ACCENT} !important; color: ${BRAND_ACCENT} !important; }
  `;
  document.head.appendChild(style);

  /* ========= 2) Overlay con spinner Bootstrap ========= */
  const overlay = document.createElement('div');
  overlay.className = 'global-spinner-overlay';
  overlay.innerHTML = `
    <div class="global-spinner-card">
      <div class="spinner-border" role="status" aria-hidden="true"></div>
      <div class="global-spinner-text">Procesando...</div>
    </div>
  `;
  document.body.appendChild(overlay);

  let pendingFetches = 0;
  const showSpinner = () => { overlay.style.display = 'flex'; };
  const hideSpinner = () => { overlay.style.display = 'none'; };

  /* ========= 3) Toast helpers ========= */
  // Contenedor Bootstrap Toasts
  let toastWrap = document.getElementById('bsToastWrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.id = 'bsToastWrap';
    toastWrap.className = 'toast-container position-fixed p-3 top-0 end-0';
    toastWrap.style.zIndex = 20050;
    document.body.appendChild(toastWrap);
  }

  // Estilos toast tematizados
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    .toast.brand { border-radius: 12px; overflow: hidden; border:1px solid rgba(0,0,0,.06); }
    .toast.brand .toast-header{
      background: var(--brand-primary); color:#fff; border-bottom: none;
    }
    .toast.brand .btn-close{ filter: invert(1) grayscale(100%); opacity: .85; }
    .toast.brand .toast-body{ background: var(--brand-paper); color: var(--brand-dark); }
    .toast.brand.success .toast-header{ background: #67388bff; }
    .toast.brand.danger  .toast-header{ background: #fbd050; }
    .toast.brand.warning .toast-header{ background: var(--brand-accent); color:#222; }
    .toast.brand.info    .toast-header{ background: var(--brand-primary); }
  `;
  document.head.appendChild(toastStyle);

  // API pública para toasts manuales (por si los quieres usar)
  window.bsToast = (message='Operación', variant='info') => {
    const toastEl = document.createElement('div');
    toastEl.className = `toast brand ${variant}`;
    toastEl.role = 'alert';
    toastEl.ariaLive = 'assertive';
    toastEl.ariaAtomic = 'true';
    toastEl.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto text-capitalize">${variant}</strong>
        <small>ahora</small>
        <button type="button" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    toastWrap.appendChild(toastEl);
    const t = new bootstrap.Toast(toastEl, { delay: 2500 });
    t.show();
    toastEl.addEventListener('hidden.bs.toast', ()=> toastEl.remove());
  };

  // Toasters SweetAlert2 (por compatibilidad con versiones previas)
  window.toastOk  = (msg='Operación exitosa') => Swal?.fire({icon:'success', title: msg, toast:true, timer:2200, showConfirmButton:false, position:'top-end'});
  window.toastErr = (msg='Ocurrió un error')  => Swal?.fire({icon:'error',   title: msg, toast:true, timer:2500, showConfirmButton:false, position:'top-end'});

  /* ========= 4) Parche de fetch global con spinner + auto-toasts ========= */
  const nativeFetch = window.fetch.bind(window);

  const methodLabel = (m) => {
    switch (m) {
      case 'POST': return {msg:'Creado correctamente',  variant:'Registrado!'};
      case 'PUT':
      case 'PATCH': return {msg:'Actualizado correctamente', variant:'Actualizado!'};
      case 'DELETE': return {msg:'Eliminado correctamente',  variant:'Eliminado!'};
      default: return null;
    }
  };

  // intenta leer mensaje de error del backend
  const readErrorMessage = async (res) => {
    try {
      const clone = res.clone();
      const ct = clone.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const j = await clone.json();
        return j?.message || j?.error || res.statusText || 'Error en la solicitud';
      } else {
        const t = await clone.text();
        return t?.trim() || res.statusText || 'Error en la solicitud';
      }
    } catch {
      return res.statusText || 'Error en la solicitud';
    }
  };

  window.fetch = async (...args) => {
    // detectar método
    const init = (args[1] || {});
    const method = String(init.method || 'GET').toUpperCase();

    try {
      pendingFetches++;
      if (pendingFetches === 1) showSpinner();

      const res = await nativeFetch(...args);

      // Auto-toast de error si no es ok
      if (!res.ok) {
        const errMsg = await readErrorMessage(res);
        window.bsToast?.(errMsg, 'danger');
        return res;
      }

      // Auto-toast de éxito solo para métodos de escritura
      const label = methodLabel(method);
      if (label) window.bsToast?.(label.msg, label.variant);

      return res;
    } catch (e) {
      // Errores de red
      window.bsToast?.('Error de red o CORS', 'danger');
      throw e;
    } finally {
      pendingFetches = Math.max(0, pendingFetches - 1);
      if (pendingFetches === 0) hideSpinner();
    }
  };

  /* ========= 5) SweetAlert2: override de alert() con paleta ========= */
  const swal = (window.Swal && Swal.mixin) ? Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-primary',
      cancelButton:  'btn btn-accent'
    },
    buttonsStyling: false,
    background: BRAND_PAPER,
    color: BRAND_DARK
  }) : null;

  const pickIcon = (msg = '') => {
    const m = msg.toLowerCase();
    if (m.includes('error') || m.includes('no se pudo') || m.includes('fall')) return 'error';
    if (m.includes('éxito') || m.includes('guardad') || m.includes('listo') || m.includes('eliminad')) return 'success';
    if (m.includes('advert') || m.includes('cuidado') || m.includes('atención')) return 'warning';
    return 'info';
  };

  const originalAlert = window.alert;
  window.alert = (message) => {
    if (swal) {
      return swal.fire({
        title: 'Aviso',
        text: String(message ?? ''),
        icon: pickIcon(String(message ?? '')),
        confirmButtonText: 'Aceptar'
      });
    }
    return originalAlert(message);
  };

  /* ========= 6) Confirmación SweetAlert2 con paleta ========= */
  window.askConfirm = async (message = '¿Estás seguro?') => {
    try {
      if (!window.Swal || !Swal.fire) return Promise.resolve(window.confirm(message));

      const mix = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton:  'btn btn-accent'
        },
        buttonsStyling: false,
        background: BRAND_PAPER,
        color: BRAND_DARK
      });

      const res = await mix.fire({
        title: 'Confirmar',
        text: String(message),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });
      return !!res.isConfirmed;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
})();
