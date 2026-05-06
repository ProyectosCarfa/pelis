PELIS – Plataforma Web de Películas y Series

Aplicación web desarrollada como proyecto académico que permite visualizar información de películas 
y series mediante el consumo de APIs externas. El enfoque principal es la experiencia del usuario, 
el rendimiento y la organización del código.

_______________________________________________________________________________________________
Demo: Próximamente disponible (GitHub Pages)
Visualalo aqui: https://peliscarfita.rf.gd/

<img width="1536" height="1024" alt="ChatGPT Image 19 abr 2026, 11_18_22 a m" src="https://github.com/user-attachments/assets/3609a84e-b94b-42f1-ab04-6e4a63ac00cb" />

_______________________________________________________________________________________________
Descripción
Este proyecto consiste en una plataforma web donde los usuarios pueden explorar contenido 
audiovisual (películas, series y TV), visualizar detalles relevantes y reproducir contenido 
desde diferentes servidores.
Se ha desarrollado aplicando buenas prácticas en desarrollo web, estructuración de código y
consumo de APIs REST.

________________________________________________________________________________________________

Tecnologías utilizadas
* HTML5
* CSS3
* JavaScript (ES6+)
* APIs REST (The Movie Database u otras)
* Git y GitHub

_________________________________________________________________________________________________

Funcionalidades

* Búsqueda de películas y series
* Visualización de detalles (sinopsis, imagen, etc.)
* Reproducción desde múltiples servidores
* Interfaz dinámica y responsive
* Consumo de API en tiempo real

________________________________________________________________________________________________

📁 Estructura del proyecto

```
PELI/
│── index.html
│── styles.css
│── script.js
│── assets/
│── components/
```

________________________________________________________________________________________________

Cómo ejecutar el proyecto

1. Clonar el repositorio:

```bash
git clone https://github.com/ProyectosCarfa/pelis.git
```

2. Abrir el proyecto:

* Ejecutar el archivo `index.html` en el navegador
  o
* Usar una extensión como Live Server en VS Code

________________________________________________________________________________________________

Objetivo del proyecto

Este proyecto fue desarrollado con fines educativos para reforzar conocimientos en:

* Desarrollo web frontend
* Consumo de APIs
* Manipulación del DOM
* Control de versiones con Git

________________________________________________________________________________________________

Mejoras futuras

* Sistema de usuarios
* Lista de favoritos
* Recomendaciones personalizadas
* Optimización de rendimiento
* Deploy en producción

_________________________________________________________________________________________________

Autor

Carlos Alvines
Estudiante de Ingeniería de Sistemas
Contacto: 
Gmail: alvinescarlos887@gmail.com
Phone: 934007155
WhatsApp: 968661658

📌 Interesado en desarrollo web, software y soluciones tecnológicas.

_____________________________________________________________________________________________________

Licencia

Este proyecto es de uso educativo y puede ser utilizado como referencia o base para otros desarrollos.








































REDES


Activa IPv6
enable
configure terminal
ipv6 unicast-routing

Configurar interfaz G0/0
interface g0/0
ipv6 address 2001:db8:1:1::1/64
ipv6 address fe80::1 link-local
no shutdown
exit

Configurar interfaz G0/1
interface g0/1
ipv6 address 2001:db8:1:2::1/64
ipv6 address fe80::1 link-local
no shutdown
exit
Configurar interfaz Serial

interface s0/0/0
ipv6 address 2001:db8:1:a001::2/64
ipv6 address fe80::1 link-local
no shutdown
exit


Verificar
show ipv6 interface brief
_______________________________

PARTE 2: CONFIGURAR PCs Y SERVIDORES

👉 Vas uno por uno:

Click en PC → Desktop → IP Configuration




RED IZQUIERDA (2001:db8:1:1::/64)
| Dispositivo | IPv6            | Gateway |
| ----------- | --------------- | ------- |
| Sales       | 2001:db8:1:1::2 | fe80::1 |
| Billing     | 2001:db8:1:1::3 | fe80::1 |
| Accounting  | 2001:db8:1:1::4 | fe80::1 |



RED DERECHA (2001:db8:1:2::/64)


| Dispositivo | IPv6            | Gateway |
| ----------- | --------------- | ------- |
| Design      | 2001:db8:1:2::2 | fe80::1 |
| Engineering | 2001:db8:1:2::3 | fe80::1 |
| CAD         | 2001:db8:1:2::4 | fe80::1 |



PARTE 3: CONFIGURAR ISP

En el router ISP:

enable
configure terminal

interface s0/0/0
ipv6 address 2001:db8:1:a001::1/64
ipv6 address fe80::1 link-local
no shutdown


PARTE 4: PROBAR
1. Ping al ISP

Desde cualquier PC:

ping 2001:db8:1:a001::1



Probar conexión entre redes

Ejemplo:
Desde Sales:

ping 2001:db8:1:2::4





Navegador (importante)

En una PC:

Desktop → Web Browser
Probar:
2001:db8:1:1::4
2001:db8:1:2::4



