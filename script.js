const modal = document.getElementById('modalLogout');
const openBtn = document.getElementById('btnOpenLogout');
const closeBtn = document.getElementById('confirmNo');

// Abrir al hacer clic en Cerrar Sesión
openBtn.onclick = () => {
    modal.style.display = 'flex';
};

// Cerrar al dar en Cancelar
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

// Cerrar si se hace clic fuera del cuadro
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
};