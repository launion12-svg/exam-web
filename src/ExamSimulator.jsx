import React, { useEffect, useMemo, useState } from "react";
import { RotateCcw, BookOpen } from "lucide-react";

const EXAM_DURATION_SECONDS = 60 * 60; // 60 minutos

const SUBJECTS = {
  ISO: "Implantación de Sistemas Operativos",
  REDES: "Planificación y Administración de Redes",
  IPE1: "Itinerario Personal para la Empleabilidad I",
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
    const counts = { ISO: 0, REDES: 0, IPE1: 0 };
    allQuestions.forEach((q) => {
      if (counts[q.subject] !== undefined) counts[q.subject] += 1;
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
            placeholder="Ej: Sergio, LaUnion12..."
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
          />

          <label className="block text-sm font-semibold text-gray-700 mb-2">Asignatura</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-white"
          >
            <option value="ISO">{SUBJECTS.ISO} ({availableCounts.ISO} preguntas)</option>
            <option value="REDES">{SUBJECTS.REDES} ({availableCounts.REDES} preguntas)</option>
            <option value="IPE1">{SUBJECTS.IPE1} ({availableCounts.IPE1} preguntas)</option>
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
