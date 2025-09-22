document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://127.0.0.1:5000/api/fanpage';

  const tablaBody = document.querySelector('#tablaFanPage tbody');
  const txtBuscar = document.getElementById('txtBuscar');
  const btnRecargar = document.getElementById('btnRecargar');
  const emptyState = document.getElementById('emptyState');

  // Modales
  const modalDetalle = new bootstrap.Modal(document.getElementById('modalDetalle'));
  const modalAgregar = new bootstrap.Modal(document.getElementById('modalAgregar'));
  const modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));

  // Elementos del modal Detalle
  const detalleBody = document.getElementById('detalleBody'); // (queda para compatibilidad)
  const detalleSubtitulo = document.getElementById('detalleSubtitulo');
  const detalleResumen = document.getElementById('detalleResumen');
  const btnDetRecargar = document.getElementById('btnDetalleRecargar');
  const btnDetGuardar = document.getElementById('btnDetalleGuardar');
  const btnAddCategoria = document.getElementById('btnAddCategoria');
  const btnAddPublicacion = document.getElementById('btnAddPublicacion');
  const listaCategorias = document.getElementById('listaCategorias');
  const listaPublicaciones = document.getElementById('listaPublicaciones');

  // Formularios agregar/editar
  const formAgregar = document.getElementById('formAgregar');
  const formEditar = document.getElementById('formEditar');

  // ======= Helpers de formato =======
  const fmtFecha = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
  };

  const badgeEstado = (v) =>
    `<span class="badge ${v === 'A' ? 'badge-active' : 'badge-inactive'}">${v === 'A' ? 'Activo' : 'Inactivo'}</span>`;

  // ======= Render listado =======
  const renderFilas = (items) => {
    tablaBody.innerHTML = '';
    if (!items || items.length === 0) {
      emptyState.classList.remove('d-none'); return;
    }
    emptyState.classList.add('d-none');

    items.forEach(doc => {
      const categorias = Array.isArray(doc.categoria) ? doc.categoria.length : 0;
      const publicaciones = Array.isArray(doc.publicacion) ? doc.publicacion.length : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${doc.nom_fan_pag ?? ''}</td>
        <td>${doc.des_fan_pag ?? ''}</td>
        <td>${doc.per_fan_pag ?? ''}</td>
        <td>${fmtFecha(doc.fec_fan_pag)}</td>
        <td class="text-center">${badgeEstado(doc.est_fan_pag)}</td>
        <td class="text-center">${categorias}</td>
        <td class="text-center">${publicaciones}</td>
        <td class="text-center">
  <div class="d-flex justify-content-center gap-2">
    <button class="btn btn-sm btn-outline-primary btn-ver" data-id="${doc._id}" data-bs-toggle="tooltip" title="Ver detalle">
      <i class="bi bi-eye"></i>
    </button>
    <button class="btn btn-sm btn-warning btn-editar" data-id="${doc._id}" data-bs-toggle="tooltip" title="Editar fan page">
      <i class="bi bi-pencil-square"></i>
    </button>
    <button class="btn btn-sm btn-danger btn-eliminar" data-id="${doc._id}" data-bs-toggle="tooltip" title="Eliminar fan page">
      <i class="bi bi-trash"></i>
    </button>
  </div>
</td>

      `;
      tablaBody.appendChild(tr);
      // Reinicializar tooltips cada vez que se vuelve a renderizar la tabla
    initTooltips();

    });

  };

  // ======= API =======
  const listar = async () => {
    try {
      const resp = await fetch(API_URL);
      let data = await resp.json();
      const q = txtBuscar.value?.trim().toLowerCase();
      if (q) {
        data = data.filter(r =>
          [r.nom_fan_pag, r.des_fan_pag, r.per_fan_pag]
            .some(v => String(v ?? '').toLowerCase().includes(q))
        );
      }
      renderFilas(data);
    } catch (err) {
      console.error(err); tablaBody.innerHTML = ''; emptyState.classList.remove('d-none');
    }
  };

  const obtenerPorId = async (id) => {
    const resp = await fetch(`${API_URL}/${id}`);
    if (!resp.ok) throw new Error('Error detalle');
    return resp.json();
  };

  const crear = async (payload) => {
    const resp = await fetch(API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error('Error crear');
  };

  const actualizar = async (id, payload) => {
    const resp = await fetch(`${API_URL}/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!resp.ok) throw new Error('Error actualizar');
  };

  const eliminar = async (id) => {
    const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!resp.ok) throw new Error('Error eliminar');
  };

  // ======= Búsqueda/recarga =======
  btnRecargar.addEventListener('click', listar);
  let timer = null;
  txtBuscar.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(listar, 250); });

  // ======= Estado local del detalle (para editar arrays) =======
  let detalleActual = null; // objeto fan_page
  let detalleId = null; // _id

  // Helpers UI (creación rápida de HTML)
  const el = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html.trim();
    return tmp.firstElementChild;
  };
  const chip = (txt) => `<span class="badge bg-light text-dark border">${txt}</span>`;
  const input = (id, label, val = '') => `
    <div class="mb-2">
      <label class="form-label" for="${id}">${label}</label>
      <input class="form-control form-control-sm" id="${id}" value="${val ?? ''}">
    </div>`;
  const textarea = (id, label, val = '') => `
    <div class="mb-2">
      <label class="form-label" for="${id}">${label}</label>
      <textarea class="form-control form-control-sm" id="${id}">${val ?? ''}</textarea>
    </div>`;

  // ======= Abrir Detalle / Editar / Eliminar desde la tabla =======
  tablaBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;

    // VER: ahora abre modal con CRUD anidado
    if (btn.classList.contains('btn-ver')) {
      await cargarDetalle(id);
    }

    if (btn.classList.contains('btn-editar')) {
      const data = await obtenerPorId(id);
      document.getElementById('edit_id').value = id;
      document.getElementById('edit_nom_fan_pag').value = data.nom_fan_pag;
      document.getElementById('edit_des_fan_pag').value = data.des_fan_pag;
      document.getElementById('edit_per_fan_pag').value = data.per_fan_pag;
      document.getElementById('edit_fec_fan_pag').value = data.fec_fan_pag?.substring(0, 10) || '';
      document.getElementById('edit_est_fan_pag').value = data.est_fan_pag;
      modalEditar.show();
    }

    if (btn.classList.contains('btn-eliminar')) {
      if (await askConfirm('¿Eliminar esta fan page?')) { await eliminar(id); listar(); }
    }
  });

  // ======= Cargar y renderizar detalle =======
  const cargarDetalle = async (id) => {
    try {
      const data = await obtenerPorId(id);
      detalleActual = JSON.parse(JSON.stringify(data)); // clon profundo simple
      detalleId = id;
      renderDetalle();
      modalDetalle.show();
    } catch (err) {
      console.error('detalle', err);
      alert('No se pudo cargar el detalle.');
    }
  };

  const renderDetalle = () => {
    const d = detalleActual || {};
    if (detalleSubtitulo) detalleSubtitulo.textContent = `ID: ${d._id ?? ''}`;

    if (detalleResumen) {
      detalleResumen.innerHTML = `
        <div class="row g-3">
          <div class="col-md-6">
            ${input('det_nom', 'Nombre', d.nom_fan_pag)}
            ${textarea('det_des', 'Descripción', d.des_fan_pag)}
          </div>
          <div class="col-md-3">
            ${input('det_per', 'Avatar (archivo)', d.per_fan_pag)}
          </div>
          <div class="col-md-3">
            ${input('det_fec', 'Fecha (ISO o yyyy-mm-dd)', (d.fec_fan_pag || '').toString().substring(0, 10))}
            <div class="mb-2">
              <label class="form-label" for="det_est">Estatus</label>
              <select id="det_est" class="form-select form-select-sm">
                <option value="A" ${d.est_fan_pag === 'A' ? 'selected' : ''}>Activo</option>
                <option value="I" ${d.est_fan_pag === 'I' ? 'selected' : ''}>Inactivo</option>
              </select>
            </div>
            <div class="small text-muted">
              ${chip(`categorías: ${Array.isArray(d.categoria) ? d.categoria.length : 0}`)}
              ${chip(`publicaciones: ${Array.isArray(d.publicacion) ? d.publicacion.length : 0}`)}
            </div>
          </div>
        </div>
      `;
    }

    renderCategorias();
    renderPublicaciones();
  };

  // ======= CATEGORÍAS =======
  const renderCategorias = () => {
    const arr = detalleActual?.categoria || [];
    if (!listaCategorias) return;
    listaCategorias.innerHTML = '';
    if (!arr.length) {
      listaCategorias.innerHTML = `<div class="text-muted">No hay categorías.</div>`;
      return;
    }

    arr.forEach((c, idx) => {
      const card = el(`
        <div class="card card-body mb-2">
          <div class="row g-2 align-items-end">
            <div class="col-md-2">
              ${input(`cat_id_${idx}`, 'ID', c._id ?? '')}
            </div>
            <div class="col-md-3">
              ${input(`cat_nom_${idx}`, 'Nombre', c.nom_cat ?? '')}
            </div>
            <div class="col-md-5">
              ${input(`cat_des_${idx}`, 'Descripción', c.des_cat ?? '')}
            </div>
            <div class="col-md-1">
              <label class="form-label">Est.</label>
              <select id="cat_est_${idx}" class="form-select form-select-sm">
                <option value="a" ${c.est_cat === 'a' ? 'selected' : ''}>a</option>
                <option value="i" ${c.est_cat === 'i' ? 'selected' : ''}>i</option>
              </select>
            </div>
            <div class="col-md-1 text-end">
              <button class="btn btn-sm btn-outline-danger" data-idx="${idx}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `);
      // eliminar categoría
      card.querySelector('button').addEventListener('click', (e) => {
        const i = Number(e.currentTarget.dataset.idx);
        detalleActual.categoria.splice(i, 1);
        renderCategorias();
      });
      listaCategorias.appendChild(card);
    });
  };

  if (btnAddCategoria) {
    btnAddCategoria.addEventListener('click', () => {
      if (!detalleActual.categoria) detalleActual.categoria = [];
      const nextId = (Math.max(0, ...detalleActual.categoria.map(x => Number(x._id) || 0)) + 1);
      detalleActual.categoria.push({ _id: nextId, nom_cat: '', des_cat: '', est_cat: 'a' });
      renderCategorias();
    });
  }

  // ======= PUBLICACIONES (+ MULTIMEDIA) =======
  const renderPublicaciones = () => {
    const arr = detalleActual?.publicacion || [];
    if (!listaPublicaciones) return;
    listaPublicaciones.innerHTML = '';
    if (!arr.length) {
      listaPublicaciones.innerHTML = `<div class="text-muted">No hay publicaciones.</div>`;
      return;
    }

    arr.forEach((p, idx) => {
      const card = el(`
        <div class="card card-body mb-3">
          <div class="row g-2">
            <div class="col-md-1">
              ${input(`pub_id_${idx}`, 'ID', p._id ?? '')}
            </div>
            <div class="col-md-5">
              ${input(`pub_tit_${idx}`, 'Título', p.tit_pub ?? '')}
              ${textarea(`pub_des_${idx}`, 'Descripción', p.des_pub ?? '')}
            </div>
            <div class="col-md-3">
              ${input(`pub_fec_${idx}`, 'Fecha (yyyy-mm-dd)', (p.fec_pub || '').toString().substring(0, 10))}
            </div>
            <div class="col-md-2">
              <label class="form-label">Estatus</label>
              <select id="pub_est_${idx}" class="form-select form-select-sm">
                <option value="A" ${p.est_pub === 'A' ? 'selected' : ''}>A</option>
                <option value="I" ${p.est_pub === 'I' ? 'selected' : ''}>I</option>
              </select>
            </div>
            <div class="col-md-1 text-end">
              <label class="form-label d-block">&nbsp;</label>
              <button class="btn btn-sm btn-outline-danger" data-idx="${idx}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Multimedia -->
          <div class="mt-3">
            <div class="d-flex align-items-center justify-content-between">
              <strong>Multimedia</strong>
              <button class="btn btn-sm btn-outline-primary" data-add-mul="${idx}">
                <i class="bi bi-plus-circle"></i> Agregar multimedia
              </button>
            </div>
            <div id="mul_wrap_${idx}" class="mt-2"></div>
          </div>
        </div>
      `);

      // eliminar publicación
      card.querySelector('button.btn-outline-danger').addEventListener('click', (e) => {
        const i = Number(e.currentTarget.dataset.idx);
        detalleActual.publicacion.splice(i, 1);
        renderPublicaciones();
      });

      // agregar multimedia
      card.querySelector('button[data-add-mul]').addEventListener('click', (e) => {
        const i = Number(e.currentTarget.dataset.addMul);
        if (!detalleActual.publicacion[i].multimedia) detalleActual.publicacion[i].multimedia = [];
        const nextMid = (Math.max(0, ...detalleActual.publicacion[i].multimedia.map(m => Number(m._id) || 0)) + 1);
        detalleActual.publicacion[i].multimedia.push({ _id: nextMid, tip_mul: 'imagen', url_mul: '' });
        renderMultimedia(i);
      });

      listaPublicaciones.appendChild(card);
      
      renderMultimedia(idx);
    });
  };

  if (btnAddPublicacion) {
    btnAddPublicacion.addEventListener('click', () => {
      if (!detalleActual.publicacion) detalleActual.publicacion = [];
      const nextId = (Math.max(0, ...detalleActual.publicacion.map(x => Number(x._id) || 0)) + 1);
      detalleActual.publicacion.push({
        _id: nextId, tit_pub: '', des_pub: '', fec_pub: '', est_pub: 'A', multimedia: []
      });
      renderPublicaciones();
    });
  }

  const renderMultimedia = (pubIdx) => {
    const wrap = document.getElementById(`mul_wrap_${pubIdx}`);
    if (!wrap) return;
    const list = detalleActual.publicacion?.[pubIdx]?.multimedia || [];
    wrap.innerHTML = '';

    if (!list.length) {
      wrap.innerHTML = `<div class="text-muted">Sin multimedia.</div>`;
      return;
    }

    list.forEach((m, midx) => {
      const row = el(`
        <div class="row g-2 align-items-end mb-2">
          <div class="col-md-1">
            ${input(`mul_id_${pubIdx}_${midx}`, 'ID', m._id ?? '')}
          </div>
          <div class="col-md-2">
            <div>
              <label class="form-label" for="mul_tip_${pubIdx}_${midx}">Tipo</label>
              <select id="mul_tip_${pubIdx}_${midx}" class="form-select form-select-sm">
                <option value="imagen" ${m.tip_mul === 'imagen' ? 'selected' : ''}>imagen</option>
                <option value="video"  ${m.tip_mul === 'video' ? 'selected' : ''}>video</option>
              </select>
            </div>
          </div>
          <div class="col-md-8">
            ${input(`mul_url_${pubIdx}_${midx}`, 'URL', m.url_mul ?? '')}
          </div>
          <div class="col-md-1 text-end">
            <button class="btn btn-sm btn-outline-danger" data-p="${pubIdx}" data-m="${midx}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `);
      row.querySelector('button').addEventListener('click', (e) => {
        const p = Number(e.currentTarget.dataset.p);
        const mIdx = Number(e.currentTarget.dataset.m);
        detalleActual.publicacion[p].multimedia.splice(mIdx, 1);
        renderMultimedia(p);
      });
      wrap.appendChild(row);
    });
  };

  // ======= Botones del modal: Recargar y Guardar =======
  if (btnDetRecargar) {
    btnDetRecargar.addEventListener('click', async () => {
      if (!detalleId) return;
      await cargarDetalle(detalleId);
    });
  }

  if (btnDetGuardar) {
    btnDetGuardar.addEventListener('click', async () => {
      if (!detalleId || !detalleActual) return;

      // Volcar cabecera
      detalleActual.nom_fan_pag = document.getElementById('det_nom').value;
      detalleActual.des_fan_pag = document.getElementById('det_des').value;
      detalleActual.per_fan_pag = document.getElementById('det_per').value;
      detalleActual.fec_fan_pag = document.getElementById('det_fec').value || null;
      detalleActual.est_fan_pag = document.getElementById('det_est').value;

      // Volcar categorías
      if (Array.isArray(detalleActual.categoria)) {
        detalleActual.categoria = detalleActual.categoria.map((c, idx) => ({
          _id: Number(document.getElementById(`cat_id_${idx}`).value) || c._id,
          nom_cat: document.getElementById(`cat_nom_${idx}`).value,
          des_cat: document.getElementById(`cat_des_${idx}`).value,
          est_cat: document.getElementById(`cat_est_${idx}`).value,
        }));
      }

      // Volcar publicaciones + multimedia
      if (Array.isArray(detalleActual.publicacion)) {
        detalleActual.publicacion = detalleActual.publicacion.map((p, idx) => {
          const out = {
            _id: Number(document.getElementById(`pub_id_${idx}`).value) || p._id,
            tit_pub: document.getElementById(`pub_tit_${idx}`).value,
            des_pub: document.getElementById(`pub_des_${idx}`).value,
            fec_pub: document.getElementById(`pub_fec_${idx}`).value || null,
            est_pub: document.getElementById(`pub_est_${idx}`).value,
            multimedia: [],
          };
          const mm = p.multimedia || [];
          for (let m = 0; m < mm.length; m++) {
            const idEl = document.getElementById(`mul_id_${idx}_${m}`);
            const tipEl = document.getElementById(`mul_tip_${idx}_${m}`);
            const urlEl = document.getElementById(`mul_url_${idx}_${m}`);
            if (idEl && tipEl && urlEl) {
              out.multimedia.push({
                _id: Number(idEl.value) || mm[m]._id,
                tip_mul: tipEl.value,
                url_mul: urlEl.value
              });
            }
          }
          return out;
        });
      }

      try {
        await actualizar(detalleId, {
          nom_fan_pag: detalleActual.nom_fan_pag,
          des_fan_pag: detalleActual.des_fan_pag,
          per_fan_pag: detalleActual.per_fan_pag,
          fec_fan_pag: detalleActual.fec_fan_pag,
          est_fan_pag: detalleActual.est_fan_pag,
          categoria: detalleActual.categoria,
          publicacion: detalleActual.publicacion
        });
        alert('¡Cambios guardados!');
        await listar();
      } catch (e) {
        console.error(e);
        alert('No se pudo guardar.');
      }
    });
  }

  // ======= Crear / Editar (formularios principales) =======
  formAgregar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      nom_fan_pag: document.getElementById('add_nom_fan_pag').value,
      des_fan_pag: document.getElementById('add_des_fan_pag').value,
      per_fan_pag: document.getElementById('add_per_fan_pag').value,
      fec_fan_pag: document.getElementById('add_fec_fan_pag').value,
      est_fan_pag: document.getElementById('add_est_fan_pag').value,
      categoria: [], publicacion: []
    };
    await crear(payload);
    modalAgregar.hide(); formAgregar.reset(); listar();
  });

  formEditar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit_id').value;
    const payload = {
      nom_fan_pag: document.getElementById('edit_nom_fan_pag').value,
      des_fan_pag: document.getElementById('edit_des_fan_pag').value,
      per_fan_pag: document.getElementById('edit_per_fan_pag').value,
      fec_fan_pag: document.getElementById('edit_fec_fan_pag').value,
      est_fan_pag: document.getElementById('edit_est_fan_pag').value,
    };
    await actualizar(id, payload);
    modalEditar.hide(); listar();
  });

  // Inicializar tooltips de Bootstrap en toda la página
const initTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
};

  // ======= Inicio =======
  listar().then(initTooltips);
});