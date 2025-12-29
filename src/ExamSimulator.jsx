import React, { useEffect, useMemo, useState } from "react";
import { RotateCcw, BookOpen } from "lucide-react";

const EXAM_DURATION_SECONDS = 60 * 60; // 60 minutos

const SUBJECTS = {
  ISO: "Implantación de Sistemas Operativos",
  REDES: "Planificación y Administración de Redes",
  IPE1: "Itinerario Personal para la Empleabilidad I",
  BBDD: "Bases de Datos", // <--- Añadimos esta línea
};

const ExamSimulator = () => {
  // =========================
  // BANCO DE PREGUNTAS
  // Cada pregunta lleva: subject
  // =========================
  const allQuestions = [
    // =========================
    // ISO (lo que ya tenías)
    // =========================
    {
      id: 1,
      subject: "ISO",
      unit: "UT1",
      question: "¿Cuál es la principal diferencia entre la arquitectura Von Neumann y Harvard?",
      options: [
        "Von Neumann separa física memoria de datos e instrucciones",
        "Harvard separa físicamente la memoria de instrucciones y datos",
        "Von Neumann no tiene cuello de botella",
        "Harvard usa únicamente MBR",
      ],
      correct: 1,
      explanation:
        "La arquitectura Harvard separa físicamente la memoria de instrucciones y la de datos, eliminando el cuello de botella de Von Neumann.",
    },
    {
      id: 2,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué tipo de kernel ejecuta todos los servicios en modo privilegiado?",
      options: ["Microkernel", "Kernel híbrido", "Kernel monolítico", "Kernel distribuido"],
      correct: 2,
      explanation:
        "El kernel monolítico ejecuta todo el código del sistema operativo en un único espacio de memoria privilegiado.",
    },
    {
      id: 3,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué función NO es básica de un sistema operativo?",
      options: ["Gestión de procesos", "Gestión de memoria", "Diseño de hardware", "Gestión de archivos"],
      correct: 2,
      explanation:
        "El diseño de hardware no es función del sistema operativo. Las funciones básicas son gestión de procesos, memoria, archivos y dispositivos.",
    },
    {
      id: 4,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué esquema de particionado soporta discos mayores de 2 TB?",
      options: ["MBR", "GPT", "FAT32", "BIOS"],
      correct: 1,
      explanation:
        "GPT (GUID Partition Table) soporta discos >2 TB y hasta 128 particiones, superando las limitaciones de MBR.",
    },
    {
      id: 5,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué componente es esencial para el arranque UEFI en GPT?",
      options: ["MBR", "ESP (EFI System Partition)", "Partición extendida", "Sector de arranque"],
      correct: 1,
      explanation:
        "El ESP (EFI System Partition) es una partición FAT32 donde residen los cargadores EFI necesarios para UEFI.",
    },
    {
      id: 6,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta se usa para clonar discos en Linux?",
      options: ["CHKDSK", "Clonezilla", "DISM", "diskpart"],
      correct: 1,
      explanation: "Clonezilla es una herramienta libre para clonar discos por bloques con compresión y multicast.",
    },
    {
      id: 7,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué archivo en Linux configura los montajes automáticos al inicio?",
      options: ["/etc/hosts", "/etc/fstab", "/etc/passwd", "/etc/network"],
      correct: 1,
      explanation:
        "/etc/fstab (file systems table) contiene la configuración de montajes automáticos que se ejecutan durante el arranque.",
    },
    {
      id: 8,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando permite ver los usuarios del dominio en Linux con SSSD?",
      options: ["ls -l", "getent passwd", "cat /etc/passwd", "whoami"],
      correct: 1,
      explanation:
        "getent passwd consulta la base de datos de usuarios, incluyendo los del dominio cuando está configurado SSSD.",
    },
    {
      id: 9,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué protocolo se usa para compartir archivos entre Linux y Windows?",
      options: ["FTP", "HTTP", "SMB/Samba", "SMTP"],
      correct: 2,
      explanation: "SMB (Samba en Linux) permite compartir recursos entre equipos Linux y Windows en red.",
    },
    {
      id: 10,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué nivel de RAID proporciona redundancia con un solo disco de fallo tolerado?",
      options: ["RAID 0", "RAID 1", "RAID 5", "RAID 10"],
      correct: 2,
      explanation: "RAID 5 utiliza paridad distribuida y tolera el fallo de un disco del array.",
    },
    {
      id: 11,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué tecnología cifra volúmenes completos en Windows?",
      options: ["LUKS", "BitLocker", "AES", "TLS"],
      correct: 1,
      explanation: "BitLocker es el sistema de cifrado de volúmenes completo de Microsoft Windows.",
    },
    {
      id: 12,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué estrategia de backup es recomendada como mínimo?",
      options: ["1-1-1", "2-2-1", "3-2-1", "4-3-2"],
      correct: 2,
      explanation: "La regla 3-2-1: tres copias, dos soportes diferentes, una offsite (fuera del lugar).",
    },
    {
      id: 13,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo se usa para autenticación en Active Directory?",
      options: ["NTLM únicamente", "Kerberos", "RADIUS", "TACACS+"],
      correct: 1,
      explanation: "Kerberos es el protocolo principal de autenticación en Active Directory, usando tickets temporales.",
    },
    {
      id: 14,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué son las GPO en Windows?",
      options: ["Grupos de usuarios", "Políticas de grupo", "Particiones GPT", "Protocolos de red"],
      correct: 1,
      explanation: "GPO (Group Policy Object) son políticas de grupo que definen configuraciones y reglas de seguridad.",
    },
    {
      id: 15,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué registros DNS son esenciales para localizar controladores de dominio?",
      options: ["A", "MX", "SRV", "CNAME"],
      correct: 2,
      explanation: "Los registros SRV publican información de servicios como controladores de dominio en AD.",
    },
    {
      id: 16,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué sistema de archivos de Linux soporta snapshots nativamente?",
      options: ["ext4", "FAT32", "Btrfs", "NTFS"],
      correct: 2,
      explanation: "Btrfs soporta snapshots, compresión transparente y auto-reparación de forma nativa.",
    },
    {
      id: 17,
      subject: "ISO",
      unit: "UT6",
      question: "¿Cuál es el tamaño máximo de archivo en FAT32?",
      options: ["2 GB", "4 GB", "16 TB", "Sin límite"],
      correct: 1,
      explanation: "FAT32 tiene un límite de 4 GB por archivo individual.",
    },
    {
      id: 18,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué comando verifica y repara sistemas de archivos en Linux?",
      options: ["CHKDSK", "fsck", "format", "defrag"],
      correct: 1,
      explanation: "fsck (file system check) verifica y repara sistemas de archivos en Linux.",
    },
    {
      id: 19,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué modelo de control de accesos asigna permisos a roles?",
      options: ["DAC", "MAC", "RBAC", "ACL"],
      correct: 2,
      explanation: "RBAC (Role-Based Access Control) asigna permisos a roles y roles a usuarios.",
    },
    {
      id: 20,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué ID de evento en Windows indica un inicio de sesión exitoso?",
      options: ["4624", "4625", "4672", "1102"],
      correct: 0,
      explanation: "El evento 4624 registra inicios de sesión exitosos en Windows.",
    },
    {
      id: 21,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué herramienta centraliza logs en tiempo real?",
      options: ["Notepad", "Excel", "Wazuh/Graylog", "Word"],
      correct: 2,
      explanation: "Wazuh y Graylog son plataformas SIEM que centralizan y analizan logs en tiempo real.",
    },
    {
      id: 22,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué servidor web es conocido por su alto rendimiento como proxy inverso?",
      options: ["Apache", "Nginx", "IIS", "Tomcat"],
      correct: 1,
      explanation: "Nginx es conocido por su eficiencia, bajo uso de recursos y capacidad como proxy inverso.",
    },
    {
      id: 23,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué protocolo cifra las comunicaciones HTTP?",
      options: ["FTP", "TLS/SSL", "SMTP", "DHCP"],
      correct: 1,
      explanation: "TLS (Transport Layer Security) cifra las comunicaciones HTTPS, protegiendo datos en tránsito.",
    },
    {
      id: 24,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué herramienta automatiza el despliegue mediante playbooks?",
      options: ["Docker", "Ansible", "Git", "Jenkins"],
      correct: 1,
      explanation: "Ansible usa playbooks YAML para automatizar configuraciones y despliegues de forma declarativa.",
    },
    {
      id: 25,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué tecnología verifica la integridad del arranque en UEFI?",
      options: ["Legacy Boot", "Secure Boot", "Fast Boot", "Safe Mode"],
      correct: 1,
      explanation: "Secure Boot verifica las firmas digitales de los componentes de arranque para prevenir malware.",
    },
    {
      id: 26,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué herramienta gestiona servicios en Linux moderno?",
      options: ["init.d", "systemd", "service", "cron"],
      correct: 1,
      explanation: "systemd es el gestor de servicios estándar en distribuciones Linux modernas.",
    },
    {
      id: 27,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué comando muestra el estado SMART de un disco en Linux?",
      options: ["df -h", "smartctl", "fdisk", "mount"],
      correct: 1,
      explanation: "smartctl muestra información SMART para predicción de fallos en discos duros.",
    },
    {
      id: 28,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué unidad organizativa contiene objetos en Active Directory?",
      options: ["Carpeta", "OU (Organizational Unit)", "Directorio", "Partición"],
      correct: 1,
      explanation: "Las OU (Organizational Units) son contenedores lógicos que organizan objetos y permiten aplicar GPOs.",
    },
    {
      id: 29,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué sistema de archivos incluye checksums end-to-end?",
      options: ["FAT32", "ext4", "ZFS", "NTFS"],
      correct: 2,
      explanation: "ZFS incluye checksums end-to-end para detectar y corregir corrupción silenciosa de datos.",
    },
    {
      id: 30,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué normativa española regula la seguridad en sistemas de información pública?",
      options: ["GDPR", "ISO 27001", "ENS", "PCI-DSS"],
      correct: 2,
      explanation: "ENS (Esquema Nacional de Seguridad) regula la seguridad en sistemas de información del sector público español.",
    },
    {
      id: 31,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué componente de la CPU realiza operaciones matemáticas y lógicas?",
      options: ["Unidad de Control", "ALU (Unidad Aritmético-Lógica)", "Registros", "Caché"],
      correct: 1,
      explanation: "La ALU (Arithmetic Logic Unit) es la parte de la CPU que realiza operaciones matemáticas y lógicas.",
    },
    {
      id: 32,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué tipo de virtualización comparte el kernel del host?",
      options: ["Virtualización completa", "Paravirtualización", "Contenedores", "Hipervisor tipo 1"],
      correct: 2,
      explanation:
        "Los contenedores (como Docker) ejecutan aplicaciones aisladas compartiendo el mismo kernel del sistema anfitrión.",
    },
    {
      id: 33,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué comando en Linux crea una partición GPT?",
      options: ["fdisk", "gdisk", "format", "mkfs"],
      correct: 1,
      explanation: "gdisk es el editor de particiones GPT para Linux, mientras fdisk es principalmente para MBR.",
    },
    {
      id: 34,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué es un snapshot en virtualización?",
      options: [
        "Una copia de seguridad completa",
        "Captura del estado de una VM en un momento dado",
        "Una partición del disco",
        "Un tipo de RAID",
      ],
      correct: 1,
      explanation:
        "Un snapshot captura el estado completo de una máquina virtual (memoria, disco, configuración) en un momento específico.",
    },
    {
      id: 35,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando en Linux muestra los sistemas de archivos montados?",
      options: ["ls -la", "mount", "df -h", "cat /etc/fstab"],
      correct: 1,
      explanation: "El comando 'mount' sin argumentos muestra todos los sistemas de archivos actualmente montados.",
    },
    {
      id: 36,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué protocolo usa NFS para compartir archivos?",
      options: ["SMB", "FTP", "NFS (Network File System)", "HTTP"],
      correct: 2,
      explanation: "NFS es el protocolo nativo para compartir archivos en entornos Unix/Linux.",
    },
    {
      id: 37,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué nivel de RAID NO proporciona redundancia?",
      options: ["RAID 0", "RAID 1", "RAID 5", "RAID 6"],
      correct: 0,
      explanation: "RAID 0 (striping) distribuye datos sin redundancia. Si falla un disco, se pierden todos los datos.",
    },
    {
      id: 38,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué comando verifica la integridad de archivos del sistema en Windows?",
      options: ["CHKDSK", "SFC /scannow", "DISM", "diskpart"],
      correct: 1,
      explanation: "SFC (System File Checker) verifica y repara archivos del sistema operativo Windows.",
    },
    {
      id: 39,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué es LDAP?",
      options: [
        "Un protocolo de red",
        "Un protocolo para acceder a servicios de directorio",
        "Un sistema de archivos",
        "Un tipo de RAID",
      ],
      correct: 1,
      explanation:
        "LDAP (Lightweight Directory Access Protocol) es el protocolo estándar para acceder a directorios como Active Directory.",
    },
    {
      id: 40,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué puerto usa por defecto LDAP?",
      options: ["80", "389", "443", "3389"],
      correct: 1,
      explanation: "LDAP usa el puerto 389 por defecto (636 para LDAPS con cifrado).",
    },
    {
      id: 41,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué sistema de archivos tiene mejor rendimiento con archivos grandes?",
      options: ["FAT32", "ext4", "XFS", "Btrfs"],
      correct: 2,
      explanation: "XFS está optimizado para manejar archivos muy grandes y operaciones secuenciales de alto rendimiento.",
    },
    {
      id: 42,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué es el journaling en sistemas de archivos?",
      options: [
        "Un tipo de compresión",
        "Registro de transacciones para recuperación",
        "Una forma de cifrado",
        "Un método de desfragmentación",
      ],
      correct: 1,
      explanation: "El journaling registra las transacciones antes de aplicarlas, facilitando la recuperación ante fallos.",
    },
    {
      id: 43,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué comando en Linux permite ejecutar comandos como otro usuario?",
      options: ["su", "sudo", "chmod", "chown"],
      correct: 1,
      explanation: "sudo permite ejecutar comandos con privilegios de otro usuario (típicamente root) de forma controlada.",
    },
    {
      id: 44,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué significa el principio de mínimo privilegio?",
      options: [
        "Dar todos los permisos a todos",
        "Otorgar solo los permisos necesarios para cada tarea",
        "No dar ningún permiso",
        "Cambiar permisos constantemente",
      ],
      correct: 1,
      explanation:
        "El principio de mínimo privilegio establece que cada usuario debe tener solo los permisos mínimos necesarios para su trabajo.",
    },
    {
      id: 45,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué motor de base de datos es de código abierto y fork de MySQL?",
      options: ["Oracle", "SQL Server", "MariaDB", "DB2"],
      correct: 2,
      explanation: "MariaDB es un fork de código abierto de MySQL, manteniendo alta compatibilidad.",
    },
    {
      id: 46,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué herramienta de automatización usa playbooks en YAML?",
      options: ["Puppet", "Chef", "Ansible", "Salt"],
      correct: 2,
      explanation: "Ansible usa playbooks escritos en YAML para definir configuraciones y automatizaciones de forma declarativa.",
    },
    {
      id: 47,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué tipo de interfaz es más eficiente en recursos?",
      options: ["GUI", "CLI", "Táctil", "Por voz"],
      correct: 1,
      explanation: "CLI (interfaz de línea de comandos) consume menos recursos al no requerir procesamiento gráfico.",
    },
    {
      id: 48,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué es TPM?",
      options: [
        "Un tipo de partición",
        "Módulo de plataforma de confianza para criptografía",
        "Un sistema de archivos",
        "Un protocolo de red",
      ],
      correct: 1,
      explanation: "TPM (Trusted Platform Module) es un chip criptográfico para almacenar claves y asegurar el arranque.",
    },
    {
      id: 49,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué archivo configura usuarios en Linux?",
      options: ["/etc/shadow", "/etc/passwd", "/etc/group", "/etc/hosts"],
      correct: 1,
      explanation: "/etc/passwd contiene información básica de usuarios (aunque las contraseñas están en /etc/shadow).",
    },
    {
      id: 50,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué es LUKS en Linux?",
      options: ["Un gestor de paquetes", "Sistema de cifrado de discos", "Un tipo de RAID", "Un sistema de archivos"],
      correct: 1,
      explanation: "LUKS (Linux Unified Key Setup) es el estándar de cifrado de discos en Linux.",
    },

    // =========================
    // NUEVAS ISO UT1 (CAMPUS)
    // =========================
    {
      id: 51,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué diferencia principal existe entre software de sistema y software de aplicación?",
      options: [
        "El de sistema es siempre de pago y el de aplicación siempre libre",
        "El de sistema solo corre en contenedores, el de aplicación en hardware",
        "El de sistema se distribuye sin controladores, el de aplicación los incluye",
        "El de sistema gestiona hardware y recursos, el de aplicación resuelve tareas concretas",
      ],
      correct: 3,
      explanation:
        "El software de sistema (p. ej., sistema operativo) administra hardware, memoria, procesos y recursos. El software de aplicación está orientado a tareas concretas del usuario (navegar, escribir, editar, etc.).",
    },
    {
      id: 52,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué afirmación es correcta sobre buses en el sistema?",
      options: [
        "Los buses solo transportan señales de control, no datos",
        "No hay riesgos de seguridad asociados a los buses",
        "El bus de direcciones es irrelevante para la memoria",
        "El ancho del bus de datos condiciona la cantidad de información transferida por ciclo",
      ],
      correct: 3,
      explanation:
        "El bus de datos transporta la información. Si es de 32/64 bits, puede transferir esa cantidad por ciclo, afectando al rendimiento. El bus de direcciones es clave para direccionar posiciones de memoria.",
    },
    {
      id: 53,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué define mejor a un microkernel?",
      options: [
        "Todos los servicios integrados en modo kernel",
        "Núcleo diseñado solo para tiempo real duro",
        "Mínimo código en modo kernel y servicios en espacio de usuario",
        "Núcleo híbrido con controladores gráficos dedicados",
      ],
      correct: 2,
      explanation:
        "Un microkernel deja en modo kernel solo lo esencial (planificación, comunicación básica) y mueve servicios como drivers o sistema de archivos a espacio de usuario, mejorando aislamiento y estabilidad.",
    },
    {
      id: 54,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué ventaja clave aportan las memorias caché L1/L2/L3?",
      options: [
        "Evitan la necesidad de buses de datos",
        "Sustituyen completamente a la RAM del sistema",
        "Permiten ejecutar instrucciones en orden estricto",
        "Reducen la latencia al acercar datos frecuentes a la CPU",
      ],
      correct: 3,
      explanation:
        "La caché guarda datos/instrucciones usados con frecuencia cerca de la CPU, reduciendo la latencia frente a RAM y mejorando el rendimiento.",
    },
    {
      id: 55,
      subject: "ISO",
      unit: "UT1",
      question: "¿Cuál es una limitación clásica de la arquitectura Von Neumann?",
      options: [
        "Incompatibilidad con sistemas operativos modernos",
        "Cuello de botella por compartir bus entre datos e instrucciones",
        "Falta de soporte para memoria caché",
        "Imposibilidad de ejecutar código en paralelo",
      ],
      correct: 1,
      explanation:
        "En Von Neumann, instrucciones y datos comparten bus/memoria, generando el ‘cuello de botella’: la CPU no puede traer datos e instrucciones simultáneamente con la misma facilidad.",
    },
    {
      id: 56,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué describe mejor la virtualización completa?",
      options: [
        "Contenedores que comparten el mismo kernel",
        "Invitados conscientes que cooperan con el hipervisor",
        "Ejecución directa sobre hardware sin capa de control",
        "Emulación total del hardware para invitados sin modificaciones",
      ],
      correct: 3,
      explanation:
        "La virtualización completa permite ejecutar SO invitados sin modificarlos, porque el hipervisor proporciona una abstracción/virtualización del hardware desde la perspectiva del invitado.",
    },
    {
      id: 57,
      subject: "ISO",
      unit: "UT1",
      question: "En la jerarquía de memoria, ¿qué elemento ofrece el acceso más rápido?",
      options: ["Memoria virtual", "Registros de la CPU", "Memoria RAM", "Almacenamiento secundario"],
      correct: 1,
      explanation:
        "Los registros están dentro de la CPU y son el nivel más rápido. Después vienen cachés (L1/L2/L3), RAM y por último el almacenamiento (SSD/HDD).",
    },
    {
      id: 58,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué práctica es esencial en ciberseguridad según esta UT?",
      options: [
        "Ejecutar todo el software con privilegios de kernel",
        "Usar siempre arquitectura Harvard en equipos de escritorio",
        "Deshabilitar la memoria virtual para evitar swaps",
        "Conocer la interacción hardware–software para detectar y mitigar vulnerabilidades",
      ],
      correct: 3,
      explanation:
        "Muchas vulnerabilidades nacen en la frontera hardware-software (memoria, CPU, aislamiento, permisos). Entender esa interacción ayuda a detectar riesgos y aplicar mitigaciones reales.",
    },
    {
      id: 59,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué elemento de la estructura funcional corresponde a la fase de “entrada”?",
      options: [
        "Captura de datos por periféricos como teclado o sensores",
        "Presentación de resultados en pantalla",
        "Transformación de datos por la ALU",
        "Almacenamiento permanente en SSD",
      ],
      correct: 0,
      explanation:
        "La fase de entrada es la captura de datos desde el exterior mediante periféricos de entrada (teclado, ratón, sensores, etc.).",
    },
    {
      id: 60,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué describe mejor el propósito global de un sistema informático según esta UT?",
      options: [
        "Integrar hardware y software para transformar datos en información útil",
        "Sustituir completamente la intervención humana en cualquier proceso",
        "Ejecutar exclusivamente aplicaciones de usuario sin gestionar recursos",
        "Funcionar sin dependencia del hardware subyacente",
      ],
      correct: 0,
      explanation:
        "Un sistema informático integra hardware + software para procesar datos y obtener información útil. No elimina siempre al humano, y depende del hardware y de la gestión de recursos.",
    },
    {
      id: 61,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué afirmación es correcta sobre multitarea en sistemas operativos?",
      options: [
        "Requiere hardware de múltiples procesadores",
        "Permite ejecutar múltiples procesos compartiendo tiempo de CPU",
        "Obliga a que los procesos se ejecuten de forma estrictamente secuencial",
        "Es exclusiva de sistemas propietarios",
      ],
      correct: 1,
      explanation:
        "La multitarea reparte tiempo de CPU entre procesos mediante planificación (cambio de contexto). Puede existir con un solo procesador: alterna tan rápido que parece simultáneo.",
    },
    {
      id: 62,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué caracteriza a una GUI frente a una CLI?",
      options: [
        "Menor consumo de recursos que la línea de comandos",
        "Uso de elementos gráficos (ventanas, iconos, menús) para interactuar",
        "Incompatibilidad con herramientas de administración",
        "Ejecución exclusiva en servidores sin gráficos",
      ],
      correct: 1,
      explanation:
        "GUI usa elementos gráficos (ventanas, iconos, menús). La CLI se basa en texto y suele consumir menos recursos, pero requiere conocer comandos.",
    },
    {
      id: 63,
      subject: "ISO",
      unit: "UT1",
      question: "¿Cuál es la función principal de la CPU en un sistema informático?",
      options: [
        "Emitir señal de vídeo a los monitores externos",
        "Servir como interfaz directa entre usuario y aplicaciones",
        "Proporcionar almacenamiento no volátil a largo plazo",
        "Ejecutar instrucciones y coordinar operaciones internas",
      ],
      correct: 3,
      explanation:
        "La CPU ejecuta instrucciones, coordina el funcionamiento del sistema y realiza operaciones aritméticas y lógicas junto con la unidad de control.",
    },
    {
      id: 64,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué es un snapshot en el contexto de máquinas virtuales?",
      options: [
        "Captura del estado completo de la VM en un instante",
        "Copia incremental del kernel del host",
        "Clon físico del disco sin memoria",
        "Imagen ISO del sistema operativo invitado",
      ],
      correct: 0,
      explanation:
        "Un snapshot captura el estado de una VM en un punto del tiempo (disco y, a menudo, memoria/config). Permite volver atrás rápidamente tras pruebas o cambios.",
    },
    {
      id: 65,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué diferencia clave existe entre sistemas propietarios y de código abierto?",
      options: [
        "Mayor rendimiento garantizado en el software propietario",
        "Acceso al código fuente y libertad de modificación en el software libre",
        "Imposibilidad de uso comercial en software libre",
        "Ausencia de licencias en ambos modelos",
      ],
      correct: 1,
      explanation:
        "El código abierto permite acceso al código fuente y su modificación según licencia. El software propietario suele ser cerrado. Ambos tienen licencias, con condiciones distintas.",
    },
    {
      id: 66,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué ventaja aporta el multiprocesador/multinúcleo?",
      options: [
        "Impide la multitarea expropiativa",
        "Ejecución paralela de tareas para mejorar rendimiento",
        "Elimina el cambio de contexto entre procesos",
        "Sustituye la necesidad de memoria caché",
      ],
      correct: 1,
      explanation:
        "Varios núcleos permiten ejecutar tareas en paralelo, mejorando rendimiento en cargas concurrentes. No elimina el cambio de contexto ni sustituye la caché.",
    },
    {
      id: 67,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué componente del sistema operativo gestiona en modo privilegiado los recursos del sistema?",
      options: ["Editor de texto", "Capa de usuario", "Kernel", "Shell"],
      correct: 2,
      explanation:
        "El kernel se ejecuta en modo privilegiado y gestiona CPU, memoria, dispositivos y seguridad. La shell y aplicaciones suelen ir en modo usuario.",
    },
    {
      id: 68,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué caracteriza a un kernel monolítico moderno como Linux?",
      options: [
        "Exclusivo para dispositivos móviles",
        "Núcleo único con posibilidad de cargar módulos",
        "Ausencia de controladores en el núcleo",
        "Separación total de servicios en espacio de usuario",
      ],
      correct: 1,
      explanation:
        "Linux es monolítico (muchos servicios en modo kernel) pero modular: puede cargar módulos (drivers) dinámicamente sin reiniciar.",
    },
    {
      id: 69,
      subject: "ISO",
      unit: "UT1",
      question: "¿Cuál es una medida de seguridad vinculada a la gestión de memoria?",
      options: [
        "Desactivar la protección por hardware (MMU)",
        "Ejecutar datos en cualquier segmento",
        "Exponer las tablas de páginas a los usuarios",
        "ASLR para aleatorizar ubicaciones en memoria",
      ],
      correct: 3,
      explanation:
        "ASLR aleatoriza direcciones (stack/heap/librerías), dificultando exploits que dependen de direcciones predecibles (por ejemplo, desbordamientos de buffer).",
    },
    {
      id: 70,
      subject: "ISO",
      unit: "UT1",
      question: "¿Cuál es la función principal de la CPU en un sistema informático?",
      options: [
        "Servir como interfaz directa entre usuario y aplicaciones",
        "Ejecutar instrucciones y coordinar operaciones internas",
        "Proporcionar almacenamiento no volátil a largo plazo",
        "Emitir señal de vídeo a los monitores externos"
      ],
      correct: 1,
      explanation: "La CPU (Unidad Central de Procesamiento) es el 'cerebro' del ordenador; se encarga de procesar los datos mediante la ejecución de instrucciones de los programas.",
    },
    {
      id: 71,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué diferencia principal existe entre software de sistema y software de aplicación?",
      options: [
        "El de sistema gestiona hardware y recursos, el de aplicación resuelve tareas concretas",
        "El de sistema solo corre en contenedores, el de aplicación en hardware",
        "El de sistema es siempre de pago y el de aplicación siempre libre",
        "El de sistema se distribuye sin controladores, el de aplicación los incluye"
      ],
      correct: 0,
      explanation: "El software de sistema (como el SO) actúa de intermediario con el hardware, mientras que el de aplicación (como Office o un navegador) está diseñado para que el usuario realice tareas específicas.",
    },
    {
      id: 72,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué caracteriza a un kernel monolítico moderno como Linux?",
      options: [
        "Núcleo único con posibilidad de cargar módulos",
        "Ausencia de controladores en el núcleo",
        "Separación total de servicios en espacio de usuario",
        "Exclusivo para dispositivos móviles"
      ],
      correct: 0,
      explanation: "Aunque es monolítico (todo el SO corre en espacio de núcleo), Linux es 'moderno' porque permite cargar y descargar módulos (como drivers) dinámicamente sin reiniciar.",
    },
    {
      id: 73,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué afirmación es correcta sobre buses en el sistema?",
      options: [
        "El ancho del bus de datos condiciona la cantidad de información transferida por ciclo",
        "El bus de direcciones es irrelevante para la memoria",
        "Los buses solo transportan señales de control, no datos",
        "No hay riesgos de seguridad asociados a los buses"
      ],
      correct: 0,
      explanation: "El ancho del bus de datos (medido en bits) determina cuántos datos se pueden enviar simultáneamente al procesador en cada pulso de reloj.",
    },
    {
      id: 74,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué componente del sistema operativo gestiona en modo privilegiado los recursos del sistema?",
      options: [
        "Editor de texto",
        "Shell",
        "Capa de usuario",
        "Kernel"
      ],
      correct: 3,
      explanation: "El Kernel (núcleo) es el único que opera en el 'Anillo 0' o modo privilegiado, lo que le permite controlar directamente el hardware y la memoria de forma segura.",
    },
    {
      id: 75,
      subject: "ISO",
      unit: "UT1",
      question: "¿Qué interfaz permite automatizar tareas mediante comandos y scripts?",
      options: [
        "CLI (Command Line Interface)",
        "GUI (Graphical User Interface)",
        "Pantalla táctil",
        "Controladores de dispositivo"
      ],
      correct: 0,
      explanation: "La CLI es ideal para la automatización ya que permite encadenar comandos en archivos de texto (scripts) que el sistema puede ejecutar sin intervención humana.",
    },
    {
      id: 76,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué práctica inicial es fundamental antes de modificar particiones?",
      options: [
        "Deshabilitar Secure Boot",
        "Realizar un backup verificado",
        "Cambiar BIOS a CSM",
        "Formatear directamente"
      ],
      correct: 1,
      explanation: "Antes de cualquier operación que altere la tabla de particiones o el sistema de archivos, es crítico tener una copia de seguridad para evitar la pérdida irreversible de datos.",
    },
    {
      id: 77,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué requisito de firmware es indispensable para instalar Windows 11?",
      options: [
        "BIOS Legacy",
        "TPM 1.2",
        "TPM 2.0 y Secure Boot habilitado",
        "CSM activo"
      ],
      correct: 2,
      explanation: "Microsoft exige obligatoriamente un chip de seguridad TPM 2.0 y que el sistema arranque en modo UEFI con Secure Boot (Arranque Seguro) activo para instalar Windows 11.",
    },
    {
      id: 78,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta de Microsoft permite despliegues masivos de Windows?",
      options: [
        "MECM/SCCM",
        "MAAS",
        "Satellite",
        "Cobbler"
      ],
      correct: 0,
      explanation: "MECM (Microsoft Endpoint Configuration Manager), antes conocido como SCCM, es la solución estándar de Microsoft para gestionar y desplegar sistemas operativos en grandes redes corporativas.",
    },
    {
      id: 79,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué comando de Windows permite editar el gestor de arranque BCD?",
      options: [
        "gdisk",
        "efibootmgr",
        "bcdedit",
        "pnputil"
      ],
      correct: 2,
      explanation: "bcdedit es la herramienta de consola que permite modificar los datos de la configuración de arranque (BCD), sustituyendo al antiguo archivo boot.ini.",
    },
    {
      id: 80,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué utilidad Linux permite convertir un disco MBR a GPT?",
      options: [
        "Boot-Repair",
        "Timeshift",
        "gdisk",
        "Rufus"
      ],
      correct: 2,
      explanation: "gdisk (GPT fdisk) es la herramienta de consola en Linux diseñada específicamente para trabajar con tablas GPT, permitiendo convertir discos MBR a GPT de forma segura.",
    },
    {
      id: 81,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta se recomienda para recuperación de discos dañados?",
      options: [
        "ddrescue",
        "efibootmgr",
        "pnputil",
        "Disk Management"
      ],
      correct: 0,
      explanation: "ddrescue es una herramienta de Linux capaz de copiar datos de un disco con sectores defectuosos, intentando leer primero las partes sanas y reintentando las dañadas de forma inteligente.",
    },
    {
      id: 82,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué utilidad permite reconstruir cargadores de arranque dañados?",
      options: [
        "ddrescue",
        "gdisk",
        "Boot-Repair",
        "bcdedit"
      ],
      correct: 2,
      explanation: "Boot-Repair es una herramienta automatizada (muy usada en Linux) diseñada para reinstalar o reparar el cargador de arranque GRUB de forma sencilla cuando el sistema no inicia.",
    },
    {
      id: 83,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta de clonación permite multicast y compresión?",
      options: [
        "Boot-Repair",
        "dd",
        "pnputil",
        "Clonezilla"
      ],
      correct: 3,
      explanation: "Clonezilla es una herramienta de código abierto que permite crear imágenes de disco comprimidas y enviarlas a múltiples ordenadores a la vez mediante multicast (Clonezilla SE).",
    },
    {
      id: 84,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué sistema de archivos de Microsoft ofrece resiliencia con Storage Spaces?",
      options: [
        "ext4",
        "ReFS",
        "XFS",
        "Btrfs"
      ],
      correct: 1,
      explanation: "ReFS (Resilient File System) es el sistema de archivos de Microsoft diseñado para maximizar la disponibilidad de los datos y la integridad mediante el uso de flujos de integridad y la integración con Storage Spaces.",
    },
    {
      id: 85,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué gestor de arranque destaca por su simplicidad en sistemas UEFI?",
      options: [
        "GRUB2",
        "rEFInd",
        "LILO",
        "systemd-boot"
      ],
      correct: 3,
      explanation: "systemd-boot (antes llamado gummiboot) es un gestor de arranque muy simple y ligero que solo funciona en sistemas UEFI, leyendo archivos de configuración sencillos sin necesidad de scripts complejos.",
    },
    {
      id: 86,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué utilidad de Windows permite gestionar controladores firmados?",
      options: [
        "lsblk",
        "efibootmgr",
        "pnputil",
        "dd"
      ],
      correct: 2,
      explanation: "pnputil (PnP Utility) es una herramienta de línea de comandos en Windows que permite a los administradores agregar, eliminar y enumerar paquetes de controladores (drivers) en el almacén de controladores del sistema.",
    },
    {
      id: 87,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta crea USB multi-ISO de forma sencilla?",
      options: [
        "Rufus",
        "Ventoy",
        "ddrescue",
        "GParted"
      ],
      correct: 1,
      explanation: "Ventoy permite copiar varios archivos ISO a un USB y elegir cuál arrancar mediante un menú, sin necesidad de formatear el USB cada vez que se quiere cambiar de sistema.",
    },
    {
      id: 88,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué mecanismo protege claves y mide arranque en equipos modernos?",
      options: [
        "BIOS Legacy",
        "MSR",
        "GOP",
        "TPM 2.0"
      ],
      correct: 3,
      explanation: "El TPM (Trusted Platform Module) es un chip dedicado que almacena claves criptográficas de forma segura y realiza mediciones de la integridad del sistema durante el arranque para asegurar que no ha sido alterado.",
    },
    {
      id: 89,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué tamaño recomendado debe tener la partición ESP en sistemas UEFI?",
      options: [
        "300–512 MB en FAT32",
        "50 MB en NTFS",
        "1 MB en RAW",
        "2 GB en ext4"
      ],
      correct: 0,
      explanation: "La partición ESP (EFI System Partition) debe estar formateada en FAT32. Se recomiendan entre 300 y 512 MB para asegurar espacio suficiente para varios cargadores de arranque y actualizaciones de firmware.",
    },
    {
      id: 90,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué sistema de archivos es más adecuado para snapshots y rollback en Linux?",
      options: [
        "Btrfs",
        "NTFS",
        "ext2",
        "FAT32"
      ],
      correct: 0,
      explanation: "Btrfs es un sistema de archivos de 'copia en escritura' (CoW) que permite crear instantáneas (snapshots) casi instantáneas y volver a estados anteriores (rollback) de forma sencilla.",
    },
    {
      id: 91,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué regla de copias de seguridad garantiza redundancia e inmutabilidad?",
      options: [
        "2-2-0",
        "5-5-5",
        "1-1-1",
        "3-2-1"
      ],
      correct: 3,
      explanation: "La regla 3-2-1 consiste en tener 3 copias de los datos, en 2 soportes diferentes y 1 de ellas fuera de línea (off-site) para evitar pérdidas totales.",
    },
    {
      id: 92,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué práctica mejora la resiliencia en RAID propietario no detectado?",
      options: [
        "Usar siempre fakeraid",
        "Desactivar TRIM en SSD",
        "Usar AHCI/NVMe y RAID por software (mdadm/ZFS)",
        "Mantener CSM activo"
      ],
      correct: 2,
      explanation: "El RAID por software (como mdadm en Linux o ZFS) es más resiliente porque no depende de una controladora física específica; si la placa base muere, los datos se pueden recuperar en cualquier otro equipo.",
    },
    {
      id: 93,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta en Linux recompila módulos tras actualizar el kernel?",
      options: [
        "diskpart",
        "Boot-Repair",
        "DKMS",
        "bcdedit"
      ],
      correct: 2,
      explanation: "DKMS (Dynamic Kernel Module Support) permite que los módulos del kernel (drivers) se recompilen automáticamente cada vez que se instala una nueva versión del núcleo, manteniendo el hardware funcional.",
    },
    {
      id: 94,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta gestiona snapshots en Linux basados en Btrfs?",
      options: [
        "bcdedit",
        "diskpart",
        "Snapper",
        "Boot-Repair"
      ],
      correct: 2,
      explanation: "Snapper es la herramienta de gestión de instantáneas para Btrfs que permite crear, comparar y revertir snapshots del sistema de forma automática o manual.",
    },
    {
      id: 95,
      subject: "ISO",
      unit: "UT2",
      question: "¿Qué herramienta permite gestionar entradas de arranque UEFI en Linux?",
      options: [
        "diskpart",
        "Boot-Repair",
        "efibootmgr",
        "mkfs"
      ],
      correct: 2,
      explanation: "efibootmgr es una aplicación de espacio de usuario para modificar la NVRAM de Intel Extensible Firmware Interface (EFI), permitiendo crear, borrar o cambiar el orden de las entradas de arranque.",
    },
    {
      id: 96,
      subject: "ISO",
      unit: "UT3",
      question: "¿Cuál de estas herramientas de recuperación pertenece a Linux?",
      options: [
        "Restaurar sistema",
        "Restaurar imagen",
        "Punto de restauración",
        "initramfs"
      ],
      correct: 3,
      explanation: "initramfs (Initial RAM File System) es un sistema de archivos temporal que Linux utiliza durante el arranque para cargar drivers necesarios y montar la partición raíz, permitiendo acceder a herramientas de rescate si el arranque falla.",
    },
    {
      id: 97,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando de Linux se usa para desmontar una unidad manualmente?",
      options: [
        "umount",
        "detach",
        "eject",
        "unmount"
      ],
      correct: 0,
      explanation: "El comando correcto es 'umount' (sin la 'n'). Se utiliza para desprender un sistema de archivos montado de la jerarquía de directorios de Linux.",
    },
    {
      id: 98,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué formato de archivo corresponde a un instalador típico en Windows?",
      options: [
        ".sh",
        ".rpm",
        ".exe / .msi",
        ".deb"
      ],
      correct: 2,
      explanation: "En Windows, los archivos .exe son ejecutables directos y los .msi (Microsoft Installer) son paquetes de instalación que utilizan el servicio Windows Installer.",
    },
    {
      id: 99,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué herramienta de Windows permite crear puntos de restauración del sistema?",
      options: [
        "Panel de control > Sistema > Protección del sistema",
        "Configuración > Aplicaciones",
        "Administrador de discos",
        "Administrador de tareas"
      ],
      correct: 0,
      explanation: "La opción 'Protección del sistema' dentro de las propiedades del sistema es la que permite configurar el espacio para restaurar y crear los puntos de restauración de forma manual.",
    },
    {
      id: 100,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando en Linux permite configurar el idioma del sistema?",
      options: [
        "localectl",
        "timedatectl",
        "setlocale",
        "langctl"
      ],
      correct: 0,
      explanation: "El comando 'localectl' se utiliza para consultar y cambiar la configuración regional (idioma) y la disposición del teclado en el sistema.",
    },
    {
      id: 101,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué gestor de paquetes se utiliza en CentOS/RHEL?",
      options: [
        "snap",
        "apt",
        "pacman",
        "yum"
      ],
      correct: 3,
      explanation: "YUM (Yellowdog Updater, Modified) es el gestor tradicional para distribuciones basadas en Red Hat como CentOS. En versiones modernas ha sido sucedido por DNF, aunque son compatibles.",
    },
    {
      id: 102,
      subject: "ISO",
      unit: "UT3",
      question: "¿En qué sección de Configuración de Windows se cambia el fondo de pantalla?",
      options: [
        "Personalización > Fondo",
        "Sistema > Pantalla",
        "Aplicaciones > Escritorio",
        "Red > Pantalla"
      ],
      correct: 0,
      explanation: "Dentro del menú de Configuración de Windows, el apartado 'Personalización' agrupa todos los ajustes estéticos como el fondo, los colores, la pantalla de bloqueo y los temas.",
    },
    {
      id: 103,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando en Windows muestra la configuración de red?",
      options: [
        "netshow",
        "ifconfig",
        "sysinfo",
        "ipconfig"
      ],
      correct: 3,
      explanation: "El comando 'ipconfig' muestra los valores de configuración de red TCP/IP actuales, como la dirección IP, la máscara de subred y la puerta de enlace predeterminada.",
    },
    {
      id: 104,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué herramienta gráfica de Windows se usa para administrar particiones y discos?",
      options: [
        "CMD",
        "Administrador de tareas",
        "BIOS",
        "Administrador de discos (diskmgmt.msc)"
      ],
      correct: 3,
      explanation: "El Administrador de discos es la herramienta gráfica de Windows que permite crear, formatear, reducir, extender y eliminar particiones en las unidades de almacenamiento.",
    },
    {
      id: 105,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué extensión corresponde a un script clásico de MS-DOS o Windows?",
      options: [
        ".sh",
        ".ps1",
        ".exe",
        ".bat"
      ],
      correct: 3,
      explanation: "La extensión .bat (batch) identifica a los archivos de procesamiento por lotes que contienen una serie de comandos de consola que se ejecutan secuencialmente en MS-DOS y Windows.",
    },
    {
      id: 106,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando en Debian/Ubuntu actualiza el sistema?",
      options: [
        "sudo dnf update",
        "sudo apt update && sudo apt upgrade",
        "sudo yum update",
        "update-manager"
      ],
      correct: 1,
      explanation: "En Debian/Ubuntu, 'apt update' descarga la información de los paquetes nuevos y 'apt upgrade' instala las versiones más recientes de los programas ya instalados.",
    },
    {
      id: 107,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué herramienta de Linux permite hacer instantáneas del sistema para recuperación?",
      options: [
        "SnapshotCtl",
        "BackupTool",
        "Deja Dup",
        "Timeshift"
      ],
      correct: 3,
      explanation: "Timeshift es una herramienta que crea instantáneas (snapshots) del sistema utilizando rsync o Btrfs, permitiendo restaurar el equipo a un estado anterior si algo falla tras una actualización.",
    },
    {
      id: 108,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué explorador de archivos es el predeterminado en GNOME (Ubuntu)?",
      options: [
        "Thunar",
        "Dolphin",
        "Nautilus (GNOME Files)",
        "Caja"
      ],
      correct: 2,
      explanation: "Nautilus (ahora llamado oficialmente Archivos) es el gestor de archivos oficial del entorno GNOME. Es conocido por su diseño limpio y su integración con el sistema.",
    },
    {
      id: 109,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué combinación de teclas abre directamente la ventana de Configuración en Windows 10/11?",
      options: [
        "Win + I",
        "Ctrl + Alt + Supr",
        "Alt + F4",
        "Win + R"
      ],
      correct: 0,
      explanation: "El atajo 'Win + I' (de Settings/Información) abre instantáneamente el panel de Configuración moderna de Windows. Es mucho más rápido que navegar por el menú Inicio.",
    },
    {
      id: 110,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué programa de Linux permite programar copias de seguridad de datos personales de forma sencilla y gráfica?",
      options: [
        "Timeshift",
        "Backupctl",
        "Deja Dup",
        "Clonezilla"
      ],
      correct: 2,
      explanation: "Deja Dup (también llamado simplemente 'Copias de seguridad' en GNOME) es una herramienta sencilla que permite programar respaldos de carpetas personales, con soporte para cifrado y almacenamiento en la nube.",
    },
    {
      id: 111,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué herramienta de Linux garantiza la ejecución de tareas si el equipo estuvo apagado en la hora prevista?",
      options: [
        "taskschd",
        "anacron",
        "systemctl",
        "cron"
      ],
      correct: 1,
      explanation: "A diferencia de cron, anacron no asume que la máquina está encendida continuamente. Si una tarea programada se pierde porque el PC estaba apagado, anacron la ejecuta en cuanto el sistema arranca de nuevo.",
    },
    {
      id: 112,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué herramienta de Linux se utiliza para configurar la zona horaria desde la terminal?",
      options: [
        "dateconfig",
        "timedatectl",
        "localectl",
        "sysctl"
      ],
      correct: 1,
      explanation: "El comando 'timedatectl' permite consultar y cambiar la hora del sistema, la fecha y la zona horaria (timezone), además de activar la sincronización automática por red (NTP).",
    },
    {
      id: 113,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué comando en Linux se usa para mostrar procesos en tiempo real?",
      options: [
        "ps",
        "procstat",
        "top",
        "jobs"
      ],
      correct: 2,
      explanation: "El comando 'top' muestra una lista dinámica y en tiempo real de los procesos que se están ejecutando, permitiendo ver el consumo de CPU y memoria de cada uno.",
    },
    {
      id: 114,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué entorno de escritorio en Linux se caracteriza por ser minimalista y usar extensiones para personalizar la interfaz?",
      options: [
        "Cinnamon",
        "GNOME",
        "KDE Plasma",
        "XFCE"
      ],
      correct: 1,
      explanation: "GNOME apuesta por una interfaz limpia y minimalista (Shell). Para añadir funcionalidades extra o cambiar su comportamiento, los usuarios instalan 'GNOME Extensions'.",
    },
    {
      id: 115,
      subject: "ISO",
      unit: "UT3",
      question: "¿Qué shell es el estándar en la mayoría de distribuciones Linux?",
      options: [
        "cmd",
        "zsh",
        "PowerShell",
        "bash"
      ],
      correct: 3,
      explanation: "Bash (Bourne Again SHell) es el intérprete de comandos por defecto en casi todas las distribuciones Linux. Es una mejora del shell original de Unix (sh).",
    },
    {
      id: 116,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué evento indica fallos de inicio de sesión en Windows?",
      options: [
        "5156",
        "1000",
        "4625",
        "7036"
      ],
      correct: 2,
      explanation: "El ID de evento 4625 se genera en el Visor de Eventos de Windows cada vez que una cuenta no logra iniciar sesión, ya sea por contraseña incorrecta o usuario inexistente.",
    },
    {
      id: 117,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué comando de Windows permite listar permisos NTFS?",
      options: [
        "chmod",
        "icacls",
        "passwd",
        "chage"
      ],
      correct: 1,
      explanation: "icacls es la utilidad de línea de comandos en Windows que permite mostrar, modificar y hacer copias de seguridad de las listas de control de acceso (ACL) de archivos y carpetas.",
    },
    {
      id: 118,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué sistema de cifrado de volúmenes es propio de Linux?",
      options: [
        "LUKS2",
        "NTFS",
        "BitLocker",
        "RAID5"
      ],
      correct: 0,
      explanation: "LUKS (Linux Unified Key Setup) es el estándar para el cifrado de discos en Linux, permitiendo gestionar múltiples claves y asegurar que los datos no sean accesibles si el disco es extraído.",
    },
    {
      id: 119,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué ventaja ofrece RAID1?",
      options: [
        "Rendimiento peor que un único disco",
        "Ahorro total de espacio",
        "Mayor riesgo de pérdida de datos",
        "Continuidad del servicio si falla un disco"
      ],
      correct: 3,
      explanation: "RAID1, también llamado 'espejo' (mirroring), duplica los datos en dos discos. Si uno falla, el sistema sigue funcionando con el otro sin pérdida de información ni interrupción del servicio.",
    },
    {
      id: 120,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué herramienta de Linux detecta rootkits?",
      options: [
        "sysmon",
        "icacls",
        "AppLocker",
        "rkhunter"
      ],
      correct: 3,
      explanation: "rkhunter (Rootkit Hunter) es una herramienta de seguridad que escanea el sistema en busca de rootkits, backdoors y exploits locales comparando firmas y buscando archivos sospechosos.",
    },
    {
      id: 121,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué política de contraseñas es más recomendable?",
      options: [
        "Uso exclusivo de caracteres especiales",
        "Contraseñas iguales para todos",
        "Longitud mínima de 16 caracteres o passphrase",
        "Caducidad mensual obligatoria"
      ],
      correct: 2,
      explanation: "La seguridad moderna prioriza la longitud (passphrases) sobre la complejidad extrema o la rotación frecuente, ya que las frases largas son más difíciles de hackear por fuerza bruta y fáciles de recordar.",
    },
    {
      id: 122,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué sistema de archivos ofrece integridad end-to-end?",
      options: [
        "FAT32",
        "ReFS",
        "EXT2",
        "ZFS con RAIDZ"
      ],
      correct: 3,
      explanation: "ZFS utiliza sumas de verificación (checksums) en todo el camino del dato (end-to-end). Si detecta que un dato se ha corrompido en el disco, lo repara automáticamente usando la paridad de RAIDZ.",
    },
    {
      id: 123,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué estrategia de actualizaciones minimiza riesgos?",
      options: [
        "Instalar todo directamente en producción",
        "Despliegue en anillos (piloto, preproducción, producción)",
        "Ignorar parches de seguridad",
        "Esperar años antes de actualizar"
      ],
      correct: 1,
      explanation: "El despliegue por anillos permite probar las actualizaciones en un grupo reducido (piloto) y en un entorno controlado (preproducción) antes de lanzarlas a toda la empresa, evitando que un parche defectuoso detenga la actividad global.",
    },
    {
      id: 124,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué herramienta centraliza logs en grandes entornos?",
      options: [
        "ELK Stack",
        "Paint",
        "Excel",
        "Notepad"
      ],
      correct: 0,
      explanation: "ELK Stack (Elasticsearch, Logstash y Kibana) es una plataforma que permite recolectar logs de miles de fuentes, procesarlos y visualizarlos en paneles gráficos en tiempo real.",
    },
    {
      id: 125,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué riesgo presenta RAID5 con discos grandes?",
      options: [
        "Falta total de rendimiento",
        "No permite lecturas concurrentes",
        "Se pierde la mitad del espacio",
        "Error de lectura irrecuperable (URE) en reconstrucción"
      ],
      correct: 3,
      explanation: "Debido al largo tiempo que tarda en reconstruirse un RAID 5 con discos de gran capacidad, existe una alta probabilidad estadística de encontrar un Error de Lectura Irrecuperable (URE) en los discos restantes, lo que causaría la pérdida total de los datos.",
    },
    {
      id: 126,
      subject: "ISO",
      unit: "UT4",
      question: "¿Cuál es el objetivo principal de la seguridad local?",
      options: [
        "Instalar aplicaciones rápidamente",
        "Garantizar la confidencialidad, integridad, disponibilidad y trazabilidad",
        "Mejorar el rendimiento del hardware",
        "Reducir el consumo energético"
      ],
      correct: 1,
      explanation: "La seguridad local busca proteger la tríada CID (Confidencialidad, Integridad, Disponibilidad) y asegurar la Trazabilidad (saber quién hizo qué y cuándo) mediante el control de accesos y logs.",
    },
    {
      id: 127,
      subject: "ISO",
      unit: "UT4",
      question: "¿Cuál es el primer paso ante una infección?",
      options: [
        "Aislar el sistema afectado",
        "Ignorar el incidente",
        "Cambiar de hardware",
        "Formatear directamente"
      ],
      correct: 0,
      explanation: "El aislamiento (desconectar de la red y apagar conexiones inalámbricas) es vital para evitar que el malware se propague a otros equipos de la red (movimiento lateral).",
    },
    {
      id: 128,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué significan las siglas RPO en tolerancia a fallos?",
      options: [
        "Random Protection Option",
        "Recovery Protocol Order",
        "Recovery Point Objective",
        "Remote Protection Output"
      ],
      correct: 2,
      explanation: "El RPO (Objetivo de Punto de Recuperación) determina la cantidad máxima de datos que una organización puede permitirse perder, midiendo el tiempo transcurrido desde la última copia de seguridad hasta el fallo.",
    },
    {
      id: 129,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué nivel de RAID combina espejos y striping?",
      options: [
        "RAID10",
        "RAID0",
        "RAID5",
        "RAID6"
      ],
      correct: 0,
      explanation: "RAID 10 es un 'nivel anidado' que combina la redundancia del espejo (RAID 1) con la velocidad del striping o seccionamiento (RAID 0), ofreciendo lo mejor de ambos mundos.",
    },
    {
      id: 130,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué herramienta aplica políticas de contraseña en Linux?",
      options: [
        "Group Policy Objects (GPO)",
        "PAM (pwquality, faillock)",
        "BIOS",
        "DHCP"
      ],
      correct: 1,
      explanation: "PAM (Pluggable Authentication Modules) es el sistema flexible que usa Linux para la autenticación. Módulos como 'pwquality' fuerzan la complejidad de la clave y 'faillock' bloquea la cuenta tras varios fallos.",
    },
    {
      id: 131,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué solución antimalware es nativa de Windows?",
      options: [
        "Snort",
        "Falco",
        "ClamAV",
        "Microsoft Defender"
      ],
      correct: 3,
      explanation: "Microsoft Defender (antiguamente Windows Defender) es el software antivirus y antimalware integrado por defecto en Windows, ofreciendo protección en tiempo real y análisis de archivos.",
    },
    {
      id: 132,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué tipo de copia facilita restauración rápida pero ocupa más espacio?",
      options: [
        "Parcial",
        "Diferencial",
        "Completa",
        "Incremental"
      ],
      correct: 2,
      explanation: "La copia completa (Full Backup) guarda todos los archivos del sistema. Es la más rápida de restaurar porque solo necesitas un archivo/soporte, pero es la que más almacenamiento consume.",
    },
    {
      id: 133,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué estrategia de copias de seguridad garantiza resiliencia?",
      options: [
        "Copia mensual sin verificación",
        "3-2-1 (tres copias, dos soportes, una offsite)",
        "Almacenar solo en la nube sin clave",
        "Guardar en un solo disco externo"
      ],
      correct: 1,
      explanation: "La estrategia 3-2-1 (3 copias en 2 soportes diferentes y 1 fuera del sitio) garantiza que los datos sobrevivan a fallos de hardware, errores humanos e incluso catástrofes físicas en el local.",
    },
    {
      id: 134,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué nivel de RAID no ofrece redundancia?",
      options: [
        "RAID5",
        "RAID0",
        "RAID1",
        "RAID6"
      ],
      correct: 1,
      explanation: "El RAID 0 realiza un seccionamiento (striping) de los datos entre los discos para ganar velocidad, pero si un solo disco falla, se pierde toda la información del conjunto.",
    },
    {
      id: 135,
      subject: "ISO",
      unit: "UT4",
      question: "¿Qué práctica reduce la superficie de ataque?",
      options: [
        "Principio de mínimo privilegio (PoLP)",
        "Permisos globales para Everyone",
        "Uso de cuentas con privilegios elevados",
        "Desactivar auditorías"
      ],
      correct: 0,
      explanation: "El Principio de Mínimo Privilegio (PoLP) dicta que cada usuario o proceso debe tener solo los permisos estrictamente necesarios para su función, limitando el daño potencial en caso de un ataque.",
    },
    {
      id: 136,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué rol garantiza coherencia en operaciones críticas de AD?",
      options: [
        "SPN",
        "FSMO",
        "SYSVOL",
        "OU"
      ],
      correct: 1,
      explanation: "Los roles FSMO (Flexible Single Master Operations) son funciones específicas asignadas a controladores de dominio para evitar conflictos en tareas que no pueden realizarse de forma multimaestro, como cambios en el esquema o nombres de dominio.",
    },
    {
      id: 137,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué recurso compartido contiene GPOs y scripts en los DC?",
      options: [
        "/etc/passwd",
        "SYSVOL",
        "SPN",
        "NETLOGON"
      ],
      correct: 1,
      explanation: "SYSVOL es una carpeta compartida en todos los controladores de dominio (DC) que replica las directivas de grupo (GPOs) y scripts de inicio para que estén disponibles en toda la red.",
    },
    {
      id: 138,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo es considerado legado frente a Kerberos?",
      options: [
        "SSH",
        "FTP",
        "SMBv2",
        "NTLM"
      ],
      correct: 3,
      explanation: "NTLM (NT LAN Manager) es un protocolo de autenticación antiguo que se considera vulnerable a ataques de 'Pass-the-Hash'. Ha sido sustituido por Kerberos como protocolo principal en Active Directory.",
    },
    {
      id: 139,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué comando en Windows verifica el estado de un DC?",
      options: [
        "nslookup",
        "dcdiag",
        "ipconfig",
        "ping"
      ],
      correct: 1,
      explanation: "dcdiag (Domain Controller Diagnostic) es una herramienta de línea de comandos que analiza el estado de un controlador de dominio y reporta fallos en la conectividad, replicación, DNS y permisos.",
    },
    {
      id: 140,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué modelo de red se basa en servidores que ofrecen servicios y clientes que los consumen?",
      options: [
        "Cliente-servidor",
        "Mesh",
        "Punto a punto",
        "Peer-to-peer"
      ],
      correct: 0,
      explanation: "El modelo cliente-servidor centraliza los recursos y servicios en equipos especializados (servidores), los cuales atienden las peticiones de los equipos de los usuarios (clientes).",
    },
    {
      id: 141,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué atributo permite coherencia de identidades POSIX en AD?",
      options: [
        "SPN",
        "RFC2307",
        "NetBIOS",
        "SIDHistory"
      ],
      correct: 1,
      explanation: "El esquema RFC 2307 permite que Active Directory almacene atributos de estilo UNIX (como UID, GID y rutas de home), permitiendo que equipos Linux se autentiquen contra el AD de forma nativa.",
    },
    {
      id: 142,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué servicio resuelve nombres de dominio en direcciones IP?",
      options: [
        "FTP",
        "DNS",
        "DHCP",
        "SMTP"
      ],
      correct: 1,
      explanation: "El DNS (Domain Name System) actúa como la 'agenda telefónica' de Internet y de las redes locales, traduciendo nombres fáciles de recordar (como google.com) en direcciones IP numéricas que las máquinas entienden.",
    },
    {
      id: 143,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo estándar permite consultar y modificar servicios de directorio?",
      options: [
        "FTP",
        "SNMP",
        "LDAP",
        "HTTP"
      ],
      correct: 2,
      explanation: "LDAP (Lightweight Directory Access Protocol) es el protocolo estándar de la industria que permite la comunicación, consulta y edición de la base de datos de un servicio de directorio como Active Directory u OpenLDAP.",
    },
    {
      id: 144,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué servicio Linux puede actuar como controlador de dominio compatible con Windows?",
      options: [
        "Bind",
        "Apache",
        "Samba AD DC",
        "MySQL"
      ],
      correct: 2,
      explanation: "Samba (específicamente a partir de la versión 4) puede configurarse como un Active Directory Domain Controller (AD DC), permitiendo gestionar usuarios, grupos y GPOs de Windows desde un servidor Linux.",
    },
    {
      id: 145,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué tipo de controladores de dominio son recomendados en sedes remotas?",
      options: [
        "DNS esclavo",
        "RODC (Read Only Domain Controller)",
        "PDC clásico",
        "DHCP secundario"
      ],
      correct: 1,
      explanation: "Un RODC (Controlador de Dominio de Solo Lectura) almacena una copia de la base de datos de AD pero no permite realizar cambios locales y no guarda contraseñas de forma predeterminada, minimizando riesgos si el servidor es robado.",
    },
    {
      id: 146,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo asigna direcciones IP dinámicamente?",
      options: [
        "DHCP",
        "LDAP",
        "DNS",
        "NTP"
      ],
      correct: 0,
      explanation: "El protocolo DHCP (Dynamic Host Configuration Protocol) permite que un servidor asigne automáticamente direcciones IP, máscaras de subred y puertas de enlace a los dispositivos que se conectan a la red.",
    },
    {
      id: 147,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué herramienta Linux integra autenticación con AD?",
      options: [
        "sudo",
        "grep",
        "cron",
        "SSSD"
      ],
      correct: 3,
      explanation: "SSSD (System Security Services Daemon) es el servicio moderno en Linux que permite conectar el sistema con fuentes de identidad remotas como Active Directory o LDAP, gestionando también el almacenamiento en caché para inicios de sesión offline.",
    },
    {
      id: 148,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué elemento centraliza la autenticación y administración en un dominio?",
      options: [
        "Proxy",
        "Router",
        "Servidor de archivos",
        "Controlador de dominio"
      ],
      correct: 3,
      explanation: "El Controlador de Dominio (DC) es el servidor que responde a las peticiones de autenticación y verifica a los usuarios. Centraliza la base de datos de Active Directory, permitiendo gestionar toda la red desde un solo punto.",
    },
    {
      id: 149,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo utiliza Active Directory para autenticación principal?",
      options: [
        "NTLM",
        "Kerberos",
        "TACACS+",
        "RADIUS"
      ],
      correct: 1,
      explanation: "Kerberos es el protocolo de autenticación por defecto en Active Directory desde Windows 2000. Utiliza tickets y criptografía de clave simétrica para proporcionar una autenticación segura y evitar el envío de contraseñas por la red.",
    },
    {
      id: 150,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué mecanismo aplica configuraciones a usuarios y equipos en AD?",
      options: [
        "GPO (Group Policy Object)",
        "Firewall local",
        "PAM",
        "Cron"
      ],
      correct: 0,
      explanation: "Las GPO (Directivas de Grupo) permiten a los administradores definir configuraciones de seguridad, instalar software y restringir acciones tanto para usuarios como para equipos de forma centralizada en todo el dominio.",
    },
    {
      id: 151,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo asegura sincronización de tiempo en un dominio?",
      options: [
        "NTP",
        "POP3",
        "SMTP",
        "DHCP"
      ],
      correct: 0,
      explanation: "NTP (Network Time Protocol) es esencial en un dominio de Active Directory para que todos los equipos tengan la misma hora, requisito indispensable para la validación de tickets de Kerberos.",
    },
    {
      id: 152,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué unidad lógica organiza objetos dentro de un dominio?",
      options: [
        "Subred",
        "Grupo de trabajo",
        "OU (Organizational Unit)",
        "VLAN"
      ],
      correct: 2,
      explanation: "Las Unidades Organizativas (OU) son contenedores dentro de un dominio donde se pueden colocar usuarios, grupos y equipos para facilitar la administración y la aplicación de GPOs.",
    },
    {
      id: 153,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué diferencia clave hay entre dominio y grupo de trabajo?",
      options: [
        "Necesidad de switches gestionables",
        "Uso exclusivo de Linux",
        "Uso de VLANs",
        "Centralización de autenticación"
      ],
      correct: 3,
      explanation: "En un dominio, la autenticación está centralizada en un servidor (Controlador de Dominio), mientras que en un Grupo de Trabajo cada equipo gestiona sus propios usuarios y contraseñas de forma local.",
    },
    {
      id: 154,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué orden de aplicación siguen las GPO?",
      options: [
        "Herencia aleatoria",
        "OU primero",
        "Dominio primero",
        "LSDOU (Local, Sitio, Dominio, OU)"
      ],
      correct: 3,
      explanation: "El orden de aplicación es Local, Sitio, Dominio y Unidades Organizativas (LSDOU). Las políticas aplicadas al final (OU) tienen prioridad sobre las aplicadas al principio si existe un conflicto.",
    },
    {
      id: 155,
      subject: "ISO",
      unit: "UT5",
      question: "¿Qué protocolo evita envío de contraseñas en claro usando tickets?",
      options: [
        "Telnet",
        "Kerberos",
        "FTP",
        "HTTP"
      ],
      correct: 1,
      explanation: "Kerberos utiliza un sistema de tickets emitidos por un Centro de Distribución de Claves (KDC). Esto permite que el usuario demuestre quién es ante los servicios de la red sin necesidad de enviar su contraseña real a través del cable.",
    },
    {
      id: 156,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué sistema de archivos combina gestor de volúmenes y sistema de archivos?",
      options: [
        "ZFS",
        "NTFS",
        "Ext4",
        "FAT32"
      ],
      correct: 0,
      explanation: "ZFS (Zettabyte File System) es un sistema de archivos avanzado que integra un gestor de volúmenes lógicos, lo que permite gestionar discos duros, crear RAIDs por software y asegurar la integridad de los datos en un solo nivel.",
    },
    {
      id: 157,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué directorio en Linux suele emplearse para montajes temporales?",
      options: [
        "/mnt",
        "/opt",
        "/etc",
        "/usr"
      ],
      correct: 0,
      explanation: "/mnt (Mount) es el directorio estándar destinado a puntos de montaje temporales para dispositivos de almacenamiento o recursos de red, según el estándar FHS (Filesystem Hierarchy Standard).",
    },
    {
      id: 158,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué herramienta de Linux se utiliza para gestionar particiones en discos grandes con GPT?",
      options: [
        "gdisk",
        "defrag",
        "diskpart",
        "mountvol"
      ],
      correct: 0,
      explanation: "gdisk (GPT fdisk) es la herramienta de línea de comandos diseñada específicamente para gestionar particiones en discos que utilizan la tabla de particiones GUID (GPT), superando las limitaciones del comando fdisk tradicional.",
    },
    {
      id: 159,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué comando de Windows verifica y repara la imagen del sistema?",
      options: [
        "chkdsk",
        "fdisk",
        "mountvol",
        "dism"
      ],
      correct: 3,
      explanation: "DISM (Deployment Image Servicing and Management) es una herramienta avanzada que se utiliza para reparar, preparar y dar mantenimiento a las imágenes de Windows, permitiendo corregir archivos dañados comparándolos con una fuente oficial.",
    },
    {
      id: 160,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué comando desmonta un sistema de archivos en Linux?",
      options: [
        "mount",
        "lsblk",
        "umount",
        "chmod"
      ],
      correct: 2,
      explanation: "El comando umount (unmount) se utiliza para liberar un dispositivo que ha sido previamente montado en el árbol de directorios. Es importante notar que no lleva la 'n' después de la 'u'.",
    },
    {
      id: 161,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué sistema de archivos de Microsoft está diseñado para alta capacidad y resiliencia?",
      options: [
        "ReFS",
        "FAT16",
        "Ext3",
        "ZFS"
      ],
      correct: 0,
      explanation: "ReFS (Resilient File System) es el sistema de archivos de nueva generación de Microsoft. Está diseñado para maximizar la disponibilidad de los datos, manejar grandes volúmenes y corregir errores de corrupción automáticamente.",
    },
    {
      id: 162,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué herramienta de Linux está especializada en reparar sistemas de archivos XFS?",
      options: [
        "fsck.fat",
        "fsck.ext4",
        "sfc",
        "xfs_repair"
      ],
      correct: 3,
      explanation: "A diferencia de otros sistemas de archivos que usan la familia de comandos fsck, XFS cuenta con su propia herramienta dedicada llamada xfs_repair para verificar y corregir errores de consistencia.",
    },
    {
      id: 163,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué esquema de particionado permite hasta 128 particiones primarias?",
      options: [
        "FAT32",
        "BIOS",
        "GPT",
        "MBR"
      ],
      correct: 2,
      explanation: "GPT (GUID Partition Table) es el estándar moderno que sustituye a MBR. Permite crear hasta 128 particiones por disco y gestionar volúmenes de más de 2 TB.",
    },
    {
      id: 164,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué herramienta de Windows permite verificar y reparar sistemas de archivos?",
      options: [
        "chkdsk",
        "fsck",
        "badblocks",
        "smartctl"
      ],
      correct: 0,
      explanation: "chkdsk (Check Disk) es la utilidad de Windows que verifica la integridad del sistema de archivos (NTFS, FAT32) y puede reparar errores lógicos y detectar sectores físicos defectuosos.",
    },
    {
      id: 165,
      subject: "ISO",
      unit: "UT6",
      question: "¿Cuál es el sistema de archivos por defecto en la mayoría de distribuciones Linux modernas?",
      options: [
        "HFS+",
        "Ext4",
        "NTFS",
        "FAT32"
      ],
      correct: 1,
      explanation: "Ext4 (Fourth Extended Filesystem) es el estándar actual en el mundo Linux. Soporta volúmenes de hasta 1 Exabyte, archivos de hasta 16 Terabytes y utiliza 'journaling' para evitar la pérdida de datos ante apagones.",
    },
    {
      id: 166,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué herramienta de Linux se usa para reparar sistemas de archivos ext4?",
      options: [
        "chkdsk",
        "dism",
        "e2fsck",
        "sfc"
      ],
      correct: 2,
      explanation: "e2fsck (ext2/ext3/ext4 file system check) es la herramienta específica para verificar y reparar la familia de sistemas de archivos ext. Es una versión especializada del comando genérico fsck.",
    },
    {
      id: 167,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué archivo de configuración en Linux gestiona los montajes automáticos?",
      options: [
        "/etc/hosts",
        "/etc/fstab",
        "/etc/passwd",
        "/etc/resolv.conf"
      ],
      correct: 1,
      explanation: "El archivo /etc/fstab (File System Table) contiene la información necesaria para montar automáticamente las particiones del disco, unidades de red y otros sistemas de archivos durante el arranque del sistema.",
    },
    {
      id: 168,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué comando en Linux muestra la estructura de bloques de dispositivos?",
      options: [
        "lsblk",
        "diskpart",
        "defrag",
        "fsck"
      ],
      correct: 0,
      explanation: "El comando lsblk (List Block Devices) muestra una lista de todos los dispositivos de almacenamiento disponibles, sus particiones y sus puntos de montaje en una estructura de árbol muy fácil de leer.",
    },
    {
      id: 169,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué comando de Windows se usa para gestionar particiones desde línea de comandos?",
      options: [
        "blkid",
        "parted",
        "fdisk",
        "diskpart"
      ],
      correct: 3,
      explanation: "diskpart es el intérprete de comandos de Windows para administrar discos, particiones y volúmenes. Permite realizar tareas avanzadas como crear RAIDs, extender volúmenes o convertir discos entre MBR y GPT.",
    },
    {
      id: 170,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué componente mantiene el registro de los bloques ocupados y disponibles?",
      options: [
        "La memoria virtual",
        "El journal del sistema",
        "El registro de procesos",
        "La tabla de asignación de archivos"
      ],
      correct: 3,
      explanation: "La tabla de asignación de archivos (como la FAT en sistemas antiguos o la MFT en NTFS) es el índice donde el sistema operativo consulta qué bloques del disco están libres y cuáles pertenecen a cada archivo.",
    },
    {
      id: 171,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué es un sistema de archivos?",
      options: [
        "Una tabla de procesos en ejecución",
        "Una memoria caché de la CPU",
        "Un controlador de dispositivo de red",
        "Una estructura que organiza y gestiona datos en dispositivos de almacenamiento"
      ],
      correct: 3,
      explanation: "Un sistema de archivos es el componente del sistema operativo encargado de administrar el espacio en disco, permitiendo la creación, borrado, lectura y organización de los datos en archivos y directorios.",
    },
    {
      id: 172,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué característica distingue a NTFS frente a FAT32?",
      options: [
        "Soporte para compresión, cifrado y cuotas",
        "Limitación de archivos a 4 GB",
        "Compatibilidad universal con todos los sistemas",
        "Falta de journaling"
      ],
      correct: 0,
      explanation: "NTFS es un sistema mucho más avanzado que ofrece características de seguridad y gestión ausentes en FAT32, como permisos ACL, cifrado (EFS), compresión nativa y cuotas de disco para usuarios.",
    },
    {
      id: 173,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué opción de montaje en Linux fuerza el acceso en solo lectura?",
      options: [
        "user",
        "exec",
        "rw",
        "ro"
      ],
      correct: 3,
      explanation: "La opción 'ro' (read-only) le indica al kernel que el sistema de archivos debe montarse sin permisos de escritura, impidiendo cualquier modificación en los datos.",
    },
    {
      id: 174,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué error típico se produce cuando un disco presenta áreas físicas dañadas?",
      options: [
        "Journal dañado",
        "Sector defectuoso",
        "Fragmentación alta",
        "Inodo corrupto"
      ],
      correct: 1,
      explanation: "Un sector defectuoso (bad sector) es una pequeña parte del disco duro que ha sufrido un daño físico o magnético y ya no es capaz de retener o leer datos de forma fiable.",
    },
    {
      id: 175,
      subject: "ISO",
      unit: "UT6",
      question: "¿Qué tecnología de discos permite predecir fallos inminentes?",
      options: [
        "RAID 0",
        "SMART",
        "BIOS",
        "UEFI"
      ],
      correct: 1,
      explanation: "S.M.A.R.T. (Self-Monitoring, Analysis and Reporting Technology) es un sistema de monitorización incorporado en los discos duros que supervisa indicadores de fiabilidad como la temperatura o sectores reasignados.",
    },
    {
      id: 176,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué herramienta de Linux permite auditar eventos de seguridad de alto valor?",
      options: [
        "auditd",
        "systemctl",
        "iptables",
        "cron"
      ],
      correct: 0,
      explanation: "auditd es el componente de usuario del Sistema de Auditoría de Linux. Se encarga de escribir en disco los registros de auditoría que permiten rastrear acciones como accesos a archivos, cambios en permisos o ejecuciones de programas por parte de los usuarios.",
    },
    {
      id: 177,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué comando de Linux muestra el estado de sincronización horaria?",
      options: [
        "ls -l",
        "df -h",
        "timedatectl status",
        "ps aux"
      ],
      correct: 2,
      explanation: "timedatectl status muestra la hora local, la hora universal (UTC) y, lo más importante, si el servicio de sincronización de red (NTP) está activo y sincronizado.",
    },
    {
      id: 178,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué cuentas requieren protección especial con PAM y MFA?",
      options: [
        "Cuentas de invitado",
        "Usuarios estándar",
        "Cuentas privilegiadas",
        "Cuentas bloqueadas"
      ],
      correct: 2,
      explanation: "Las cuentas privilegiadas (administradores, root, etc.) tienen acceso total al sistema, por lo que requieren capas adicionales de seguridad como PAM para controlar cuándo se usan y MFA para verificar la identidad del usuario.",
    },
    {
      id: 179,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué medida asegura la integridad de un archivo de evidencia?",
      options: [
        "Copiarlo en otro directorio",
        "Renombrar el archivo",
        "Hash criptográfico",
        "Cambiar permisos de lectura"
      ],
      correct: 2,
      explanation: "El hash criptográfico genera una 'huella digital' única del contenido del archivo. Si un solo bit del archivo cambia, el hash será completamente distinto, permitiendo verificar su integridad.",
    },
    {
      id: 180,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué estándar internacional se complementa con ENS para auditorías mixtas?",
      options: [
        "ISO/IEC 27001",
        "ITIL",
        "ISO 14001",
        "NIST 800-53"
      ],
      correct: 0,
      explanation: "La norma ISO/IEC 27001 es el estándar internacional para los Sistemas de Gestión de Seguridad de la Información (SGSI). Al ser muy similar en controles al ENS, muchas empresas realizan auditorías mixtas para obtener ambas certificaciones simultáneamente.",
    },
    {
      id: 181,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué evento de Windows corresponde a un inicio de sesión correcto?",
      options: [
        "4624",
        "1102",
        "4625",
        "4688"
      ],
      correct: 0,
      explanation: "El ID de evento 4624 se genera cuando una cuenta de usuario inicia sesión correctamente en la máquina local o de forma remota. Es fundamental para auditar quién accede al sistema y cuándo.",
    },
    {
      id: 182,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué marco normativo español regula la seguridad en sistemas de información?",
      options: [
        "GDPR",
        "PCI-DSS",
        "ENS (Esquema Nacional de Seguridad)",
        "COBIT"
      ],
      correct: 2,
      explanation: "El ENS (Esquema Nacional de Seguridad), regulado por el Real Decreto 311/2022, establece los principios básicos y requisitos mínimos para garantizar la seguridad de la información en la Administración Pública española y sus colaboradores.",
    },
    {
      id: 183,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué norma internacional define el Sistema de Gestión de Seguridad de la Información (SGSI)?",
      options: [
        "ISO/IEC 27001",
        "ITIL",
        "CIS Controls",
        "ISO 9001"
      ],
      correct: 0,
      explanation: "La ISO/IEC 27001 es el estándar internacional que describe los requisitos para establecer, implementar, mantener y mejorar continuamente un SGSI, basándose en la gestión de riesgos.",
    },
    {
      id: 184,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué comando de Windows permite exportar registros de eventos de seguridad?",
      options: [
        "netstat",
        "ping",
        "ipconfig",
        "wevtutil epl"
      ],
      correct: 3,
      explanation: "wevtutil (Windows Events Command Line Utility) permite gestionar los registros de eventos. El parámetro 'epl' (export-log) se usa para exportar y guardar eventos en un archivo de registro externo (.evtx).",
    },
    {
      id: 185,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué fase de la respuesta a incidentes incluye la erradicación de la causa raíz?",
      options: [
        "Post-mortem",
        "Contención y erradicación",
        "Preparación",
        "Recuperación"
      ],
      correct: 1,
      explanation: "La fase de Contención, Erradicación y Recuperación busca primero limitar el daño (contención) y después eliminar la causa del problema (erradicación), como borrar malware o cerrar cuentas vulneradas.",
    },
    {
      id: 186,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué solución open source de SIEM se basa en OSSEC?",
      options: [
        "Splunk",
        "Graylog",
        "Wazuh",
        "Nagios"
      ],
      correct: 2,
      explanation: "Wazuh es una plataforma de seguridad de código abierto que nació como un fork de OSSEC. Combina funciones de HIDS (detección de intrusos en host), monitorización de integridad de archivos y análisis de logs.",
    },
    {
      id: 187,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué plataforma de gestión de logs destaca por búsquedas y dashboards personalizados?",
      options: [
        "Metasploit",
        "Graylog",
        "Wireshark",
        "Nessus"
      ],
      correct: 1,
      explanation: "Graylog es una potente herramienta de gestión de registros que permite recolectar, indexar y analizar grandes volúmenes de datos. Destaca por su motor de búsqueda rápido y la facilidad para crear paneles visuales (dashboards).",
    },
    {
      id: 188,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué documento recoge hallazgos, evidencias, riesgos y recomendaciones?",
      options: [
        "Informe de auditoría",
        "Inventario de hardware",
        "Acuerdo de nivel de servicio",
        "Manual de usuario"
      ],
      correct: 0,
      explanation: "El informe de auditoría es el resultado final del proceso de revisión. Su objetivo es comunicar formalmente las debilidades encontradas (hallazgos), las pruebas que las respaldan (evidencias) y cómo solucionarlas.",
    },
    {
      id: 189,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué principio se aplica en RBAC para reducir riesgos?",
      options: [
        "Mínimo privilegio",
        "Uso compartido de credenciales",
        "Máxima disponibilidad",
        "Redundancia de hardware"
      ],
      correct: 0,
      explanation: "El principio de mínimo privilegio (Principle of Least Privilege) establece que un usuario debe tener solo los permisos estrictamente necesarios para realizar su trabajo, ni más ni menos, minimizando el impacto en caso de un error o ataque.",
    },
    {
      id: 190,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué herramienta de Windows permite gestionar políticas de auditoría detalladas desde la línea de comandos?",
      options: [
        "auditpol",
        "net use",
        "msconfig",
        "gpupdate"
      ],
      correct: 0,
      explanation: "auditpol es la utilidad de línea de comandos que permite mostrar y configurar las políticas de auditoría del sistema, ofreciendo un control mucho más granular que las directivas de grupo básicas.",
    },
    {
      id: 191,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué modelo de control de accesos se basa en roles y jerarquías?",
      options: [
        "ABAC",
        "MAC",
        "RBAC",
        "DAC"
      ],
      correct: 2,
      explanation: "RBAC (Role-Based Access Control) asigna permisos a roles específicos en lugar de a usuarios individuales. Estos roles pueden organizarse de forma jerárquica, permitiendo que un rol superior herede automáticamente los permisos de los roles inferiores.",
    },
    {
      id: 192,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué técnica protege cuentas privilegiadas mediante concesión temporal de permisos?",
      options: [
        "Desfragmentación de disco",
        "Just-In-Time (JIT)",
        "Copia de seguridad incremental",
        "Multiplexación de procesos"
      ],
      correct: 1,
      explanation: "El acceso Just-In-Time (JIT) permite que los usuarios tengan privilegios elevados solo durante un tiempo limitado y para una tarea específica, reduciendo el riesgo de que una cuenta comprometida cause daños permanentes.",
    },
    {
      id: 193,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué herramienta Linux muestra los últimos accesos fallidos por SSH?",
      options: [
        "free -m",
        "journalctl -u ssh",
        "uname -a",
        "ps aux"
      ],
      correct: 1,
      explanation: "journalctl es la herramienta para consultar los logs de systemd. Al añadir '-u ssh' filtramos específicamente los eventos del servicio Secure Shell, donde se registran los intentos de conexión fallidos.",
    },
    {
      id: 194,
      subject: "ISO",
      unit: "UT7",
      question: "¿Qué medida organizativa evita la acumulación excesiva de permisos?",
      options: [
        "Deshabilitar el firewall",
        "Formateo de discos",
        "Compartir contraseñas",
        "Recertificación periódica"
      ],
      correct: 3,
      explanation: "La recertificación periódica de accesos consiste en revisar cada cierto tiempo si los usuarios aún necesitan los permisos que tienen asignados, eliminando aquellos que ya no sean necesarios para sus funciones actuales.",
    },
    {
      id: 195,
      subject: "ISO",
      unit: "UT7",
      question: "¿Cuál es el objetivo principal de una auditoría de sistemas?",
      options: [
        "Eliminar virus informáticos",
        "Acelerar el rendimiento del hardware",
        "Evaluar la eficacia de los controles técnicos y organizativos",
        "Reducir el coste de licencias de software"
      ],
      correct: 2,
      explanation: "El objetivo de la auditoría es verificar si los controles de seguridad (como backups, firewalls o políticas de contraseñas) existen, se aplican correctamente y son efectivos para proteger los activos de la organización.",
    },
    {
      id: 196,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué comando en Linux permite instalar Apache?",
      options: [
        "sudo apt install apache2",
        "netstat -tulnp",
        "yum remove apache2",
        "systemctl status apache2"
      ],
      correct: 0,
      explanation: "En distribuciones basadas en Debian/Ubuntu, el gestor de paquetes 'apt' se utiliza con el comando 'install' para descargar e instalar el servidor web Apache2 desde los repositorios oficiales.",
    },
    {
      id: 197,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué servicio de transferencia de archivos no cifra de manera nativa sus comunicaciones?",
      options: [
        "SCP",
        "SFTP",
        "FTP",
        "FTPS"
      ],
      correct: 2,
      explanation: "FTP (File Transfer Protocol) es un protocolo antiguo que envía tanto las credenciales como los datos en texto plano, lo que permite que cualquiera que intercepte el tráfico pueda leer la información. Sus versiones seguras son SFTP y FTPS.",
    },
    {
      id: 198,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué herramienta se usa en Linux para configurar firewalls de forma sencilla?",
      options: [
        "cron",
        "UFW",
        "netstat",
        "curl"
      ],
      correct: 1,
      explanation: "UFW (Uncomplicated Firewall) es una interfaz simplificada para gestionar iptables. Su objetivo es facilitar la configuración del firewall mediante comandos intuitivos como 'allow' o 'deny'.",
    },
    {
      id: 199,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué práctica de seguridad se recomienda al usar contenedores?",
      options: [
        "Usar siempre root para evitar errores",
        "Compartir volúmenes sin restricción",
        "Ejecutar procesos con usuarios sin privilegios root",
        "Evitar la actualización de imágenes"
      ],
      correct: 2,
      explanation: "Por seguridad (principio de mínimo privilegio), los procesos dentro de un contenedor no deben ejecutarse como root. De esta forma, si el contenedor es vulnerado, el atacante tendrá más difícil 'escapar' al sistema operativo anfitrión.",
    },
    {
      id: 200,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué herramienta permite automatizar despliegues declarativos de infraestructura?",
      options: [
        "Bash",
        "Terraform",
        "Git",
        "Docker"
      ],
      correct: 1,
      explanation: "Terraform es una herramienta de 'Infraestructura como Código' (IaC) que permite definir mediante archivos de configuración (declarativos) cómo debe ser el entorno, encargándose de crear y gestionar los recursos automáticamente.",
    },
    {
      id: 201,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué arquitectura clásica se utiliza habitualmente en sistemas cliente-servidor?",
      options: [
        "Arquitectura híbrida de cinco capas",
        "Monolítica de una sola capa",
        "Arquitectura mesh",
        "Tres capas: presentación, lógica de negocio y datos"
      ],
      correct: 3,
      explanation: "La arquitectura de tres capas es el estándar en sistemas cliente-servidor. Divide la aplicación en: Capa de Presentación (interfaz), Capa de Negocio (procesamiento) y Capa de Datos (almacenamiento), permitiendo que cada una escale o cambie de forma independiente.",
    },
    {
      id: 202,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué herramienta permite simular usuarios concurrentes en pruebas de carga?",
      options: [
        "Grafana",
        "Prometheus",
        "JMeter",
        "ELK"
      ],
      correct: 2,
      explanation: "Apache JMeter es una herramienta de código abierto diseñada para realizar pruebas de carga y medir el rendimiento. Permite simular una carga pesada sobre un servidor, grupo de servidores o red para probar su resistencia.",
    },
    {
      id: 203,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué comando en Linux permite verificar el estado de un servicio?",
      options: [
        "cd",
        "ls -l",
        "systemctl status",
        "pwd"
      ],
      correct: 2,
      explanation: "El comando 'systemctl status' seguido del nombre del servicio permite ver si este está activo (running), desactivado (dead) o si ha tenido errores recientemente, mostrando además las últimas líneas de su log.",
    },
    {
      id: 204,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué concepto implica gestionar infraestructura mediante código reproducible?",
      options: [
        "Gestión manual de servicios",
        "Infrastructure as Code (IaC)",
        "Ejecución en local",
        "Virtualización ligera"
      ],
      correct: 1,
      explanation: "Infrastructure as Code (IaC) es la práctica de gestionar y aprovisionar centros de datos a través de archivos de definición legibles por máquina, en lugar de configuraciones físicas de hardware o herramientas de configuración interactiva.",
    },
    {
      id: 205,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué herramienta se utiliza para centralizar logs en múltiples servidores?",
      options: [
        "Zabbix",
        "Nessus",
        "top",
        "ELK Stack"
      ],
      correct: 3,
      explanation: "El ELK Stack (Elasticsearch, Logstash y Kibana) es una solución completa para recolectar (Logstash), buscar y analizar (Elasticsearch) y visualizar (Kibana) logs de múltiples fuentes en tiempo real.",
    },
    {
      id: 206,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué gestor de servicios se utiliza en Linux para configurar arranques automáticos?",
      options: [
        "init.d",
        "rc.local",
        "systemd",
        "Upstart"
      ],
      correct: 2,
      explanation: "systemd es el sistema de inicio y gestión de servicios estándar en la mayoría de distribuciones Linux modernas. Utiliza el comando 'systemctl enable' para configurar que un servicio arranque automáticamente al iniciar el sistema.",
    },
    {
      id: 207,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué protocolo asegura las comunicaciones entre cliente y servidor?",
      options: [
        "ARP",
        "HTTP sin cifrado",
        "TLS",
        "FTP"
      ],
      correct: 2,
      explanation: "TLS (Transport Layer Security) es el protocolo criptográfico que proporciona comunicaciones seguras por red. Es el sucesor de SSL y es el encargado de que el protocolo HTTP se convierta en HTTPS mediante el uso de certificados digitales.",
    },
    {
      id: 208,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué servicio proporciona acceso web en un entorno cliente-servidor?",
      options: [
        "Apache o Nginx",
        "FTP",
        "Redis",
        "MySQL"
      ],
      correct: 0,
      explanation: "Apache y Nginx son servidores web. Su función es recibir las peticiones HTTP/HTTPS de los clientes (navegadores) y entregarles el contenido correspondiente (archivos HTML, imágenes, código JS, etc.).",
    },
    {
      id: 209,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué motor de base de datos destaca por su robustez y soporte ACID avanzado?",
      options: [
        "MariaDB",
        "MySQL",
        "PostgreSQL",
        "SQLite"
      ],
      correct: 2,
      explanation: "PostgreSQL es un sistema de gestión de bases de datos relacionales orientado a objetos. Es famoso por su estricto cumplimiento de ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad) y su capacidad para manejar cargas de datos complejas.",
    },
    {
      id: 210,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué es lo primero que debe realizarse antes de implantar un servicio cliente-servidor?",
      options: [
        "Análisis de requisitos y dependencias",
        "Configuración de firewalls",
        "Pruebas de rendimiento",
        "Instalación de Apache"
      ],
      correct: 0,
      explanation: "Antes de cualquier instalación, es vital identificar los requisitos de hardware, software y las dependencias (librerías, versiones de kernel, otros servicios) para asegurar que el entorno sea compatible y estable.",
    },
    {
      id: 211,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué archivo de configuración en MySQL permite ajustar parámetros críticos?",
      options: [
        "postgresql.conf",
        "nginx.conf",
        "my.cnf",
        "httpd.conf"
      ],
      correct: 2,
      explanation: "El archivo 'my.cnf' (en Linux) o 'my.ini' (en Windows) es el archivo de configuración principal de MySQL/MariaDB. En él se definen parámetros como el puerto, el tamaño del buffer, los límites de memoria y la ubicación de los datos.",
    },
    {
      id: 212,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué comando en Linux muestra la memoria disponible en el sistema?",
      options: [
        "df -h",
        "free -h",
        "cat /etc/os-release",
        "ls"
      ],
      correct: 1,
      explanation: "El comando 'free' muestra la cantidad total de memoria física (RAM) y de intercambio (SWAP) usada y libre. El parámetro '-h' (human-readable) convierte los valores a GB o MB para facilitar su lectura.",
    },
    {
      id: 213,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué comando de PowerShell permite registrar un nuevo servicio en Windows?",
      options: [
        "New-Service",
        "sc query",
        "Get-Service",
        "Set-Service"
      ],
      correct: 0,
      explanation: "El cmdlet 'New-Service' crea una nueva entrada para un servicio de Windows en el registro y en la base de datos de servicios, permitiendo especificar el nombre, la ruta del ejecutable y el tipo de inicio.",
    },
    {
      id: 214,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué comando en Linux muestra información sobre la CPU?",
      options: [
        "top",
        "lscpu",
        "df -h",
        "free -h"
      ],
      correct: 1,
      explanation: "El comando 'lscpu' recoge información de la arquitectura de la CPU, como el número de núcleos, hilos, sockets, modelo de procesador, y las cachés L1, L2 y L3.",
    },
    {
      id: 215,
      subject: "ISO",
      unit: "UT8",
      question: "¿Qué comando en Windows abre un puerto en el firewall?",
      options: [
        "ipconfig /all",
        "net start",
        "netsh advfirewall firewall add rule",
        "ping"
      ],
      correct: 2,
      explanation: "El comando 'netsh advfirewall' es la herramienta de línea de comandos potente para gestionar el Firewall de Windows. Permite crear reglas de entrada y salida para permitir o bloquear puertos y programas específicos.",
    },
    /* --- BBDD UT1: INTRODUCCIÓN A LAS BASES DE DATOS --- */

    {
      id: 216,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué es una base de datos?",
      options: [
        "Un archivo ejecutable para el sistema operativo",
        "Un lenguaje de programación para páginas web",
        "Un dispositivo de red para comunicaciones",
        "Un sistema que organiza y almacena datos de forma estructurada"
      ],
      correct: 3,
      explanation: "Una base de datos se define fundamentalmente como un sistema diseñado para organizar y almacenar información de manera estructurada para facilitar su gestión y acceso posterior[cite: 9, 13].",
    },
    {
      id: 217,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué es un fichero indexado?",
      options: [
        "Un documento físico con enlaces manuales",
        "Una copia de seguridad en cinta",
        "Una hoja de cálculo protegida",
        "Un fichero que utiliza índices para localizar registros rápidamente"
      ],
      correct: 3,
      explanation: "Un fichero indexado es aquel que emplea estructuras adicionales llamadas índices para agilizar la localización de registros específicos sin recorrer todo el archivo[cite: 14, 18].",
    },
    {
      id: 218,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué caracteriza a los ficheros secuenciales?",
      options: [
        "Integran estructuras en grafos",
        "Pueden cifrar los datos automáticamente",
        "Utilizan sistemas de réplica distribuida",
        "Se accede a los registros de forma ordenada y progresiva"
      ],
      correct: 3,
      explanation: "En la organización secuencial, el acceso a los datos se realiza siguiendo el orden físico en el que fueron grabados, pasando por cada registro de forma progresiva[cite: 19, 23].",
    },
    {
      id: 219,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué estructura utiliza el modelo relacional?",
      options: [
        "Documentos PDF incrustados",
        "Árboles de decisión jerárquicos",
        "Tablas compuestas por filas y columnas",
        "Registros cifrados en XML"
      ],
      correct: 2,
      explanation: "El modelo relacional organiza la información mediante el uso de tablas, las cuales se estructuran lógicamente en filas y columnas relacionadas entre sí[cite: 24, 27].",
    },
    {
      id: 220,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué sector usa las bases de datos para gestionar historias clínicas electrónicas?",
      options: ["Educación", "Transporte", "Sanidad", "Turismo"],
      correct: 2,
      explanation: "Dentro del ámbito de la sanidad, las bases de datos son herramientas críticas para el almacenamiento y gestión eficiente de las historias clínicas de los pacientes[cite: 29, 32].",
    },
    {
      id: 221,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué nivel de abstracción corresponde al almacenamiento físico de datos?",
      options: ["Nivel sintáctico", "Nivel externo", "Nivel conceptual", "Nivel interno"],
      correct: 3,
      explanation: "El nivel interno describe técnicamente cómo se almacenan físicamente los datos, ocultando esta complejidad a los niveles conceptual y externo[cite: 34, 38, 39].",
    },
    {
      id: 222,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Quién formuló el modelo relacional de bases de datos?",
      options: ["Charles Babbage", "Edgar F. Codd", "Tim Berners-Lee", "Alan Turing"],
      correct: 1,
      explanation: "El modelo relacional fue propuesto originalmente por Edgar F. Codd en 1970, estableciendo las bases teóricas de la mayoría de SGBD actuales[cite: 40, 42].",
    },
    {
      id: 223,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué nivel de abstracción define la estructura lógica general de la base de datos?",
      options: ["Nivel interno", "Nivel de red", "Nivel externo", "Nivel conceptual"],
      correct: 3,
      explanation: "El nivel conceptual es el encargado de definir la estructura lógica global de los datos, abstrayéndose de los detalles de almacenamiento físico[cite: 45, 49].",
    },
    {
      id: 224,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué es una vista en el contexto de una base de datos?",
      options: [
        "Un backup temporal",
        "Un archivo indexado externo",
        "Un duplicado físico de otra tabla",
        "Una tabla virtual basada en una consulta"
      ],
      correct: 3,
      explanation: "Una vista actúa como una tabla virtual que muestra un conjunto de datos resultante de una consulta específica, sin crear una nueva tabla física[cite: 50, 54].",
    },
    {
      id: 225,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Cuál es una ventaja de los SGBD respecto a los ficheros tradicionales?",
      options: [
        "Permiten relaciones entre datos y control de acceso",
        "Requieren menos conocimientos técnicos",
        "Consumen menos energía eléctrica",
        "Evitan la creación de backups"
      ],
      correct: 0,
      explanation: "A diferencia de los ficheros aislados, los SGBD ofrecen ventajas clave como la gestión de relaciones complejas y un control de seguridad avanzado[cite: 55, 56].",
    },
    {
      id: 226,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué modelo de datos utiliza relaciones entre nodos?",
      options: ["Modelo OLTP", "Modelo jerárquico", "Modelo en grafos", "Modelo físico"],
      correct: 2,
      explanation: "El modelo en grafos utiliza nodos y aristas (relaciones) para representar conexiones complejas entre diferentes elementos de información[cite: 60, 63].",
    },
    {
      id: 227,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Cuál es una característica del modelo clave-valor?",
      options: [
        "Cada fila debe contener al menos tres claves",
        "Cada registro está formado por una clave única y su valor asociado",
        "Se basa en estructuras XML estrictas",
        "Utiliza exclusivamente memoria volátil"
      ],
      correct: 1,
      explanation: "En este modelo, cada dato se identifica mediante una clave única que permite acceder a su valor asociado de forma extremadamente rápida[cite: 65, 67].",
    },
    {
      id: 228,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué nivel de abstracción presenta los datos de forma personalizada a cada usuario?",
      options: ["Nivel conceptual", "Nivel físico", "Nivel interno", "Nivel externo"],
      correct: 3,
      explanation: "El nivel externo proporciona las diferentes vistas personalizadas de la base de datos según las necesidades de cada perfil de usuario[cite: 70, 74].",
    },
    {
      id: 229,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué herramienta se usa habitualmente para consultas en bases de datos relacionales?",
      options: ["HTML", "CSS", "SQL", "Python"],
      correct: 2,
      explanation: "SQL (Structured Query Language) es el estándar de lenguaje utilizado para definir, manipular y consultar bases de datos de tipo relacional[cite: 75, 78].",
    },
    {
      id: 230,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué define un fichero plano?",
      options: [
        "Un archivo de texto con registros en líneas separadas y delimitados por símbolos",
        "Una tabla con claves foráneas complejas",
        "Un archivo HTML con código embebido",
        "Un sistema de archivos en clúster"
      ],
      correct: 0,
      explanation: "Un fichero plano consiste en un archivo de texto simple donde cada línea es un registro y los campos se separan mediante un carácter delimitador[cite: 80, 81].",
    },
    {
      id: 231,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué tipo de sistema se especializa en análisis de grandes volúmenes de datos?",
      options: ["Redis", "OLTP", "Hashing", "OLAP (Online Analytical Processing)"],
      correct: 3,
      explanation: "Los sistemas OLAP están optimizados para el procesamiento analítico y la consulta compleja de grandes cantidades de datos históricos[cite: 85, 89].",
    },
    {
      id: 232,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué hace un sistema gestor de bases de datos (SGBD)?",
      options: [
        "Gestiona exclusivamente datos multimedia",
        "Diseña interfaces gráficas de usuario",
        "Permitir crear, modificar y consultar datos de forma estructurada",
        "Encripta todos los documentos del sistema"
      ],
      correct: 2,
      explanation: "La función principal de un SGBD es proporcionar el entorno necesario para la creación, mantenimiento y consulta organizada de los datos[cite: 90, 93].",
    },
    {
      id: 233,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué tipo de base de datos almacena documentos con estructuras JSON?",
      options: ["Base de datos secuencial", "Base de datos OLAP", "Base de datos documental", "Base de datos jerárquica"],
      correct: 2,
      explanation: "Las bases de datos documentales están diseñadas para almacenar información en formatos semiestructurados como documentos JSON o similares[cite: 95, 98].",
    },
    {
      id: 234,
      subject: "BBDD",
      unit: "UT1",
      question: "¿Qué tipo de sistema se emplea para gestionar transacciones rápidas y frecuentes?",
      options: ["OLTP (Online Transaction Processing)", "Modelo orientado a objetos", "OLAP", "NoSQL"],
      correct: 0,
      explanation: "Los sistemas OLTP están enfocados en el procesamiento de transacciones rápidas y frecuentes en tiempo real, como ventas o reservas[cite: 100, 101].",
    },
  ];

  // =========================
  // UTILIDADES
  // =========================
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const shuffleOptions = (question) => {
    const indices = [0, 1, 2, 3];
    const shuffledIndices = shuffleArray(indices);

    return {
      ...question,
      options: shuffledIndices.map((i) => question.options[i]),
      correct: shuffledIndices.indexOf(question.correct),
    };
  };

  const formatTime = (seconds) => {
    const s = Math.max(0, seconds);
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // =========================
  // ESTADO
  // =========================
  const [questions, setQuestions] = useState([]);
  const [examStarted, setExamStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);

  // Nombre + asignatura
  const [studentName, setStudentName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ISO");

  // Corrección
  const [blankCountsAsWrong, setBlankCountsAsWrong] = useState(false); // OFF: blancos no penalizan

  // Modal confirmación
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);

  // Formspree
  const [sendingResult, setSendingResult] = useState(false);
  const [resultSent, setResultSent] = useState(false);
  const [sendError, setSendError] = useState("");

  // Pool disponible por asignatura (para habilitar/deshabilitar)
  const availableCounts = useMemo(() => {
    // 1. Creamos un objeto vacío
    const counts = {};
    
    // 2. Lo inicializamos automáticamente con las asignaturas que existen en SUBJECTS
    Object.keys(SUBJECTS).forEach(key => {
      counts[key] = 0;
    });

    // 3. Contamos todas las preguntas que haya en el banco
    allQuestions.forEach((q) => {
      if (counts[q.subject] !== undefined) {
        counts[q.subject] += 1;
      }
    });
    
    return counts;
  }, [allQuestions]);

  const selectedSubjectName = SUBJECTS[selectedSubject] || "Examen";

  // =========================
  // INICIALIZACIÓN (no arranca examen aquí, solo prepara estado)
  // =========================
  useEffect(() => {
    // No hacemos initializeExam aquí, porque depende de la asignatura seleccionada
  }, []);

  const initializeExam = (subjectKey) => {
    const pool = allQuestions.filter((q) => q.subject === subjectKey);
    const shuffled = shuffleArray(pool);
    const selected = shuffled.slice(0, 30);
    const questionsWithShuffledOptions = selected.map((q) => shuffleOptions(q));
    setQuestions(questionsWithShuffledOptions);
  };

  // =========================
  // CÁLCULO NOTA (penalización 1/3 fallos)
  // =========================
  const getScoreDetails = () => {
    const total = questions.length;

    let correct = 0;
    let answered = 0;

    questions.forEach((q) => {
      const a = selectedAnswers[q.id];
      if (a !== undefined) answered++;
      if (a === q.correct) correct++;
    });

    const blanks = total - answered;

    const wrong = blankCountsAsWrong ? total - correct : answered - correct;

    const penaltyQuestions = Math.floor(wrong / 3);

    const netCorrect = Math.max(0, correct - penaltyQuestions);

    const pointsPerQuestion = total > 0 ? 10 / total : 0;
    const grade10 = Number((netCorrect * pointsPerQuestion).toFixed(2));

    const percentage = total > 0 ? Number(((netCorrect / total) * 100).toFixed(1)) : 0;

    return {
      total,
      answered,
      blanks,
      correct,
      wrong,
      penaltyQuestions,
      netCorrect,
      grade10,
      percentage,
    };
  };

  const details = getScoreDetails();

  // =========================
  // LISTA FINAL: SOLO LAS QUE FALLÓ O DEJÓ EN BLANCO
  // =========================
  const mistakesAndBlanks = useMemo(() => {
    return questions
      .map((q) => {
        const chosen = selectedAnswers[q.id];
        const isBlank = chosen === undefined;
        const isWrong = chosen !== undefined && chosen !== q.correct;

        return {
          ...q,
          chosen,
          isBlank,
          isWrong,
          shouldShow: isWrong || isBlank,
        };
      })
      .filter((x) => x.shouldShow);
  }, [questions, selectedAnswers]);

  // =========================
  // ENVÍO A FORMSPREE
  // =========================
  const sendResultToFormspree = async () => {
    if (sendingResult || resultSent) return;

    const name = studentName.trim();
    if (!name) {
      setSendError("Escribe tu nombre o apodo para empezar.");
      return;
    }

    setSendError("");
    setSendingResult(true);

    try {
      const units = questions.reduce((acc, q) => {
        acc[q.unit] = (acc[q.unit] || 0) + 1;
        return acc;
      }, {});

      const payload = {
        studentName: name,
        subject: selectedSubjectName,
        subjectKey: selectedSubject,
        mode: blankCountsAsWrong ? "blancos_penalizan" : "blancos_no_penalizan",
        grade10: details.grade10,
        percentage: details.percentage,
        correct: details.correct,
        wrong: details.wrong,
        blanks: details.blanks,
        penaltyQuestions: details.penaltyQuestions,
        netCorrect: details.netCorrect,
        total: details.total,
        timestamp: new Date().toISOString(),
        timeUsedSeconds: EXAM_DURATION_SECONDS - timeLeft,
        timeLeftSeconds: timeLeft,
        units,
      };

      const res = await fetch("https://formspree.io/f/myzdldkp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      setResultSent(true);
    } catch (err) {
      setSendError("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setSendingResult(false);
    }
  };

  // =========================
  // ACCIONES
  // =========================
  const handleAnswer = (questionId, answerIndex) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const finalizeNow = async () => {
    if (showResults) return;
    setShowResults(true);
    setConfirmFinishOpen(false);
    await sendResultToFormspree();
  };

  const tryFinishExam = () => {
    if (showResults) return;

    if (details.blanks > 0) {
      setConfirmFinishOpen(true);
      return;
    }

    finalizeNow();
  };

  const restartExam = () => {
    setExamStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setConfirmFinishOpen(false);

    setTimeLeft(EXAM_DURATION_SECONDS);

    setSendingResult(false);
    setResultSent(false);
    setSendError("");

    setQuestions([]);
  };

  const goToFirstBlank = () => {
    const idx = questions.findIndex((q) => selectedAnswers[q.id] === undefined);
    if (idx >= 0) setCurrentQuestion(idx);
    setConfirmFinishOpen(false);
  };

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (!examStarted || showResults) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, showResults]);

  useEffect(() => {
    if (!examStarted || showResults) return;
    if (timeLeft === 0) {
      finalizeNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, examStarted, showResults]);

  // =========================
  // RENDER: pantalla inicio
  // =========================
  if (!examStarted) {
    const subjectHasQuestions = (availableCounts[selectedSubject] || 0) > 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Simulador de Exámenes</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Duración: <span className="font-semibold">60 minutos</span>. No se muestran soluciones hasta el final.
          </p>

          <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre o apodo</label>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Ej: Antonio, Maria..."
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura</label>
<select
  value={selectedSubject}
  onChange={(e) => setSelectedSubject(e.target.value)}
  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-white"
>
  {Object.entries(SUBJECTS).map(([key, name]) => (
    <option key={key} value={key}>
      {name} ({availableCounts[key] || 0} preguntas)
    </option>
  ))}
</select>

          {!subjectHasQuestions && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 mb-4">
              Aún no hay preguntas cargadas para <span className="font-semibold">{selectedSubjectName}</span>.
              <br />
              Pásame las preguntas y las metemos igual que hemos hecho con UT1.
            </div>
          )}

          <div className="mb-4 p-4 bg-gray-50 border rounded-lg">
            <div className="font-semibold text-gray-800 mb-2">Modo de corrección</div>

            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={blankCountsAsWrong}
                onChange={(e) => setBlankCountsAsWrong(e.target.checked)}
              />
              Contar preguntas en blanco como fallo (penaliza)
            </label>

            <div className="text-sm text-gray-500 mt-2">
              Si está desactivado, las preguntas en blanco no cuentan como fallo ni penalizan (pero al final igualmente te las
              mostraré para estudiar).
            </div>
          </div>

          {sendError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">{sendError}</div>
          )}

          <button
            onClick={() => {
              if (!studentName.trim()) {
                setSendError("Escribe tu nombre o apodo para empezar.");
                return;
              }
              if (!subjectHasQuestions) {
                setSendError("Esa asignatura aún no tiene preguntas cargadas.");
                return;
              }

              setSendError("");
              setResultSent(false);
              setSendingResult(false);

              setTimeLeft(EXAM_DURATION_SECONDS);
              setSelectedAnswers({});
              setCurrentQuestion(0);
              setShowResults(false);
              setConfirmFinishOpen(false);

              initializeExam(selectedSubject);
              setExamStarted(true);
            }}
            disabled={!subjectHasQuestions}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Empezar examen
          </button>
        </div>
      </div>
    );
  }

  // Guard por si algo raro: si no hay preguntas cargadas, volvemos a inicio
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl">
          <div className="text-xl font-semibold text-gray-800 mb-2">No hay preguntas para esta asignatura</div>
          <div className="text-gray-600 mb-6">Vuelve al inicio y selecciona otra asignatura.</div>
          <button
            onClick={restartExam}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // RENDER: examen
  // =========================
  const question = questions[currentQuestion];
  const isAnswered = selectedAnswers[question.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">{selectedSubjectName}</h1>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-3">
            <span className="text-lg text-gray-600">
              Pregunta {currentQuestion + 1} de {questions.length}
            </span>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm">{studentName}</span>

              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-semibold">{question.unit}</span>

              <span
                className={`px-4 py-2 rounded-full font-bold ${
                  timeLeft <= 5 * 60 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
                title="Tiempo restante"
              >
                ⏱️ {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Respondidas: <span className="font-semibold">{details.answered}</span> · En blanco:{" "}
            <span className="font-semibold">{details.blanks}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{question.question}</h2>

          <div className="space-y-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[question.id] === index;

              let bgColor = "bg-gray-50 hover:bg-gray-100";
              let borderColor = "border-gray-300";

              if (isSelected) {
                bgColor = "bg-indigo-50";
                borderColor = "border-indigo-500";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(question.id, index)}
                  disabled={showResults}
                  className={`w-full p-4 rounded-lg border-2 ${bgColor} ${borderColor} text-left transition-all duration-200 flex items-center justify-between hover:shadow-md`}
                >
                  <span className="text-lg text-gray-800">{option}</span>
                  {isSelected ? <span className="font-bold text-indigo-700">Seleccionada</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4 mb-6">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            ← Anterior
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={tryFinishExam}
              disabled={!isAnswered || showResults}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
              title={!isAnswered ? "Responde la última pregunta para finalizar" : "Finalizar y enviar"}
            >
              Finalizar Examen
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              disabled={currentQuestion === questions.length - 1}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
              Siguiente →
            </button>
          )}
        </div>

        {/* MODAL CONFIRMACIÓN SI HAY BLANCOS */}
        {confirmFinishOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Tienes preguntas en blanco</h3>
              <p className="text-gray-700 mb-4">
                Te quedan <span className="font-semibold">{details.blanks}</span> pregunta(s) sin responder. ¿Quieres terminar
                igualmente?
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={goToFirstBlank}
                  className="flex-1 px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Volver y responder
                </button>

                <button
                  onClick={finalizeNow}
                  className="flex-1 px-5 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Continuar y finalizar
                </button>

                <button
                  onClick={() => setConfirmFinishOpen(false)}
                  className="flex-1 px-5 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>

              <div className="text-sm text-gray-500 mt-3">
                Nota: aunque “en blanco no penalice”, al final te mostraremos esas preguntas para que las estudies.
              </div>
            </div>
          </div>
        )}

        {/* RESULTS + LISTA DE FALLOS/BLANCOS */}
        {showResults && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Resultados del Examen</h2>

            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${details.grade10 >= 5 ? "text-green-600" : "text-red-600"}`}>
                {details.grade10}/10
              </div>

              <div className="text-xl text-gray-700">
                Aciertos: {details.correct} · Fallos: {details.wrong} · Blancos: {details.blanks}
              </div>

              <div className="mt-2 text-gray-600">
                Penalización: -{details.penaltyQuestions} aciertos · Aciertos netos: {details.netCorrect} · ({details.percentage}%)
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Asignatura: {selectedSubjectName} · Modo: {blankCountsAsWrong ? "Blancos penalizan" : "Blancos NO penalizan"} ·
                Tiempo usado: {formatTime(EXAM_DURATION_SECONDS - timeLeft)} / 60:00
              </div>

              <div className="mt-2 text-sm text-gray-500">Alumno: {studentName}</div>
            </div>

            {/* Estado envío automático */}
            <div className="mt-4">
              {sendingResult && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">Enviando resultado...</div>
              )}
              {resultSent && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">✅ Resultado enviado</div>
              )}
              {sendError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{sendError}</div>}
            </div>

            {/* LISTA: SOLO FALLADAS O NO RESPONDIDAS */}
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Tus fallos y preguntas en blanco</h3>

              {mistakesAndBlanks.length === 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  ✅ ¡Perfecto! No has fallado ninguna y no has dejado ninguna en blanco.
                </div>
              ) : (
                <div className="space-y-4">
                  {mistakesAndBlanks.map((q) => {
                    const yourText = q.chosen === undefined ? "No respondida" : q.options[q.chosen];
                    const correctText = q.options[q.correct];

                    return (
                      <div key={q.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold text-gray-800">
                            {q.id}. {q.question}
                          </div>

                          {q.isBlank ? (
                            <span className="text-yellow-700 font-bold">BLANCO</span>
                          ) : (
                            <span className="text-red-700 font-bold">✗</span>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                          Asignatura: {selectedSubjectName} · Unidad: {q.unit}
                        </div>

                        <div className="mt-3 text-gray-700 space-y-1">
                          <div>
                            <span className="font-semibold">Tu respuesta: </span>
                            {yourText}
                          </div>
                          <div>
                            <span className="font-semibold">Correcta: </span>
                            {correctText}
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-white border rounded-lg text-gray-700">
                          <span className="font-semibold">Explicación: </span>
                          {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={restartExam}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSimulator;
