const STORAGE_KEY = 'gastos_ingresos';

// Elementos comunes
const tabRegistrar = document.getElementById('tab-registrar');
const tabEstadisticas = document.getElementById('tab-estadisticas');
const panelRegistrar = document.getElementById('panel-registrar');
const panelEstadisticas = document.getElementById('panel-estadisticas');
const btnExportar = document.getElementById('btn-exportar');
const btnImportar = document.getElementById('btn-importar');
const inputImportar = document.getElementById('input-importar');

// Panel Registrar
const formulario = document.getElementById('formulario');
const lista = document.getElementById('lista');
const vacio = document.getElementById('vacío');
const mesActualEl = document.getElementById('mes-actual');
const listaTitulo = document.getElementById('lista-titulo');
const btnMesAnterior = document.getElementById('btn-mes-anterior');
const btnMesSiguiente = document.getElementById('btn-mes-siguiente');
const statIngresos = document.getElementById('stat-ingresos');
const statGastos = document.getElementById('stat-gastos');
const statBalance = document.getElementById('stat-balance');
const fechaInput = document.getElementById('fecha');
const tipoSelect = document.getElementById('tipo');
const categoriaSelect = document.getElementById('categoria');
const btnGuardar = document.getElementById('btn-guardar');
const btnCancelarEdicion = document.getElementById('btn-cancelar-edicion');

// Filtros de la pestaña Estadísticas (los usa obtenerRegistrosFiltrados y cargarDatos)
const filtroTipo = document.getElementById('filtro-tipo');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroDesde = document.getElementById('filtro-desde');
const filtroHasta = document.getElementById('filtro-hasta');

// Panel Estadísticas
const statTotalIngresos = document.getElementById('stat-total-ingresos');
const statTotalGastos = document.getElementById('stat-total-gastos');
const statTotalBalance = document.getElementById('stat-total-balance');
const statsCategorias = document.getElementById('stats-categorias');
const statsMeses = document.getElementById('stats-meses');
const listaFiltrada = document.getElementById('lista-filtrada');
const vacioFiltrado = document.getElementById('vacío-filtrado');

// --- Configuración: 5 categorías predeterminadas SOLO ---
// Sin posibilidad de crear nuevas categorías
const CATEGORIAS_PREDEFINIDAS = [
    { id: 'comida', nombre: 'Comida', emoji: '🍔' },
    { id: 'ocio', nombre: 'Ocio', emoji: '🎮' },
    { id: 'transporte', nombre: 'Transporte', emoji: '🚌' },
    { id: 'salud', nombre: 'Salud', emoji: '💊' },
    { id: 'otros', nombre: 'Otros', emoji: '📦' }
];

// Inicializar categorías: solo las 5 predeterminadas
let categorias = [...CATEGORIAS_PREDEFINIDAS];

let registros = [];
let mesActual = new Date;

// Registro que se está editando ahora mismo (null si se está guardando uno nuevo)
let registroEditando = null;

// Guardar todos los registros en localStorage
function guardarRegistros() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
}

// --- FUNCION: Cargar categorías y datos ---
function cargarDatos() {
    // Cargar registros
    const datos = localStorage.getItem(STORAGE_KEY);
    if (datos) {
        try {
            registros = JSON.parse(datos);
        } catch {
            registros = [];
        }
    }

    // Llenar el selector de categorías con las 5 predeterminadas
    categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    filtroCategoria.innerHTML = '<option value="todas">Todas</option>';
    for (const cat of CATEGORIAS_PREDEFINIDAS) {
        const texto = cat.emoji + ' ' + cat.nombre;

        const opt = document.createElement('option');
        opt.value = cat.nombre;
        opt.textContent = texto;
        categoriaSelect.appendChild(opt);

        const optFiltro = document.createElement('option');
        optFiltro.value = cat.nombre;
        optFiltro.textContent = cat.nombre;
        filtroCategoria.appendChild(optFiltro);
    }

    fechaInput.value = formatearFechaInput(new Date());
    fechaInput.max = formatearFechaInput(new Date());
    renderizarRegistrar();
    renderizarEstadisticas();
}

// --- EDITAR / ELIMINAR REGISTROS ---
function empezarEdicion(registro) {
    registroEditando = registro;

    // Ir a la pestaña Registrar y rellenar el formulario con los datos actuales
    cambiarTab('registrar');
    tipoSelect.value = registro.tipo;
    tipoSelect.className = registro.tipo;
    document.getElementById('nombre').value = registro.nombre;
    document.getElementById('dinero').value = registro.dinero;
    categoriaSelect.value = registro.categoria;
    fechaInput.value = formatearFechaInput(new Date(registro.fecha));

    btnGuardar.textContent = 'Actualizar';
    btnCancelarEdicion.classList.remove('hidden');
    document.getElementById('nombre').focus();
}

function cancelarEdicion() {
    registroEditando = null;
    formulario.reset();
    fechaInput.value = formatearFechaInput(new Date());
    tipoSelect.className = '';
    btnGuardar.textContent = 'Guardar';
    btnCancelarEdicion.classList.add('hidden');
}

function eliminarRegistro(registro) {
    if (!confirm(`¿Eliminar "${registro.nombre}" (${formatearDinero(registro.dinero)})?`)) {
        return;
    }
    const indice = registros.indexOf(registro);
    if (indice === -1) return;
    registros.splice(indice, 1);
    guardarRegistros();

    // Si el registro eliminado era el que se estaba editando, limpiar el formulario
    if (registroEditando === registro) {
        cancelarEdicion();
    }
    renderizarTodo();
}

// --- FORMATOS ---
function formatearDinero(cantidad) {
    return cantidad.toFixed(2) + ' €';
}

function formatearMes(fecha) {
    const opciones = { month: 'long', year: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

function formatearFechaInput(fecha) {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const day = fecha.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatearMesInput(fecha) {
    const year = fecha.getFullYear();
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
}

function obtenerMesMasRecienteConDatos() {
    if (registros.length === 0) return null;
    const fechas = registros.map(r => new Date(r.fecha));
    const masReciente = new Date(Math.max(...fechas));
    return new Date(masReciente.getFullYear(), masReciente.getMonth(), 1);
}

function obtenerInicioMes(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function obtenerFinMes(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
}

function filtrarRegistrosMes(mes) {
    const inicio = obtenerInicioMes(mes).getTime();
    const fin = obtenerFinMes(mes).getTime();
    return registros.filter(r => r.fecha >= inicio && r.fecha <= fin);
}

function calcularStats(registrosLista) {
    let ingresos = 0;
    let gastos = 0;
    for (const r of registrosLista) {
        if (r.tipo === 'ingreso') ingresos += r.dinero;
        else gastos += r.dinero;
    }
    return { ingresos, gastos, balance: ingresos - gastos };
}

// --- RENDER PANEL REGISTRAR ---
function renderizarRegistrar() {
    const mesTexto = formatearMes(mesActual).replace(/^\w/, c => c.toUpperCase());
    mesActualEl.textContent = mesTexto;
    listaTitulo.textContent = 'Registros de ' + formatearMes(mesActual).toLowerCase();

    const registrosMes = filtrarRegistrosMes(mesActual);
    registrosMes.sort((a, b) => b.fecha - a.fecha);

    lista.innerHTML = '';
    if (registrosMes.length === 0) {
        vacio.classList.remove('hidden');
    } else {
        vacio.classList.add('hidden');
        for (const registro of registrosMes) {
            lista.appendChild(crearElementoRegistro(registro));
        }
    }

    actualizarStatsMes(registrosMes);
    actualizarNavegacion();
}

function actualizarStatsMes(registrosMes) {
    const { ingresos, gastos, balance } = calcularStats(registrosMes);
    statIngresos.textContent = '+' + formatearDinero(ingresos);
    statGastos.textContent = '-' + formatearDinero(gastos);
    statBalance.textContent = formatearDinero(balance);
    statBalance.className = 'stat-valor ' + (balance >= 0 ? 'positivo' : 'negativo');
}

function actualizarNavegacion() {
    const masRecienteSolo = obtenerMesMasRecienteConDatos()
        ? new Date(obtenerMesMasRecienteConDatos().getFullYear(), obtenerMesMasRecienteConDatos().getMonth(), 1)
        : null;
    const hoySolo = new Date();
    const mesActualSolo = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);

    btnMesSiguiente.disabled = mesActualSolo >= hoySolo;
    btnMesAnterior.disabled = !masRecienteSolo || mesActualSolo <= masRecienteSolo;
}

function cambiarMes(delta) {
    mesActual = new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1);
    renderizarRegistrar();
}

// --- RENDER PANEL ESTADÍSTICAS ---
function renderizarEstadisticas() {
    const filtrados = obtenerRegistrosFiltrados();
    const { ingresos, gastos, balance } = calcularStats(filtrados);

    statTotalIngresos.textContent = '+' + formatearDinero(ingresos);
    statTotalGastos.textContent = '-' + formatearDinero(gastos);
    statTotalBalance.textContent = formatearDinero(balance);
    statTotalBalance.className = 'stat-valor ' + (balance >= 0 ? 'positivo' : 'negativo');

    renderizarPorCategoria(filtrados);
    renderizarPorMes(filtrados);
    renderizarListaFiltrada(filtrados);
}

function obtenerRegistrosFiltrados() {
    let resultado = [...registros];

    if (filtroTipo.value !== 'todos') {
        resultado = resultado.filter(r => r.tipo === filtroTipo.value);
    }

    if (filtroCategoria.value !== 'todas') {
        resultado = resultado.filter(r => r.categoria === filtroCategoria.value);
    }

    if (filtroDesde.value) {
        const [year, month] = filtroDesde.value.split('-').map(Number);
        const inicio = new Date(year, month - 1, 1).getTime();
        resultado = resultado.filter(r => r.fecha >= inicio);
    }

    if (filtroHasta.value) {
        const [year, month] = filtroHasta.value.split('-').map(Number);
        const fin = new Date(year, month, 0, 23, 59, 59, 999).getTime();
        resultado = resultado.filter(r => r.fecha <= fin);
    }

    return resultado;
}

function renderizarPorCategoria(registrosLista) {
    const porCat = {};
    for (const r of registrosLista) {
        if (!porCat[r.categoria]) {
            porCat[r.categoria] = { ingreso: 0, gasto: 0 };
        }
        porCat[r.categoria][r.tipo] += r.dinero;
    }

    const totales = {};
    for (const cat of Object.keys(porCat)) {
        totales[cat] = porCat[cat].ingreso + porCat[cat].gasto;
    }
    const maxTotal = Math.max(...Object.values(totales), 1);

    statsCategorias.innerHTML = '';
    if (Object.keys(porCat).length === 0) {
        statsCategorias.innerHTML = '<p class="vacío">No hay datos</p>';
        return;
    }

    // Ordenar por total (mayor a menor)
    const catsOrdenadas = Object.keys(porCat).sort((a, b) => totales[b] - totales[a]);

    // Mapeo de colores para las 5 categorías
    const colores = {
        'comida': '#f59e0b',
        'ocio': '#8b5cf6',
        'transporte': '#06b6d4',
        'salud': '#ec4899',
        'otros': '#6b7280'
    };

    for (const cat of catsOrdenadas) {
        const datos = porCat[cat];
        const total = totales[cat];
        const pct = (total / maxTotal) * 100;
        const catObj = CATEGORIAS_PREDEFINIDAS.find(c => c.nombre === cat);
        const color = catObj ? colores[catObj.id] : '#6b7280';
        const emoji = catObj ? catObj.emoji : '📦';

        const div = document.createElement('div');
        div.className = 'barra-item';
        div.innerHTML = `
            <div class="barra-header">
                <div class="barra-nombre">
                    <span class="categoria-badge" style="background: ${color}22; color: ${color}">
                        ${emoji} ${cat}
                    </span>
                </div>
                <span class="barra-valor">${formatearDinero(total)}</span>
            </div>
            <div class="barra-progreso">
                <div class="barra-relleno" style="width: ${pct}%; background: ${color}"></div>
            </div>
            <div class="barra-meta">
                <span>Ingresos: +${formatearDinero(datos.ingreso)}</span>
                <span>Gastos: -${formatearDinero(datos.gasto)}</span>
            </div>
        `;
        statsCategorias.appendChild(div);
    }
}

function renderizarPorMes(registrosLista) {
    const porMes = {};
    for (const r of registrosLista) {
        const fecha = new Date(r.fecha);
        const key = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!porMes[key]) {
            porMes[key] = { ingreso: 0, gasto: 0, label: fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }) };
        }
        porMes[key][r.tipo] += r.dinero;
    }

    const totales = {};
    for (const key of Object.keys(porMes)) {
        totales[key] = porMes[key].ingreso + porMes[key].gasto;
    }
    const maxTotal = Math.max(...Object.values(totales), 1);

    statsMeses.innerHTML = '';
    if (Object.keys(porMes).length === 0) {
        statsMeses.innerHTML = '<p class="vacío">No hay datos</p>';
        return;
    }

    const mesesOrdenados = Object.keys(porMes).sort();

    for (const key of mesesOrdenados) {
        const datos = porMes[key];
        const total = totales[key];
        const pct = (total / maxTotal) * 100;
        const tipoDominante = datos.ingreso >= datos.gasto ? 'ingreso' : 'gasto';

        const div = document.createElement('div');
        div.className = 'barra-item';
        div.innerHTML = `
            <div class="barra-header">
                <div class="barra-nombre">${datos.label}</div>
                <span class="barra-valor ${tipoDominante}">${formatearDinero(total)}</span>
            </div>
            <div class="barra-progreso">
                <div class="barra-relleno mes" style="width: ${pct}%"></div>
            </div>
            <div class="barra-meta">
                <span>Ingresos: +${formatearDinero(datos.ingreso)}</span>
                <span>Gastos: -${formatearDinero(datos.gasto)}</span>
                <span>Balance: ${formatearDinero(datos.ingreso - datos.gasto)}</span>
            </div>
        `;
        statsMeses.appendChild(div);
    }
}

function renderizarListaFiltrada(registrosLista) {
    registrosLista.sort((a, b) => b.fecha - a.fecha);

    listaFiltrada.innerHTML = '';
    if (registrosLista.length === 0) {
        vacioFiltrado.classList.remove('hidden');
    } else {
        vacioFiltrado.classList.add('hidden');
        for (const registro of registrosLista) {
            listaFiltrada.appendChild(crearElementoRegistro(registro, true));
        }
    }
}

function crearElementoRegistro(registro, conFechaCompleta = false) {
    const li = document.createElement('li');
    li.className = 'lista-item ' + registro.tipo;

    const tipoTexto = registro.tipo === 'ingreso' ? 'Ingreso' : 'Gasto';
    const tipoClass = registro.tipo;
    const signo = registro.tipo === 'ingreso' ? '+' : '-';
    const dineroClass = registro.tipo;

    const fecha = new Date(registro.fecha);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const year = fecha.getFullYear();

    let fechaStr = `${dia}/${mes}`;
    if (conFechaCompleta) {
        fechaStr = `${dia}/${mes}/${year}`;
    }

    // Buscar emoji de la categoría
    const catObj = CATEGORIAS_PREDEFINIDAS.find(c => c.nombre === registro.categoria);
    const emoji = catObj ? catObj.emoji : '📦';

    li.innerHTML = `
        <div class="item-info">
            <div class="item-nombre">${escapeHtml(registro.nombre)}</div>
            <div class="item-meta">
                <span class="item-categoria">${emoji} ${escapeHtml(registro.categoria)}</span>
                <span class="item-tipo ${tipoClass}">${tipoTexto}</span>
                <span class="item-fecha">${fechaStr}</span>
            </div>
        </div>
        <span class="item-dinero ${dineroClass}">${signo}${formatearDinero(registro.dinero)}</span>
        <div class="item-acciones">
            <button type="button" class="btn-item editar" aria-label="Editar ${escapeHtml(registro.nombre)}">✏️</button>
            <button type="button" class="btn-item eliminar" aria-label="Eliminar ${escapeHtml(registro.nombre)}">🗑️</button>
        </div>
    `;

    li.querySelector('.btn-item.editar').addEventListener('click', () => empezarEdicion(registro));
    li.querySelector('.btn-item.eliminar').addEventListener('click', () => eliminarRegistro(registro));

    return li;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// --- EXPORTAR / IMPORTAR ---
function exportarDatos() {
    const datos = {
        version: 1,
        exportado: new Date().toISOString(),
        registros: registros,
        categorias: categorias
    };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos-ingresos-${formatearFechaInput(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarDatos(archivo) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            if (!datos.registros || !Array.isArray(datos.registros)) {
                alert('Archivo inválido: no contiene registros válidos');
                return;
            }
            const validos = datos.registros.filter(r =>
                r && typeof r.tipo === 'string' &&
                typeof r.nombre === 'string' &&
                typeof r.dinero === 'number' &&
                typeof r.categoria === 'string' &&
                typeof r.fecha === 'number'
            );
            if (validos.length !== datos.registros.length) {
                alert('Algunos registros tienen formato inválido y se ignorarán');
            }
            registros = validos;
            guardarRegistros();

            // Importar categorías si vienen en el archivo (solo las predeterminadas)
            if (datos.categorias && Array.isArray(datos.categorias)) {
                for (const catArchivo of datos.categorias) {
                    if (!CATEGORIAS_PREDEFINIDAS.find(c => c.id === catArchivo.id || c.nombre === catArchivo.nombre)) {
                        const catExistente = categorias.find(c => c.nombre === catArchivo.nombre);
                        if (!catExistente) {
                            const catPredeterminada = CATEGORIAS_PREDEFINIDAS.find(c => c.id === catArchivo.id || c.nombre === 'Otros');
                            if (catPredeterminada) {
                                categorias.push(catPredeterminada);
                            }
                        }
                    }
                }
            }

            const mesMasReciente = obtenerMesMasRecienteConDatos();
            if (mesMasReciente) mesActual = mesMasReciente;
            renderizarTodo();
            alert(`Importados ${validos.length} registros correctamente`);
        } catch (err) {
            alert('Error al leer el archivo: ' + err.message);
        }
        inputImportar.value = '';
    };
    reader.readAsText(archivo);
}

// --- TABS ---
function cambiarTab(tab) {
    if (tab === 'registrar') {
        tabRegistrar.classList.add('active');
        tabRegistrar.setAttribute('aria-selected', 'true');
        tabEstadisticas.classList.remove('active');
        tabEstadisticas.setAttribute('aria-selected', 'false');
        panelRegistrar.classList.add('active');
        panelRegistrar.hidden = false;
        panelEstadisticas.classList.remove('active');
        panelEstadisticas.hidden = true;
    } else {
        tabEstadisticas.classList.add('active');
        tabEstadisticas.setAttribute('aria-selected', 'true');
        tabRegistrar.classList.remove('active');
        tabRegistrar.setAttribute('aria-selected', 'false');
        panelEstadisticas.classList.add('active');
        panelEstadisticas.hidden = false;
        panelRegistrar.classList.remove('active');
        panelRegistrar.hidden = true;
        renderizarEstadisticas();
    }
}

function renderizarTodo() {
    renderizarRegistrar();
    if (!panelEstadisticas.hidden) {
        renderizarEstadisticas();
    }
}

// Event listeners
formulario.addEventListener('submit', function(e) {
    e.preventDefault();

    const tipo = tipoSelect.value;
    const nombre = document.getElementById('nombre').value.trim();
    const dinero = parseFloat(document.getElementById('dinero').value);
    const categoria = categoriaSelect.value;
    const fechaStr = fechaInput.value;

    if (!nombre || isNaN(dinero) || dinero <= 0 || !categoria || !fechaStr) {
        return;
    }

    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaTimestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();

    if (registroEditando) {
        // Modo edición: modificar el registro existente
        registroEditando.tipo = tipo;
        registroEditando.nombre = nombre;
        registroEditando.dinero = dinero;
        registroEditando.categoria = categoria;
        registroEditando.fecha = fechaTimestamp;

        cancelarEdicion();
    } else {
        // Modo normal: crear un registro nuevo
        const registro = {
            tipo: tipo,
            nombre: nombre,
            dinero: dinero,
            categoria: categoria,
            fecha: fechaTimestamp
        };

        registros.push(registro);

        formulario.reset();
        fechaInput.value = formatearFechaInput(new Date());
        tipoSelect.className = '';
    }

    guardarRegistros();
    renderizarTodo();
});

btnMesAnterior.addEventListener('click', () => cambiarMes(-1));
btnMesSiguiente.addEventListener('click', () => cambiarMes(1));

btnExportar.addEventListener('click', exportarDatos);
btnImportar.addEventListener('click', () => inputImportar.click());
inputImportar.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        importarDatos(e.target.files[0]);
    }
});

tabRegistrar.addEventListener('click', () => cambiarTab('registrar'));
tabEstadisticas.addEventListener('click', () => cambiarTab('estadisticas'));

// Select tipo - actualizar clase visual
tipoSelect.addEventListener('change', function() {
    this.className = this.value;
});

// Botón Cancelar: salir del modo edición
btnCancelarEdicion.addEventListener('click', cancelarEdicion);

// Inicializar todo
cargarDatos();