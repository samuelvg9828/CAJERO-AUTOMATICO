// Recuperar usuarios desde LocalStorage
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioActual = null; //se espera que llegue en un formato JSON que represente la lista de usuarios

// Mostrar formulario de inicio de sesión
function mostrarInicioSesion() {
    document.getElementById("inicioSesion").style.display = "block";
    document.getElementById("registro").style.display = "none";
    document.getElementById("panel").style.display = "none";
}

// Mostrar formulario de registro
function mostrarRegistro() {
    document.getElementById("inicioSesion").style.display = "none";
    document.getElementById("registro").style.display = "block";
    document.getElementById("panel").style.display = "none";
}

// Registro de usuario
function registrar() {
    let usuario = document.getElementById("usuarioNuevo").value;
    let contrasena = document.getElementById("contrasenaNueva").value;
    let confirmarContraseña = document.getElementById("confirmarContraseña").value;

    if (contrasena !== confirmarContraseña) {
        alert("La contraseña no coincide. Intenta de nuevo.");
        return;
    }

    if (usuario && contrasena) {
        if (usuarios.find(user => user.username === usuario)) {
            alert("El nombre de usuario ya está registrado.");
            return;
        }

        let nuevoUsuario = {
            username: usuario,
            password: contrasena,
            balance: 200000,
            historialTransferencias: []
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        Swal.fire({
            title: "¡Registro exitoso!",
            text: "¡Bienvenido A Nuestro Servicio!",
            icon: "success"
        });

        limpiarCamposRegistro();
    } else {
        alert("Por Favor, Ingresa Un Usuario Y Una Contraseña.");
    }
}

// Limpiar campos de registro
function limpiarCamposRegistro() {
    document.getElementById("usuarioNuevo").value = "";
    document.getElementById("contrasenaNueva").value = "";
    document.getElementById("confirmarContraseña").value = "";
}

// Función para iniciar sesión
function iniciarSesion() {
    let usuario = document.getElementById("usuario").value;
    let contrasena = document.getElementById("contrasena").value;

    usuarioActual = usuarios.find(user => user.username === usuario && user.password === contrasena);

    if (usuarioActual) {
        document.getElementById("inicioSesion").style.display = "none";
        document.getElementById("registro").style.display = "none";
        document.getElementById("panel").style.display = "block";

        document.getElementById("saldoUsuario").textContent = usuarioActual.username;
        document.getElementById("saldo").textContent = usuarioActual.balance;

        mostrarHistorialTransferencias();
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

// Transferir dinero
function transferir() {
    let destinatario = document.getElementById("destinatario").value;
    let monto = parseFloat(document.getElementById("montoTransferir").value);

    if (!destinatario || isNaN(monto) || monto <= 0) {
        alert("Por favor, ingresa un destinatario y un monto válido.");
        return; // Validar los datos
    }

    if (usuarioActual.balance < monto) {
        alert("No tienes suficiente saldo para realizar la transferencia.");
        return; // Verifica que el usuario si tenga ese saldo
    }

    let usuarioDestinatario = usuarios.find(user => user.username === destinatario); // Si no encuentra un usuario será undefined

    // Realizar la transferencia si el usuario destinatario existe
    if (usuarioDestinatario) {
        // Restar y sumar saldos
        usuarioActual.balance -= monto;
        usuarioDestinatario.balance += monto;

        // Registrar la transferencia en el historial del usuario que envía (solo registrada como "enviada")
        registrarTransferenciaEnviada(destinatario, monto);

        // Registrar la transferencia en el historial del usuario destinatario (solo registrada como "recibida")
        registrarTransferenciaRecibida(usuarioActual.username, monto);

        Swal.fire({
            title: "Transferencia Exitosa",
            text: "Se ha transferido $" + monto + " a " + destinatario,
            icon: "success"
        });

        // Guardar cambios en LocalStorage
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        // Actualizar saldo
        document.getElementById("saldo").textContent = usuarioActual.balance;
        mostrarHistorialTransferencias();
    } else {
        alert("El destinatario no existe.");
    }
}

// Registrar la transferencia en el historial del usuario que envía
function registrarTransferenciaEnviada(destinatario, monto) {
    usuarioActual.historialTransferencias.push({
        tipo: "Transferencia Enviada",
        destinatario: destinatario,
        monto: monto,
        fecha: new Date().toLocaleString()
    });
}

// Registrar la transferencia en el historial del usuario que recibe
function registrarTransferenciaRecibida(remitente, monto) {
    let usuarioDestinatario = usuarios.find(user => user.username === remitente);

    if (usuarioDestinatario) {
        usuarioDestinatario.historialTransferencias.push({
            tipo: "Transferencia Recibida",
            remitente: remitente, // Se agrega el nombre del remitente
            monto: monto,
            fecha: new Date().toLocaleString()
        });
    }
}


// Registrar la transferencia en el historial del destinatario (solo en el que recibe)
function registrarTransferenciaRecibida(remitente, monto) {
    let usuarioDestinatario = usuarios.find(user => user.username === remitente);

    if (usuarioDestinatario) {
        usuarioDestinatario.historialTransferencias.push({
            tipo: "Transferencia Recibida",
            remitente: remitente,
            monto: monto,
            fecha: new Date().toLocaleString()
        });
    }
}


// Mostrar historial de transferencias
function mostrarHistorialTransferencias() {
    let historial = document.getElementById("historialTransferencias");
    historial.innerHTML = "";  // Limpiar historial previo

    if (usuarioActual.historialTransferencias.length === 0) {
        historial.innerHTML = "<li>No hay transferencias realizadas.</li>";
    } else {
        // Iterar sobre las transferencias del usuario actual
        usuarioActual.historialTransferencias.forEach(transferencia => {
            let li = document.createElement("li");

            // Mostrar solo transferencias enviadas para el usuario que envía
            if (transferencia.tipo === "Transferencia Enviada") {
                li.textContent = transferencia.tipo + " a " + transferencia.destinatario + " por $" + transferencia.monto + " el " + transferencia.fecha;
            }

            // Mostrar consignaciones y retiros
            else if (transferencia.tipo === "Consignacion" || transferencia.tipo === "Retiro") {
                li.textContent = transferencia.tipo + " de $" + transferencia.monto + " el " + transferencia.fecha;
            }

            historial.appendChild(li);  // Agregar cada transferencia al historial
        });
    }
}




// Función para consignar dinero
function consignar() {
    let monto = parseFloat(document.getElementById("montoConsignar").value);

    if (isNaN(monto) || monto <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    usuarioActual.balance += monto;

    Swal.fire({
        title: "Consignación Exitosa",
        text: "Se ha consignado $" + monto,
        icon: "success"
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    document.getElementById("saldo").textContent = usuarioActual.balance;
}

// Función para retirar dinero
function retirar() {
    let monto = parseFloat(document.getElementById("montoRetirar").value);

    if (isNaN(monto) || monto <= 0) {
        alert("Por favor, ingresa un monto válido.");
        return;
    }

    if (usuarioActual.balance < monto) {
        alert("No tienes suficiente saldo para realizar el retiro.");
        return;
    }

    usuarioActual.balance -= monto;

    Swal.fire({
        title: "Retiro Exitoso",
        text: "Se ha retirado $" + monto,
        icon: "success"
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    document.getElementById("saldo").textContent = usuarioActual.balance;
}

// Cerrar sesión
function cerrarSesion() {
    usuarioActual = null;
    document.getElementById("inicioSesion").style.display = "block";
    document.getElementById("registro").style.display = "none";
    document.getElementById("panel").style.display = "none";
}

