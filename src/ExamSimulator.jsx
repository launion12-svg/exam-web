import React, { useEffect, useMemo, useState } from "react";
import { RotateCcw, BookOpen } from "lucide-react";

const EXAM_DURATION_SECONDS = 60 * 60; // 60 minutos

const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

// ===== Helpers UT =====
const parseUnitNumber = (unitStr) => {
  const n = Number(String(unitStr || "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const groupByUnit = (pool) => {
  const map = new Map();
  for (const q of pool) {
    const u = parseUnitNumber(q.unit);
    if (!u) continue;
    if (!map.has(u)) map.set(u, []);
    map.get(u).push(q);
  }
  return map;
};

const pickWeightedByUnit = (pool, total = 30, curve = 1.6) => {
  const byUnit = groupByUnit(pool);
  const units = Array.from(byUnit.keys()).sort((a, b) => a - b);
  if (units.length === 0) return [];

  const maxUnit = Math.max(...units);
  const weights = units.map((u) => Math.pow(u / maxUnit, curve));
  const sumW = weights.reduce((a, b) => a + b, 0);

  const raw = units.map((u, idx) => {
    const exact = (total * weights[idx]) / sumW;
    return { unit: u, exact, base: Math.floor(exact), frac: exact - Math.floor(exact) };
  });

  let assigned = raw.reduce((a, x) => a + x.base, 0);
  let remaining = total - assigned;

  raw.sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < raw.length && remaining > 0; i++) {
    raw[i].base += 1;
    remaining -= 1;
  }

  raw.sort((a, b) => a.unit - b.unit);

  let shortfall = 0;
  for (const r of raw) {
    const avail = byUnit.get(r.unit).length;
    if (r.base > avail) {
      shortfall += (r.base - avail);
      r.base = avail;
    }
  }

  if (shortfall > 0) {
    const candidates = [...raw].sort((a, b) => b.unit - a.unit);
    while (shortfall > 0) {
      let placed = false;
      for (const r of candidates) {
        const avail = byUnit.get(r.unit).length;
        if (r.base < avail) {
          r.base += 1;
          shortfall -= 1;
          placed = true;
          if (shortfall === 0) break;
        }
      }
      if (!placed) break;
    }
  }

  const picked = [];
  for (const r of raw) {
    const qs = shuffleArray(byUnit.get(r.unit));
    picked.push(...qs.slice(0, r.base));
  }

  return shuffleArray(picked).slice(0, total);
};

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
    /* --- BBDD UT2: DISEÑO CONCEPTO Y MODELO E/R --- */

    {
      id: 235,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué atributo se calcula a partir de otros?",
      options: ["Multivaluado", "Simple", "Derivado", "Compuesto"],
      correct: 2,
      explanation: "Un atributo derivado es aquel cuyo valor no se almacena físicamente, sino que se obtiene mediante un cálculo a partir de otros atributos (como calcular la edad desde la fecha de nacimiento). [cite: 106, 109, 111]",
    },
    {
      id: 236,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué significa transformar una relación 1:N en el modelo relacional?",
      options: [
        "Agregar una clave foránea en la entidad del lado N",
        "Dividir en varias tablas",
        "Crear un índice cruzado",
        "Eliminar la relación"
      ],
      correct: 0,
      explanation: "En una relación uno a muchos (1:N), la clave primaria de la tabla del lado '1' se propaga como clave ajena (FK) a la tabla del lado 'N'. [cite: 112, 113]",
    },
    {
      id: 237,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué modelo se usa para representar datos sin considerar un SGBD concreto?",
      options: ["Modelo lógico", "Modelo conceptual", "Modelo físico", "Modelo externo"],
      correct: 1,
      explanation: "El modelo conceptual representa la estructura de la información de forma abstracta e independiente de la tecnología o el software que se usará. [cite: 117, 119, 122]",
    },
    {
      id: 238,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué indica la cardinalidad 1:N?",
      options: [
        "Varias entidades se relacionan con varias",
        "Una instancia de una entidad se relaciona con muchas de otra",
        "Ambas entidades tienen una sola instancia",
        "Ninguna relación posible"
      ],
      correct: 1,
      explanation: "La cardinalidad 1:N indica que una ocurrencia de la entidad A puede estar relacionada con varias ocurrencias de la entidad B. [cite: 123, 125]",
    },
    {
      id: 239,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué notación utiliza óvalos, rectángulos y rombos?",
      options: ["Notación Crow's Foot", "Notación UML", "Notación Chen", "Notación EBNF"],
      correct: 2,
      explanation: "La notación de Peter Chen es el estándar clásico para diagramas E/R, usando rectángulos para entidades, rombos para relaciones y óvalos para atributos. [cite: 128, 131]",
    },
    {
      id: 240,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Cuál es el objetivo principal del modelado de datos?",
      options: [
        "Organizar los datos de forma lógica y eficiente",
        "Implementar la base de datos en el sistema",
        "Realizar copias de seguridad de los datos",
        "Crear índices en tablas complejas"
      ],
      correct: 0,
      explanation: "El modelado busca crear una representación lógica y estructurada que refleje fielmente los requisitos de información del negocio. [cite: 133, 134]",
    },
    {
      id: 241,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué tipo de atributo puede dividirse en subatributos?",
      options: ["Derivado", "Multivaluado", "Simple", "Compuesto"],
      correct: 3,
      explanation: "Un atributo compuesto es aquel que tiene una estructura propia y puede descomponerse en partes más simples (como la dirección en calle, número y CP). [cite: 138, 142]",
    },
    {
      id: 242,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué se evita aplicando normalización?",
      options: ["Creación de vistas", "Errores de sintaxis SQL", "Relaciones reflexivas", "Redundancia de datos"],
      correct: 3,
      explanation: "La normalización es un proceso de refinamiento que busca eliminar la duplicidad de datos y las anomalías en las operaciones de inserción y borrado. [cite: 143, 147]",
    },
    {
      id: 243,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué tipo de relación vincula a una entidad consigo misma?",
      options: ["Ternaria", "Exclusiva", "Reflexiva", "Paralela"],
      correct: 2,
      explanation: "Una relación reflexiva (o recursiva) ocurre cuando una entidad se relaciona con sus propias instancias (ejemplo: un Empleado supervisa a otros Empleados). [cite: 148, 151]",
    },
    {
      id: 244,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué forma normal elimina las dependencias parciales?",
      options: ["2FN", "BCNF", "3FN", "1FN"],
      correct: 0,
      explanation: "La Segunda Forma Normal (2FN) asegura que todos los atributos que no forman parte de la clave dependan de la clave primaria completa. [cite: 153, 154, 160]",
    },
    {
      id: 245,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué representa una clave primaria?",
      options: [
        "Un campo opcional",
        "Identificador único de cada fila en una tabla",
        "Relación entre tablas",
        "Un tipo de dato de texto largo"
      ],
      correct: 1,
      explanation: "La clave primaria (PK) es un campo o conjunto de campos que identifica de forma única y obligatoria a cada registro de la tabla. [cite: 161, 163]",
    },
    {
      id: 246,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué es una dependencia funcional?",
      options: [
        "Una entidad depende de otra",
        "Un atributo depende del valor de otro",
        "Una relación con cardinalidad 1:1",
        "Una clave ajena que apunta a otra tabla"
      ],
      correct: 1,
      explanation: "Existe una dependencia funcional cuando el valor de un atributo determina de forma única el valor de otro atributo. [cite: 166, 168]",
    },
    {
      id: 247,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué ocurre si no se define bien una clave foránea?",
      options: [
        "Puede romperse la integridad referencial",
        "Se generan índices duplicados",
        "Se bloquea la base de datos",
        "No se puede usar SQL"
      ],
      correct: 0,
      explanation: "Las claves foráneas (FK) son las encargadas de mantener la integridad referencial, asegurando que las relaciones entre tablas sean consistentes. [cite: 171, 172]",
    },
    {
      id: 248,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué tipo de especialización permite que una instancia pertenezca a varios subtipos?",
      options: ["Total", "Parcial", "Solapada", "Exclusiva"],
      correct: 2,
      explanation: "En una especialización solapada, una ocurrencia de la superentidad puede ser al mismo tiempo miembro de dos o más subentidades. [cite: 176, 179]",
    },
    {
      id: 249,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué herramienta formaliza jerarquías entre entidades?",
      options: ["Modelo físico", "Modelo relacional", "Modelo E/R ampliado", "Modelo dimensional"],
      correct: 2,
      explanation: "El modelo Entidad-Relación extendido o ampliado añade conceptos como la herencia, generalización y especialización al modelo básico. [cite: 181, 184]",
    },
    {
      id: 250,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué se crea al convertir una relación N:M en el modelo relacional?",
      options: ["Una vista", "Una clave primaria", "Un atributo derivado", "Una tabla intermedia"],
      correct: 3,
      explanation: "Las relaciones muchos a muchos no pueden representarse directamente y requieren la creación de una tabla de unión o intermedia. [cite: 186, 190, 191]",
    },
    {
      id: 251,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Cuál es el resultado de aplicar la 1FN?",
      options: [
        "Separación de dependencias transitivas",
        "Creación de claves artificiales",
        "Eliminación de atributos multivaluados y compuestos",
        "Separación en tablas jerárquicas"
      ],
      correct: 2,
      explanation: "La Primera Forma Normal (1FN) prohíbe los atributos con múltiples valores en una sola celda, garantizando la atomicidad de los datos. [cite: 192, 195, 197]",
    },
    {
      id: 252,
      subject: "BBDD",
      unit: "UT2",
      question: "¿Qué herramienta se utiliza para representar gráficamente entidades y relaciones?",
      options: ["Esquema XML", "Modelo físico", "Mapa de red", "Diagrama Entidad-Relación"],
      correct: 3,
      explanation: "El diagrama E/R es la representación visual del modelo conceptual, fundamental para el diseño inicial de cualquier base de datos. [cite: 198, 202]",
    },
    /* --- BBDD UT3: DISEÑO FÍSICO Y LENGUAJE DDL --- */

    {
      id: 253,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de clave identifica unívocamente cada fila?",
      options: ["UNIQUE", "PRIMARY KEY", "FOREIGN KEY", "INDEX"],
      correct: 1,
      explanation: "La PRIMARY KEY (Clave Primaria) es el identificador único y obligatorio de cada registro en una tabla[cite: 204, 206].",
    },
    {
      id: 254,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué restricción permite establecer un valor por defecto?",
      options: ["UNIQUE", "CHECK", "DEFAULT", "NOT NULL"],
      correct: 2,
      explanation: "La restricción DEFAULT asigna automáticamente un valor predefinido a una columna si no se especifica uno al insertar el dato[cite: 209, 212].",
    },
    {
      id: 255,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué comando se usa para seleccionar una base de datos?",
      options: ["USE", "CHOOSE", "OPEN", "SELECT DATABASE"],
      correct: 0,
      explanation: "El comando USE seguido del nombre de la base de datos establece el esquema sobre el cual se ejecutarán las consultas posteriores[cite: 214, 215].",
    },
    {
      id: 256,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué sentencia permite eliminar una base de datos?",
      options: ["REMOVE DATABASE", "DROP DATABASE", "ERASE DATABASE", "DELETE DATABASE"],
      correct: 1,
      explanation: "DROP DATABASE es la instrucción DDL utilizada para borrar permanentemente una base de datos y todo su contenido[cite: 219, 221].",
    },
    {
      id: 257,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de índice asegura que los valores no se repitan?",
      options: ["DEFAULT", "CHECK", "FOREIGN", "UNIQUE"],
      correct: 3,
      explanation: "La restricción UNIQUE garantiza que todos los valores de una columna sean distintos entre sí, evitando duplicados[cite: 224, 228].",
    },
    {
      id: 258,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de dato se usa para almacenar fechas?",
      options: ["VARCHAR", "DATE", "CHAR", "TEXT"],
      correct: 1,
      explanation: "El tipo de dato DATE está optimizado para almacenar fechas en formato AAAA-MM-DD en la mayoría de SGBD[cite: 229, 231].",
    },
    {
      id: 259,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Cuál de las siguientes no es una sentencia DDL?",
      options: ["ALTER", "CREATE", "SELECT", "DROP"],
      correct: 2,
      explanation: "SELECT es una sentencia de consulta (DQL), mientras que CREATE, ALTER y DROP definen o modifican la estructura (DDL)[cite: 234, 240].",
    },
    {
      id: 260,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Cuál es una herramienta de consola para trabajar con MySQL?",
      options: ["Workbench", "Cliente de línea de comandos", "SQL Studio", "Shell Admin"],
      correct: 1,
      explanation: "El cliente de línea de comandos (mysql CLI) permite interactuar directamente con el motor de base de datos mediante terminal[cite: 241, 243].",
    },
    {
      id: 261,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué comando sirve para ver las bases de datos existentes?",
      options: ["LIST DATABASES", "SHOW DATABASES", "SHOW DB", "DISPLAY DB"],
      correct: 1,
      explanation: "SHOW DATABASES lista todas las bases de datos a las que el usuario actual tiene permisos de acceso en el servidor[cite: 246, 248].",
    },
    {
      id: 262,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de índice permite acelerar búsquedas?",
      options: ["CONSTRAINT", "TABLE", "VIEW", "INDEX"],
      correct: 3,
      explanation: "Un INDEX es una estructura de datos que mejora significativamente la velocidad de recuperación de registros en una tabla[cite: 251, 255].",
    },
    {
      id: 263,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Cuál de los siguientes es un tipo de dato para texto de longitud variable?",
      options: ["STRING", "TEXT", "VARCHAR", "CHAR"],
      correct: 2,
      explanation: "VARCHAR permite almacenar cadenas de caracteres ajustando el espacio utilizado a la longitud real del texto[cite: 256, 259, 261].",
    },
    {
      id: 264,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Cuál es la mejor práctica al nombrar campos en SQL?",
      options: ["Incluir caracteres especiales", "Escribir en mayúsculas", "Utilizar nombres genéricos", "Usar nombres claros y sin espacios"],
      correct: 3,
      explanation: "Se recomienda el uso de nombres descriptivos sin espacios ni caracteres especiales para evitar errores de sintaxis y facilitar el mantenimiento[cite: 262, 266].",
    },
    {
      id: 265,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué instrucción se usa para crear una base de datos en SQL?",
      options: ["NEW DATABASE", "MAKE DATABASE", "INIT DATABASE", "CREATE DATABASE"],
      correct: 3,
      explanation: "La sentencia estándar de SQL para generar una nueva base de datos es CREATE DATABASE[cite: 267, 271].",
    },
    {
      id: 266,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de integridad controla los valores permitidos en una columna?",
      options: ["Integridad externa", "Integridad referencial", "Integridad de dominio", "Integridad compuesta"],
      correct: 2,
      explanation: "La integridad de dominio asegura que los valores de una columna pertenezcan a un conjunto válido de datos (tipos, rangos, formatos)[cite: 271, 274].",
    },
    {
      id: 267,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué sentencia permite modificar la estructura de una tabla?",
      options: ["ALTER TABLE", "MODIFY TABLE", "CHANGE TABLE", "UPDATE STRUCTURE"],
      correct: 0,
      explanation: "ALTER TABLE permite añadir, eliminar o modificar columnas y restricciones en una tabla ya existente[cite: 276, 277].",
    },
    {
      id: 268,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Cuál de las siguientes herramientas es una interfaz gráfica para MySQL?",
      options: ["AdminTools", "phpMyAdmin Console", "Oracle CLI", "MySQL Workbench"],
      correct: 3,
      explanation: "MySQL Workbench es la herramienta visual oficial para el diseño, desarrollo y administración de bases de datos MySQL[cite: 281, 285].",
    },
    {
      id: 269,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué comando permite crear una tabla nueva?",
      options: ["BUILD TABLE", "INIT TABLE", "NEW TABLE", "CREATE TABLE"],
      correct: 3,
      explanation: "CREATE TABLE define la estructura de una nueva tabla, especificando columnas, tipos de datos y restricciones[cite: 286, 290].",
    },
    {
      id: 270,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de integridad garantiza que cada fila sea única y completa?",
      options: ["Integridad de dominio", "Integridad referencial", "Integridad de entidad", "Integridad lógica"],
      correct: 2,
      explanation: "La integridad de entidad asegura, principalmente mediante la clave primaria, que cada registro sea único y no nulo[cite: 291, 294].",
    },
    {
      id: 271,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Cuál de los siguientes asegura la relación entre tablas?",
      options: ["FOREIGN KEY", "UNIQUE", "DEFAULT", "INDEX"],
      correct: 0,
      explanation: "La FOREIGN KEY (Clave Ajena) establece y valida el vínculo entre los datos de dos tablas distintas[cite: 296, 297].",
    },
    {
      id: 272,
      subject: "BBDD",
      unit: "UT3",
      question: "¿Qué tipo de restricción impide que un campo quede vacío?",
      options: ["UNIQUE", "NOT NULL", "DEFAULT", "PRIMARY"],
      correct: 1,
      explanation: "La restricción NOT NULL obliga a que una columna contenga siempre un valor, prohibiendo el almacenamiento de nulos[cite: 301, 303].",
    },
    /* --- BBDD UT4: CONSULTAS Y MANIPULACIÓN (DML) --- */

    {
      id: 273,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué función convierte texto a mayúsculas en SQL?",
      options: ["CAPITALIZE", "TO_UPPER", "UPPER", "CAPS"],
      correct: 2,
      explanation: "La función UPPER() transforma todos los caracteres de una cadena de texto a sus equivalentes en mayúsculas. [cite: 307, 310]",
    },
    {
      id: 274,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué cláusula se usa para filtrar después de una agregación con GROUP BY?",
      options: ["HAVING", "FILTER", "ORDER BY", "WHERE"],
      correct: 0,
      explanation: "La cláusula HAVING filtra los grupos resultantes tras aplicar funciones de agregación, a diferencia de WHERE que filtra filas individuales. [cite: 312, 313, 317]",
    },
    {
      id: 275,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué función SQL se usa para contar el número de registros de una consulta?",
      options: ["COUNT", "TOTAL", "SUM", "AVG"],
      correct: 0,
      explanation: "La función COUNT() devuelve el número total de filas que coinciden con los criterios de la consulta. [cite: 318, 319]",
    },
    {
      id: 276,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué tipo de subconsulta utiliza columnas de la consulta externa?",
      options: ["Correlacionada", "Autónoma", "Anidada", "Independiente"],
      correct: 0,
      explanation: "Una subconsulta correlacionada es aquella que hace referencia a columnas de la tabla de la consulta principal o externa. [cite: 323, 324]",
    },
    {
      id: 277,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué operador se usa para comprobar si una subconsulta devuelve al menos un resultado?",
      options: ["IN", "CHECK", "ANY", "EXISTS"],
      correct: 3,
      explanation: "El operador EXISTS se utiliza para verificar si una subconsulta produce algún registro, devolviendo verdadero si encuentra al menos uno. [cite: 328, 332]",
    },
    {
      id: 278,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué palabra clave se utiliza para asignar un alias a una columna o tabla?",
      options: ["NAME", "LIKE", "AS", "ALIAS"],
      correct: 2,
      explanation: "La palabra clave AS se emplea para renombrar temporalmente una columna o tabla en los resultados de la consulta. [cite: 333, 336, 338]",
    },
    {
      id: 279,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué operador permite seleccionar registros dentro de un rango de valores?",
      options: ["BETWEEN", "COMPARE", "RANGE", "LIMIT"],
      correct: 0,
      explanation: "El operador BETWEEN selecciona valores dentro de un rango inclusivo (ejemplo: entre 10 y 20). [cite: 339, 340, 344]",
    },
    {
      id: 280,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué cláusula permite aplicar funciones de ventana como AVG sin agrupar?",
      options: ["WINDOW", "RANK", "OVER", "PARTITION"],
      correct: 2,
      explanation: "La cláusula OVER define una ventana de filas para realizar cálculos analíticos sobre un conjunto de resultados sin colapsar las filas. [cite: 345, 348]",
    },
    {
      id: 281,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué palabra clave permite mostrar solo valores únicos en los resultados?",
      options: ["UNIQUE", "ONLY", "SEPARATE", "DISTINCT"],
      correct: 3,
      explanation: "DISTINCT elimina las filas duplicadas del conjunto de resultados de una consulta SELECT. [cite: 350, 354]",
    },
    {
      id: 282,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué operador se usa para comprobar si un valor está incluido en una lista?",
      options: ["IN", "ANY", "BETWEEN", "EXISTS"],
      correct: 0,
      explanation: "El operador IN permite especificar múltiples valores en una cláusula WHERE de forma abreviada. [cite: 355, 356]",
    },
    {
      id: 283,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué palabra clave permite eliminar una vista?",
      options: ["DROP VIEW", "REMOVE VIEW", "ERASE VIEW", "DELETE VIEW"],
      correct: 0,
      explanation: "La sentencia DROP VIEW borra la definición de la vista de la base de datos de forma permanente. [cite: 360, 361]",
    },
    {
      id: 284,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué operador se utiliza para comparar una columna con un patrón de texto?",
      options: ["MATCH", "EQUALS", "LIKE", "INCLUDES"],
      correct: 2,
      explanation: "LIKE se utiliza junto con comodines (como % o _) para buscar patrones específicos en cadenas de caracteres. [cite: 365, 368]",
    },
    {
      id: 285,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué cláusula permite agrupar resultados por valores comunes?",
      options: ["ORDER BY", "GROUP BY", "AS", "SELECT"],
      correct: 1,
      explanation: "GROUP BY agrupa las filas que tienen los mismos valores en columnas específicas para realizar cálculos agregados. [cite: 370, 372]",
    },
    {
      id: 286,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué tipo de JOIN devuelve solo los registros con coincidencias en ambas tablas?",
      options: ["RIGHT JOIN", "LEFT JOIN", "FULL JOIN", "INNER JOIN"],
      correct: 3,
      explanation: "INNER JOIN combina filas de dos tablas basándose en una condición de igualdad común a ambas. [cite: 375, 379]",
    },
    {
      id: 287,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué cláusula SQL se utiliza para filtrar filas según condiciones específicas?",
      options: ["SELECT", "WHERE", "ORDER BY", "HAVING"],
      correct: 1,
      explanation: "La cláusula WHERE se utiliza para extraer solo aquellos registros que cumplen una condición determinada. [cite: 380, 382]",
    },
    {
      id: 288,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Cuál es la función que permite calcular el promedio de una columna numérica?",
      options: ["MEAN", "TOTAL", "AVG", "SUM"],
      correct: 2,
      explanation: "La función AVG() calcula y devuelve el valor medio aritmético de un conjunto de valores numéricos. [cite: 385, 388]",
    },
    {
      id: 289,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué palabra clave se usa para crear una vista en SQL?",
      options: ["MAKE VIEW", "NEW VIEW", "DEFINE VIEW", "CREATE VIEW"],
      correct: 3,
      explanation: "CREATE VIEW crea una tabla virtual basada en el conjunto de resultados de una sentencia SELECT. [cite: 390, 394]",
    },
    {
      id: 290,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué cláusula se emplea para ordenar los resultados de una consulta?",
      options: ["LIMIT", "ORDER BY", "GROUP BY", "HAVING"],
      correct: 1,
      explanation: "ORDER BY se utiliza para clasificar el conjunto de resultados en orden ascendente (ASC) o descendente (DESC). [cite: 395, 397]",
    },
    {
      id: 291,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué tipo de función se aplica a cada fila de forma individual?",
      options: ["Agregada", "Analítica", "Escalar", "Global"],
      correct: 2,
      explanation: "Una función escalar opera sobre un único valor y devuelve un único valor (como convertir a mayúsculas o redondear). [cite: 400, 403]",
    },
    {
      id: 292,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Qué tipo de JOIN incluye todos los registros de la tabla izquierda?",
      options: ["RIGHT JOIN", "CROSS JOIN", "INNER JOIN", "LEFT JOIN"],
      correct: 3,
      explanation: "LEFT JOIN devuelve todas las filas de la tabla de la izquierda y las filas coincidentes de la tabla derecha. [cite: 405, 409]",
    },
    {
      id: 293,
      subject: "BBDD",
      unit: "UT4",
      question: "¿Cuál es la función para sumar los valores de una columna?",
      options: ["SUM", "TOTAL", "ADD", "PLUS"],
      correct: 0,
      explanation: "La función SUM() realiza la suma total de todos los valores numéricos de la columna especificada. [cite: 389]",
    },
    /* --- BBDD UT5: TRANSACCIONES Y CONTROL DE CONCURRENCIA --- */

    {
      id: 294,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Cómo se denomina el fenómeno en el que dos transacciones se bloquean mutuamente?",
      options: ["Inconsistencia", "Interbloqueo (Deadlock)", "Sobrecarga", "Conflicto cruzado"],
      correct: 1,
      explanation: "El interbloqueo o deadlock ocurre cuando dos o más transacciones esperan por recursos bloqueados por la otra, impidiendo que ninguna avance[cite: 411, 413].",
    },
    {
      id: 295,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué nivel de aislamiento evita lecturas sucias, no repetibles y fantasmas?",
      options: ["READ UNCOMMITTED", "REPEATABLE READ", "SERIALIZABLE", "READ COMMITTED"],
      correct: 2,
      explanation: "SERIALIZABLE es el nivel más alto de aislamiento; ejecuta las transacciones de manera que parezca que se realizan una tras otra[cite: 416, 419].",
    },
    {
      id: 296,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué propiedad ACID evita que los cambios de una transacción sean visibles antes de finalizarse?",
      options: ["Consistencia", "Durabilidad", "Atomicidad", "Aislamiento"],
      correct: 3,
      explanation: "El aislamiento garantiza que las operaciones de una transacción sean invisibles para otras hasta que se confirmen los cambios[cite: 421, 425].",
    },
    {
      id: 297,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué sentencia DML permite insertar nuevos registros en una tabla?",
      options: ["DELETE", "SELECT", "UPDATE", "INSERT"],
      correct: 3,
      explanation: "La sentencia INSERT se utiliza para añadir nuevas filas de datos en una tabla existente de la base de datos[cite: 426, 430].",
    },
    {
      id: 298,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué motor de almacenamiento en MySQL soporta transacciones?",
      options: ["InnoDB", "MyISAM", "Aria", "Memory"],
      correct: 0,
      explanation: "InnoDB es el motor de almacenamiento de MySQL que ofrece soporte completo para transacciones ACID y claves foráneas[cite: 431, 432].",
    },
    {
      id: 299,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué comando se usa para revertir una parte concreta de una transacción?",
      options: ["REVERT", "BACK", "ROLLBACK TO SAVEPOINT", "UNDO"],
      correct: 2,
      explanation: "Un SAVEPOINT permite marcar un punto dentro de una transacción al cual se puede volver sin anular toda la operación[cite: 436, 439].",
    },
    {
      id: 300,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué palabra clave se emplea para deshacer una transacción en curso?",
      options: ["UNDO", "ROLLBACK", "CANCEL", "COMMIT"],
      correct: 1,
      explanation: "ROLLBACK es el comando que revierte todos los cambios realizados por la transacción actual que aún no hayan sido confirmados[cite: 441, 443].",
    },
    {
      id: 301,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué palabra clave en SQL se utiliza para confirmar una transacción?",
      options: ["COMMIT", "ROLLBACK", "SAVEPOINT", "START"],
      correct: 0,
      explanation: "COMMIT finaliza la transacción actual y hace que todos los cambios realizados sean permanentes en la base de datos[cite: 446, 447].",
    },
    {
      id: 302,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué tipo de clave relaciona registros entre dos tablas distintas?",
      options: ["Clave primaria", "Clave única", "Clave secundaria", "Clave foránea"],
      correct: 3,
      explanation: "La clave foránea (Foreign Key) establece un vínculo físico entre una columna de una tabla y la clave primaria de otra[cite: 451, 455].",
    },
    {
      id: 303,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué tipo de bloqueo impide cualquier otra lectura o escritura en el dato bloqueado?",
      options: ["Compartido", "Relacional", "Exclusivo", "Condicional"],
      correct: 2,
      explanation: "Un bloqueo exclusivo (X) asegura que ninguna otra transacción pueda leer ni modificar el recurso hasta que se libere[cite: 456, 459].",
    },
    {
      id: 304,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué comando inicia una transacción en SQL?",
      options: ["BEGIN", "INIT", "OPEN", "START SESSION"],
      correct: 0,
      explanation: "BEGIN (o START TRANSACTION) marca el punto de inicio de una unidad de trabajo lógica en la base de datos[cite: 461, 462].",
    },
    {
      id: 305,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué propiedad ACID asegura que la base de datos pase de un estado válido a otro también válido?",
      options: ["Aislamiento", "Durabilidad", "Atomicidad", "Consistencia"],
      correct: 3,
      explanation: "La consistencia garantiza que cualquier transacción lleve a la base de datos de un estado íntegro a otro igualmente íntegro[cite: 466, 470].",
    },
    {
      id: 306,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Cuál es el comando SQL para modificar registros existentes?",
      options: ["DELETE", "INSERT", "ALTER", "UPDATE"],
      correct: 3,
      explanation: "La sentencia UPDATE permite cambiar los valores de una o más columnas de los registros que cumplan una condición[cite: 471, 475].",
    },
    {
      id: 307,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué comando impide temporalmente el acceso a una tabla por parte de otras transacciones?",
      options: ["RESTRICT", "ISOLATE", "DENY", "LOCK TABLE"],
      correct: 3,
      explanation: "LOCK TABLE permite a una transacción obtener un control explícito sobre el acceso a una tabla completa[cite: 476, 480].",
    },
    {
      id: 308,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué cláusula SQL define el comportamiento al eliminar registros relacionados con una clave foránea?",
      options: ["ON ROLLBACK", "ON DELETE", "ON SELECT", "ON INSERT"],
      correct: 1,
      explanation: "La cláusula ON DELETE especifica qué acción tomar (como CASCADE o SET NULL) cuando se borra el registro padre[cite: 481, 483].",
    },
    {
      id: 309,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Cuál es la propiedad ACID que garantiza que una transacción se ejecuta completamente o no se ejecuta?",
      options: ["Aislamiento", "Consistencia", "Durabilidad", "Atomicidad"],
      correct: 3,
      explanation: "La atomicidad trata la transacción como una unidad indivisible; si falla una parte, no se aplica nada[cite: 486, 490].",
    },
    {
      id: 310,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué tipo de bloqueo permite solo lectura simultánea por varias transacciones?",
      options: ["General", "Exclusivo", "Compartido", "Temporal"],
      correct: 2,
      explanation: "Un bloqueo compartido (S) permite que varias transacciones lean un recurso pero impide que ninguna lo modifique[cite: 491, 494].",
    },
    {
      id: 311,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué tipo de problema ocurre cuando una transacción lee datos no confirmados por otra?",
      options: ["Lectura retrasada", "Lectura sucia", "Lectura comprometida", "Lectura fantasma"],
      correct: 1,
      explanation: "La lectura sucia (dirty read) sucede cuando se accede a datos modificados por una transacción que aún no ha hecho COMMIT[cite: 496, 498].",
    },
    {
      id: 312,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué propiedad ACID garantiza que los cambios confirmados no se pierdan?",
      options: ["Aislamiento", "Durabilidad", "Consistencia", "Integridad"],
      correct: 1,
      explanation: "La durabilidad asegura que, una vez confirmada la transacción, los cambios persistirán incluso en caso de fallo del sistema[cite: 501, 503].",
    },
    {
      id: 313,
      subject: "BBDD",
      unit: "UT5",
      question: "¿Qué sentencia elimina datos de una tabla sin afectar su estructura?",
      options: ["DELETE", "TRUNCATE", "ALTER", "DROP"],
      correct: 0,
      explanation: "Se utiliza DELETE para borrar registros (todos o algunos) manteniendo la estructura de la tabla intacta[cite: 506, 507, 512].",
    },
    /* --- BBDD UT6: ADMINISTRACIÓN, BACKUPS Y SEGURIDAD --- */

    {
      id: 314,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Cuál de los siguientes es un componente necesario en una política de respaldo?",
      options: ["Frecuencia, responsables y procedimientos", "Diagrama E/R y análisis funcional", "Clave foránea y consultas SQL", "Índices, normalización y claves"],
      correct: 0,
      explanation: "Una política de respaldo sólida debe definir claramente la frecuencia de las copias, quiénes son los responsables de ejecutarlas y los procedimientos exactos a seguir[cite: 514, 515].",
    },
    {
      id: 315,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Cuál de los siguientes formatos permite representar datos jerárquicos con etiquetas?",
      options: ["TXT", "SQL", "XML", "CSV"],
      correct: 2,
      explanation: "El formato XML utiliza etiquetas personalizadas para estructurar datos de forma jerárquica, facilitando el intercambio de información entre sistemas[cite: 519, 522].",
    },
    {
      id: 316,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué formato se caracteriza por separar datos con comas y tener estructura tabular?",
      options: ["XML", "JSON", "CSV (Comma-Separated Values)", "SQL"],
      correct: 2,
      explanation: "El formato CSV organiza la información en filas y columnas, utilizando comas (o puntos y coma) para delimitar los campos de datos[cite: 524, 527].",
    },
    {
      id: 317,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué principio recomienda tener al menos una copia fuera del entorno habitual?",
      options: ["ACID", "RAID 1", "3-2-1", "Full-Diff"],
      correct: 2,
      explanation: "La estrategia 3-2-1 establece que se deben tener 3 copias de los datos, en 2 soportes distintos y 1 de ellas guardada fuera del sitio principal[cite: 529, 532].",
    },
    {
      id: 318,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Cuál es el objetivo principal de una estrategia de respaldo?",
      options: ["Aumentar el rendimiento de las consultas", "Garantizar la disponibilidad y recuperación de los datos", "Disminuir el tamaño de las bases de datos", "Crear usuarios nuevos"],
      correct: 1,
      explanation: "El fin último de realizar backups es asegurar que los datos puedan recuperarse y estar disponibles en caso de fallo o pérdida[cite: 534, 536].",
    },
    {
      id: 319,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué herramienta permite migrar una base de datos desde Oracle a PostgreSQL?",
      options: ["pgSQL Viewer", "pgLoader", "Workbench", "SSMA"],
      correct: 1,
      explanation: "pgLoader es una herramienta especializada en la migración de datos hacia PostgreSQL desde diversos motores como MySQL u Oracle[cite: 539, 541].",
    },
    {
      id: 320,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué herramienta permite automatizar copias de seguridad mediante programación en Linux?",
      options: ["taskmgr", "rsyncgui", "cron", "phpBackup"],
      correct: 2,
      explanation: "En entornos Linux, el servicio cron se utiliza para programar la ejecución automática de scripts o comandos en momentos específicos[cite: 544, 547].",
    },
    {
      id: 321,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué concepto define la cantidad máxima de datos que pueden perderse tras un fallo?",
      options: ["RTO", "ROI", "PITR", "RPO"],
      correct: 3,
      explanation: "El RPO (Recovery Point Objective) mide el volumen de datos que una organización está dispuesta a perder, definido por el tiempo entre el último backup y el incidente[cite: 549, 553].",
    },
    {
      id: 322,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué utilidad permite trabajar con MySQL desde una interfaz web en el navegador?",
      options: ["MySQL Workbench", "SQLite CLI", "SQL Server Agent", "phpMyAdmin"],
      correct: 3,
      explanation: "phpMyAdmin es una herramienta de administración gráfica basada en web que facilita la gestión de bases de datos MySQL/MariaDB[cite: 554, 558].",
    },
    {
      id: 323,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué herramienta permite gestionar conexiones remotas, modelado E/R y backups en MySQL?",
      options: ["SQLiteStudio", "MySQL Workbench", "Oracle VM", "phpMyAdmin"],
      correct: 1,
      explanation: "MySQL Workbench es la suite oficial que integra diseño de modelos, desarrollo SQL y administración avanzada del servidor[cite: 559, 561].",
    },
    {
      id: 324,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué valor mide el tiempo máximo que puede tardarse en restaurar un sistema?",
      options: ["RPO", "RTO", "PITR", "SLA"],
      correct: 1,
      explanation: "El RTO (Recovery Time Objective) es el objetivo de tiempo establecido para que un sistema vuelva a estar operativo tras un fallo[cite: 569, 571].",
    },
    {
      id: 325,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué comando permite recuperar una base de datos desde un archivo .sql en MySQL?",
      options: ["mysql < archivo.sql", "mysqldump < archivo.sql", "pg_restore archivo.sql", "mysqlimport archivo.sql"],
      correct: 0,
      explanation: "Para restaurar un volcado de SQL, se utiliza el cliente de mysql redireccionando el contenido del archivo hacia el servidor[cite: 574, 575].",
    },
    {
      id: 326,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué herramienta permite importar datos a una tabla en MySQL desde un archivo CSV?",
      options: ["restorecli", "mysqlimport", "mysqldump", "sqlimport"],
      correct: 1,
      explanation: "mysqlimport es la utilidad de línea de comandos diseñada para cargar datos de archivos de texto (como CSV) en tablas de MySQL[cite: 579, 581].",
    },
    {
      id: 327,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué extensión suele tener un archivo de copia de seguridad en SQL Server?",
      options: [".dat", ".csv", ".db", ".bak"],
      correct: 3,
      explanation: "En el ecosistema de Microsoft SQL Server, los archivos de respaldo suelen guardarse con la extensión .bak[cite: 584, 588].",
    },
    {
      id: 328,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué tipo de validación consiste en restaurar una copia en un entorno de pruebas?",
      options: ["Comprobación binaria", "Restauración de prueba", "Backup en caliente", "Restauración paralela"],
      correct: 1,
      explanation: "La mejor forma de validar un backup es realizar una restauración de prueba en un entorno aislado para confirmar que los datos son íntegros[cite: 589, 591].",
    },
    {
      id: 329,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué tipo de copia se considera más rápida en tiempo de ejecución y requiere menos espacio?",
      options: ["Copia espejo", "Copia diferencial completa", "Copia completa", "Copia incremental"],
      correct: 3,
      explanation: "La copia incremental solo guarda los datos que han cambiado desde el último backup (de cualquier tipo), siendo la más eficiente en espacio[cite: 594, 598].",
    },
    {
      id: 330,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué tipo de restauración requiere aplicar la copia completa y todas las incrementales?",
      options: ["Restauración diferencial", "Restauración simple", "Restauración parcial", "Restauración incremental"],
      correct: 3,
      explanation: "Para recuperar un sistema basado en backups incrementales, se debe restaurar primero el último backup completo y luego cada incremental en orden[cite: 599, 603].",
    },
    {
      id: 331,
      subject: "BBDD",
      unit: "UT6",
      question: "¿Qué comando se usa para exportar una base de datos completa en MySQL desde terminal?",
      options: ["dumpall", "mysqldump", "pgdump", "mysqlimport"],
      correct: 1,
      explanation: "mysqldump es la herramienta estándar para generar volcados lógicos de bases de datos MySQL en formato SQL[cite: 604, 606].",
    },
    /* --- REDES UT1: MATERIAL OFICIAL CAMPUS --- */

    {
      id: 332,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué dispositivo interconecta distintas redes y gestiona tablas de enrutamiento?",
      options: [
        "Router",
        "Hub",
        "Switch",
        "Firewall"
      ],
      correct: 0,
      explanation: "El Router es el dispositivo de capa 3 encargado de interconectar diferentes redes y dirigir el tráfico entre ellas mediante el uso de tablas de enrutamiento.",
    },
    {
      id: 333,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué capa del modelo OSI se encarga del cifrado y la compresión de datos?",
      options: [
        "Capa de sesión",
        "Capa de aplicación",
        "Capa de transporte",
        "Capa de presentación"
      ],
      correct: 3,
      explanation: "La Capa de presentación (Capa 6) asegura que la información enviada por la capa de aplicación de un sistema pueda ser leída por la capa de aplicación de otro, encargándose del formato, cifrado y compresión de los datos.",
    },
    {
      id: 334,
      subject: "REDES",
      unit: "UT1",
      question: "¿Cuál es la principal utilidad de Wireshark?",
      options: [
        "Asignación de direcciones IP",
        "Creación de VLANs",
        "Captura y análisis de tráfico de red",
        "Filtrado de tráfico perimetral"
      ],
      correct: 2,
      explanation: "Wireshark es un analizador de protocolos de red que permite capturar y examinar el tráfico que circula por una interfaz de red en tiempo real, facilitando la resolución de problemas y el estudio de protocolos.",
    },
    {
      id: 335,
      subject: "REDES",
      unit: "UT1",
      question: "¿Cuál fue la primera red que sentó las bases de Internet?",
      options: [
        "Token Ring",
        "WiFi",
        "ARPANET",
        "Ethernet"
      ],
      correct: 2,
      explanation: "ARPANET fue la red pionera creada por el Departamento de Defensa de EE. UU. en los años 60, siendo la primera en utilizar la conmutación de paquetes, tecnología base de la Internet moderna.",
    },
    {
      id: 336,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué topología fue la primera usada en Ethernet y es vulnerable a fallos en el cable troncal?",
      options: [
        "Estrella",
        "Bus",
        "Anillo",
        "Malla"
      ],
      correct: 1,
      explanation: "La topología en bus utiliza un único cable central (troncal) al que se conectan todos los nodos; si este cable principal se corta o falla, la señal no puede propagarse y toda la red deja de funcionar.",
    },
    {
      id: 337,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué es una red de datos?",
      options: [
        "Un tipo de software de ofimática",
        "Un servidor de bases de datos",
        "Un conjunto de dispositivos interconectados para compartir información",
        "Un sistema de almacenamiento local"
      ],
      correct: 2,
      explanation: "Una red de datos se define como un conjunto de equipos y dispositivos informáticos conectados entre sí mediante medios físicos o inalámbricos para el intercambio de información y recursos.",
    },
    {
      id: 338,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué medio de transmisión inalámbrico requiere visión directa y es vulnerable a obstáculos?",
      options: [
        "Par trenzado",
        "LiFi",
        "Microondas",
        "Fibra óptica"
      ],
      correct: 2,
      explanation: "Las microondas terrestres utilizan antenas parabólicas que deben estar perfectamente alineadas (visión directa); cualquier obstáculo físico como edificios o montañas bloquea la señal.",
    },
    {
      id: 339,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué protocolo garantiza entrega ordenada y fiable de los datos?",
      options: [
        "UDP",
        "ICMP",
        "TCP",
        "HTTP"
      ],
      correct: 2,
      explanation: "TCP (Transmission Control Protocol) es un protocolo orientado a conexión que garantiza que los datos lleguen a su destino sin errores, en el orden correcto y sin duplicados mediante el uso de confirmaciones (ACKs).",
    },
    {
      id: 340,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué comando permite verificar conectividad y latencia entre dos nodos?",
      options: [
        "netstat",
        "ping",
        "arp",
        "traceroute"
      ],
      correct: 1,
      explanation: "El comando ping utiliza el protocolo ICMP para enviar paquetes de solicitud de eco a un destino y medir el tiempo que tarda en recibir la respuesta (latencia), verificando así la conectividad básica.",
    },
    {
      id: 341,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué comando permite ver la ruta que sigue un paquete hasta su destino?",
      options: [
        "arp",
        "ping",
        "dig",
        "traceroute"
      ],
      correct: 3,
      explanation: "El comando traceroute (o tracert en Windows) muestra cada uno de los saltos (routers) por los que pasa un paquete desde el origen hasta el host de destino, informando también del tiempo de respuesta en cada nodo.",
    },
    {
      id: 342,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué dispositivo de red opera en la capa 2 del modelo OSI?",
      options: [
        "Router",
        "Firewall",
        "Switch",
        "Hub"
      ],
      correct: 2,
      explanation: "El Switch es un dispositivo de la capa de Enlace de Datos (Capa 2) que utiliza las direcciones MAC para reenviar tramas de datos únicamente al puerto donde se encuentra el destinatario.",
    },
    {
      id: 343,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué protocolo traduce nombres de dominio en direcciones IP?",
      options: [
        "DNS",
        "SNMP",
        "DHCP",
        "SMTP"
      ],
      correct: 0,
      explanation: "El DNS (Domain Name System) es el protocolo encargado de resolver nombres legibles (como google.com) en las direcciones IP numéricas necesarias para que los equipos se comuniquen entre sí.",
    },
    {
      id: 344,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué medio de transmisión ofrece mayor ancho de banda y resistencia a interferencias?",
      options: [
        "Par trenzado",
        "Coaxial",
        "Microondas",
        "Fibra óptica"
      ],
      correct: 3,
      explanation: "La fibra óptica utiliza pulsos de luz para transmitir datos, lo que le permite alcanzar anchos de banda muy superiores a los medios de cobre y ser totalmente inmune a las interferencias electromagnéticas.",
    },
    {
      id: 345,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué topología de red depende de un nodo central?",
      options: [
        "Estrella",
        "Anillo",
        "Malla",
        "Bus"
      ],
      correct: 0,
      explanation: "En la topología en estrella, todos los dispositivos se conectan individualmente a un nodo central (como un switch o hub), el cual se encarga de gestionar y distribuir el tráfico.",
    },
    {
      id: 346,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué modelo conceptual organiza la comunicación en siete capas?",
      options: [
        "Modelo híbrido",
        "Modelo Ethernet",
        "Modelo OSI",
        "Modelo TCP/IP"
      ],
      correct: 2,
      explanation: "El modelo OSI (Open Systems Interconnection) divide el proceso de comunicación en siete capas bien definidas: Física, Enlace, Red, Transporte, Sesión, Presentación y Aplicación.",
    },
    {
      id: 347,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué protocolo de red se usa para monitorizar dispositivos como routers e impresoras?",
      options: [
        "SNMP",
        "HTTP",
        "SMTP",
        "ARP"
      ],
      correct: 0,
      explanation: "SNMP (Simple Network Management Protocol) permite a los administradores supervisar el estado, el rendimiento y configurar de forma remota diversos dispositivos en la red.",
    },
    {
      id: 348,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué protocolo se utiliza para asignar direcciones IP automáticamente?",
      options: [
        "DNS",
        "FTP",
        "DHCP",
        "ICMP"
      ],
      correct: 2,
      explanation: "El protocolo DHCP (Dynamic Host Configuration Protocol) permite que los dispositivos obtengan automáticamente una dirección IP y otros parámetros de red (como la máscara o la puerta de enlace) al conectarse.",
    },
    {
      id: 349,
      subject: "REDES",
      unit: "UT1",
      question: "¿Qué protocolo es usado para enviar correo electrónico?",
      options: [
        "HTTP",
        "DNS",
        "FTP",
        "SMTP"
      ],
      correct: 3,
      explanation: "El protocolo SMTP (Simple Mail Transfer Protocol) es el estándar utilizado para el intercambio de mensajes de correo electrónico entre servidores y para el envío desde el cliente al servidor.",
    },
    {
      id: 350,
      subject: "REDES",
      unit: "UT1",
      question: "¿Cuál de los siguientes es un ataque de red basado en inundar peticiones para saturar un servicio?",
      options: [
        "ARP Spoofing",
        "DDoS",
        "Phishing",
        "Sniffing"
      ],
      correct: 1,
      explanation: "El ataque DDoS (Distributed Denial of Service) consiste en utilizar una red de equipos infectados para enviar un volumen masivo de tráfico hacia un servidor, agotando sus recursos y dejando el servicio inaccesible para los usuarios legítimos.",
    },
    {
      id: 351,
      subject: "REDES",
      unit: "UT1",
      question: "¿Cuál es la principal diferencia entre IPv4 e IPv6?",
      options: [
        "El número de bits de dirección",
        "La velocidad de transmisión",
        "El tipo de cable usado",
        "El uso de WiFi obligatorio"
      ],
      correct: 0,
      explanation: "IPv4 utiliza direcciones de 32 bits (unos 4.300 millones de direcciones), mientras que IPv6 utiliza 128 bits, permitiendo un espacio de direcciones prácticamente infinito para conectar todos los dispositivos actuales.",
    },
    {
      id: 352,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué modo de autenticación se utiliza en WPA2/WPA3-Enterprise?",
      options: [
        "Contraseña simple",
        "Portal cautivo",
        "802.1X con RADIUS",
        "SSID oculto"
      ],
      correct: 2,
      explanation: "El modo Enterprise utiliza el estándar 802.1X para que cada usuario se autentique con sus propias credenciales contra un servidor central (normalmente RADIUS), a diferencia del modo Personal que usa una clave compartida (PSK).",
    },
    {
      id: 353,
      subject: "REDES",
      unit: "UT2",
      question: "¿Cuál es la longitud máxima de un enlace horizontal de cobre según TIA/EIA-568?",
      options: [
        "150 metros",
        "100 metros",
        "75 metros",
        "50 metros"
      ],
      correct: 1,
      explanation: "El estándar TIA/EIA-568 establece que la distancia máxima para el cableado horizontal es de 100 metros, repartidos normalmente en 90 metros de cable rígido (canal) y un máximo de 10 metros para los latiguillos (patch cords).",
    },
    {
      id: 354,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué dispositivo termina el cableado horizontal en un rack?",
      options: [
        "Patch panel",
        "Switch",
        "Router",
        "Access Point"
      ],
      correct: 0,
      explanation: "El Patch Panel (panel de parcheo) es el elemento pasivo donde terminan los cables rígidos que vienen de las rosetas de las paredes. Permite organizar las conexiones antes de puentearlas hacia los equipos activos como el switch.",
    },
    {
      id: 355,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué medio físico es más adecuado para largas distancias en campus?",
      options: [
        "Fibra multimodo",
        "Par trenzado Cat 5e",
        "Cable coaxial",
        "Fibra monomodo"
      ],
      correct: 3,
      explanation: "La fibra monomodo (Single-mode) tiene un núcleo mucho más delgado que permite que la luz viaje en un solo rayo, eliminando la dispersión y permitiendo alcanzar distancias de kilómetros, ideal para conectar edificios en un campus.",
    },
    {
      id: 356,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué protocolo permite agrupar interfaces en Linux o Windows?",
      options: [
        "FTP",
        "LACP",
        "HTTP",
        "SNMP"
      ],
      correct: 1,
      explanation: "LACP (Link Aggregation Control Protocol) es el estándar (IEEE 802.3ad) que permite agrupar varios puertos físicos en un único enlace lógico para aumentar el ancho de banda y proporcionar tolerancia a fallos.",
    },
    {
      id: 357,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué indica un enlace negociado a 100 Mbps half-duplex en lugar de 1 Gbps full?",
      options: [
        "Velocidad degradada",
        "Configuración correcta",
        "DHCP deshabilitado",
        "IP duplicada"
      ],
      correct: 0,
      explanation: "Un enlace que negocia a 100 Mbps half-duplex cuando debería ser Gigabit indica una degradación, causada frecuentemente por un cable de mala calidad (solo 4 hilos en lugar de 8), un puerto dañado o interferencias.",
    },
    {
      id: 358,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué función cumple el NIC Teaming?",
      options: [
        "Mejorar DNS",
        "Reducir latencia",
        "Evitar interferencias",
        "Agregar ancho de banda y redundancia"
      ],
      correct: 3,
      explanation: "El NIC Teaming es una tecnología que permite agrupar varias tarjetas de red físicas (NICs) en un solo equipo para que funcionen como una interfaz lógica única, aumentando el ancho de banda total y ofreciendo tolerancia a fallos si una tarjeta falla.",
    },
    {
      id: 359,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué documento o sistema centraliza información de activos y registros en grandes empresas?",
      options: [
        "DHCP",
        "NAT",
        "VLAN",
        "CMDB"
      ],
      correct: 3,
      explanation: "La CMDB (Configuration Management Database) es una base de datos que contiene toda la información relevante sobre los componentes de hardware y software (activos) de una organización y las relaciones entre ellos.",
    },
    {
      id: 360,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué protocolo evita bucles en redes conmutadas?",
      options: [
        "Spanning Tree Protocol (STP)",
        "DHCP",
        "OSPF",
        "RIP"
      ],
      correct: 0,
      explanation: "STP (Spanning Tree Protocol) detecta la existencia de bucles físicos en la red (redundancia) y bloquea lógicamente los puertos necesarios para mantener una única ruta activa, evitando tormentas de difusión.",
    },
    {
      id: 361,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué comando en Windows muestra la configuración completa de red?",
      options: [
        "nslookup",
        "ipconfig /all",
        "ping",
        "tracert"
      ],
      correct: 1,
      explanation: "El comando 'ipconfig /all' muestra información detallada de todos los adaptadores de red, incluyendo la dirección MAC, servidores DNS, estado del DHCP y el tiempo de concesión de la IP.",
    },
    {
      id: 362,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué protocolo de seguridad inalámbrica se considera más robusto actualmente?",
      options: [
        "WPA2",
        "WPA",
        "WPA3",
        "WEP"
      ],
      correct: 2,
      explanation: "WPA3 es el estándar más reciente y robusto; introduce mejoras críticas como el cifrado individualizado de datos y una mayor protección contra ataques de fuerza bruta (SAE).",
    },
    {
      id: 363,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué herramienta comprueba la resolución de nombres?",
      options: [
        "ethtool",
        "nslookup",
        "ping",
        "ipconfig"
      ],
      correct: 1,
      explanation: "nslookup (Name System Lookup) es una herramienta de línea de comandos utilizada para consultar servidores DNS y verificar que un nombre de dominio se traduce correctamente a una dirección IP.",
    },
    {
      id: 364,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué comando Linux permite añadir una dirección IP?",
      options: [
        "route -n",
        "ip addr add",
        "ifconfig -a",
        "netstat -rn"
      ],
      correct: 1,
      explanation: "El comando 'ip addr add' es parte de la suite iproute2 en Linux y se utiliza para asignar una dirección IP y su máscara a una interfaz de red específica de forma inmediata.",
    },
    {
      id: 365,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué estándar Wi-Fi introdujo el uso de OFDMA?",
      options: [
        "802.11ax (Wi-Fi 6)",
        "802.11n (Wi-Fi 4)",
        "802.11g",
        "802.11ac (Wi-Fi 5)"
      ],
      correct: 0,
      explanation: "El estándar 802.11ax (Wi-Fi 6) introdujo OFDMA, una tecnología que permite dividir los canales en subcanales más pequeños para transmitir datos a múltiples dispositivos simultáneamente, mejorando drásticamente la eficiencia en redes congestionadas.",
    },
    {
      id: 366,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué dirección indica fallo en el servidor DHCP?",
      options: [
        "255.255.255.255",
        "169.254.x.x",
        "127.0.0.1",
        "192.168.0.1"
      ],
      correct: 1,
      explanation: "Cuando un dispositivo no recibe respuesta de un servidor DHCP, se autoasigna una dirección IP en el rango 169.254.0.0/16 mediante un proceso llamado APIPA (Automatic Private IP Addressing).",
    },
    {
      id: 367,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué estándar define el etiquetado en infraestructuras de red?",
      options: [
        "IEEE 802.3",
        "EN 50173",
        "ISO/IEC 11801",
        "TIA/EIA-606-B"
      ],
      correct: 3,
      explanation: "El estándar TIA/EIA-606-B establece las directrices para el etiquetado e identificación de todos los componentes de la infraestructura (cables, armarios, tomas y espacios), facilitando el mantenimiento y la resolución de problemas.",
    },
    {
      id: 368,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué error ocurre al asignar manualmente dos direcciones iguales?",
      options: [
        "Timeout",
        "Fragmentación",
        "Conflicto de IP",
        "Bucle de red"
      ],
      correct: 2,
      explanation: "Un conflicto de IP sucede cuando dos dispositivos en la misma red intentan usar la misma dirección lógica. Esto provoca inestabilidad y pérdida de conectividad en ambos equipos, ya que el router no sabe a cuál enviar los paquetes.",
    },
    {
      id: 369,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué herramienta certifica instalaciones de cobre y fibra?",
      options: [
        "Analizador Wireshark",
        "Multímetro",
        "Probador básico",
        "Certificador Fluke"
      ],
      correct: 3,
      explanation: "Un certificador (como los de la marca Fluke) realiza pruebas exhaustivas siguiendo normativas internacionales para garantizar que el cable cumple con los estándares de velocidad y calidad, generando un informe oficial de validez.",
    },
    {
      id: 370,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué norma internacional regula el cableado estructurado en Europa?",
      options: [
        "ISO/IEC 11801",
        "EN 50173",
        "ANSI/TIA/EIA-568",
        "IEEE 802.11"
      ],
      correct: 1,
      explanation: "La norma EN 50173 es el estándar europeo para el cableado estructurado, basado en la norma internacional ISO/IEC 11801, y define los requisitos de rendimiento para redes en edificios comerciales.",
    },
    {
      id: 371,
      subject: "REDES",
      unit: "UT2",
      question: "¿Qué protocolo asigna direcciones IP dinámicamente?",
      options: [
        "DNS",
        "DHCP",
        "ARP",
        "NAT"
      ],
      correct: 1,
      explanation: "El protocolo DHCP (Dynamic Host Configuration Protocol) es el encargado de asignar de forma automática y dinámica direcciones IP a los clientes de una red, junto con otros parámetros como la máscara y la puerta de enlace.",
    },
    {
      id: 372,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué protocolo de autenticación de usuarios puede usarse en switches?",
      options: [
        "FTP",
        "802.1X",
        "ARP",
        "RIP"
      ],
      correct: 1,
      explanation: "El estándar IEEE 802.1X permite el control de acceso a la red basado en puertos. Cuando un dispositivo se conecta al switch, este solicita credenciales antes de permitir el paso de tráfico de datos.",
    },
    {
      id: 373,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué mejora aporta RSTP frente a STP?",
      options: [
        "Elimina la necesidad de VLANs",
        "Menor tiempo de convergencia",
        "Mayor número de VLANs",
        "Soporte de IPv6"
      ],
      correct: 1,
      explanation: "RSTP (Rapid Spanning Tree Protocol - 802.1w) es una evolución del STP tradicional que reduce drásticamente el tiempo de convergencia (el tiempo que tarda la red en volver a ser estable tras un fallo) de 30-50 segundos a apenas 1 o 2 segundos.",
    },
    {
      id: 374,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué técnica protege el plano de control del switch frente a ataques?",
      options: [
        "EtherChannel",
        "Control Plane Policing (CoPP)",
        "VLANs",
        "ACLs"
      ],
      correct: 1,
      explanation: "Control Plane Policing (CoPP) es una técnica que permite filtrar y limitar el tráfico destinado a la CPU del switch, evitando que ataques de denegación de servicio (DoS) saturen el cerebro del dispositivo.",
    },
    {
      id: 375,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué comando guarda la configuración en memoria de arranque en Cisco?",
      options: [
        "show startup-config",
        "write erase",
        "copy running-config startup-config",
        "reload"
      ],
      correct: 2,
      explanation: "El comando 'copy running-config startup-config' copia la configuración que se está ejecutando en la RAM hacia la memoria NVRAM, asegurando que los cambios se mantengan tras un reinicio.",
    },
    {
      id: 376,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué diferencia principal existe entre un switch gestionable y uno no gestionable?",
      options: [
        "El gestionable no tiene interfaz de administración",
        "El no gestionable soporta VLANs",
        "El no gestionable ofrece CLI",
        "El gestionable permite configurar, monitorizar y aplicar políticas de red"
      ],
      correct: 3,
      explanation: "Un switch gestionable ofrece control total sobre el tráfico a través de una interfaz (CLI o Web), permitiendo crear VLANs, configurar la seguridad de puertos y monitorizar el rendimiento, mientras que el no gestionable es 'Plug-and-Play' sin opciones de configuración.",
    },
    {
      id: 377,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué tecnología permite unir varios enlaces físicos en uno lógico?",
      options: [
        "DHCP Snooping",
        "ARP",
        "RIP",
        "LACP/EtherChannel"
      ],
      correct: 3,
      explanation: "LACP (estándar) o EtherChannel (Cisco) permiten agrupar múltiples enlaces físicos de Ethernet para que funcionen como una única conexión lógica, aumentando el ancho de banda y ofreciendo redundancia.",
    },
    {
      id: 378,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué herramienta permite capturar tráfico mediante un puerto espejo?",
      options: [
        "FTP",
        "SMTP",
        "SPAN",
        "DNS"
      ],
      correct: 2,
      explanation: "SPAN (Switched Port Analyzer), también conocido como Port Mirroring, es una función de los switches que copia el tráfico de uno o varios puertos hacia otro puerto específico para que pueda ser analizado por un sniffer como Wireshark.",
    },
    {
      id: 379,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué significa AAA en administración de red?",
      options: [
        "Acceso Anónimo Autorizado",
        "Ancho de banda, Autonomía y Adaptación",
        "Autenticación, Autorización y Accounting",
        "Administración Avanzada Automática"
      ],
      correct: 2,
      explanation: "El modelo AAA define los tres procesos de seguridad: Autenticación (quién eres), Autorización (qué puedes hacer) y Accounting (qué has hecho, registro de actividad).",
    },
    {
      id: 380,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué protocolo protege contra ataques de ARP spoofing?",
      options: [
        "FTP",
        "RIP",
        "SNMP",
        "Dynamic ARP Inspection (DAI)"
      ],
      correct: 3,
      explanation: "Dynamic ARP Inspection (DAI) es una función de seguridad que valida los paquetes ARP en la red, descartando aquellos que intentan suplantar identidades mediante asociaciones IP-MAC falsas.",
    },
    {
      id: 381,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué comando muestra la tabla de direcciones MAC en un switch Cisco?",
      options: [
        "show ip interface brief",
        "show logging",
        "show mac address-table",
        "show arp"
      ],
      correct: 2,
      explanation: "El comando 'show mac address-table' visualiza la tabla CAM (Content Addressable Memory) del switch, que asocia cada dirección MAC aprendida con su correspondiente puerto físico y VLAN.",
    },
    {
      id: 382,
      subject: "REDES",
      unit: "UT3",
      question: "¿Cuál es el método más seguro de acceso remoto a un switch?",
      options: [
        "SSH",
        "Acceso sin contraseña",
        "HTTP sin cifrar",
        "Telnet"
      ],
      correct: 0,
      explanation: "SSH (Secure Shell) utiliza cifrado para proteger la comunicación entre el administrador y el dispositivo, evitando que las contraseñas o comandos sean interceptados en texto plano.",
    },
    {
      id: 383,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué comando de Cisco muestra la configuración activa en un switch?",
      options: [
        "show startup-config",
        "show version",
        "show running-config",
        "show vlan brief"
      ],
      correct: 2,
      explanation: "El comando 'show running-config' muestra la configuración que reside actualmente en la memoria RAM y que está controlando el funcionamiento del switch en ese instante.",
    },
    {
      id: 384,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué comando muestra el estado de las interfaces en un switch Cisco?",
      options: [
        "show vlan brief",
        "show interfaces status",
        "show memory",
        "show users"
      ],
      correct: 1,
      explanation: "El comando 'show interfaces status' proporciona una tabla resumida que muestra si cada puerto está conectado, su VLAN, el modo de duplicidad (duplex), la velocidad y el tipo de medio.",
    },
    {
      id: 385,
      subject: "REDES",
      unit: "UT3",
      question: "¿Cuál es la finalidad de las VLANs en un switch?",
      options: [
        "Evitar el uso de protocolos",
        "Sustituir al direccionamiento IP",
        "Segmentar lógicamente la red en dominios independientes",
        "Aumentar la velocidad física del puerto"
      ],
      correct: 2,
      explanation: "Las VLANs (Virtual LAN) permiten dividir un switch físico en varias redes lógicas separadas, mejorando la seguridad, el rendimiento y reduciendo el tráfico de difusión (broadcast).",
    },
    {
      id: 386,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué función cumple el Port Security?",
      options: [
        "Permitir más VLANs",
        "Aumentar el ancho de banda",
        "Desactivar el STP",
        "Limitar el número de direcciones MAC por puerto"
      ],
      correct: 3,
      explanation: "Port Security es una característica de los switches que permite restringir la entrada a un puerto específico basándose en las direcciones MAC de los dispositivos, permitiendo solo un número determinado o direcciones específicas.",
    },
    {
      id: 387,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué comando permite verificar el estado del protocolo STP en Cisco?",
      options: [
        "show running-config",
        "show vlan brief",
        "show spanning-tree",
        "show ip route"
      ],
      correct: 2,
      explanation: "El comando 'show spanning-tree' muestra información detallada sobre el estado del protocolo Spanning Tree, incluyendo el Bridge ID, el Root Bridge y el estado de cada puerto (Blocking, Forwarding, etc.).",
    },
    {
      id: 388,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué práctica es fundamental antes de actualizar el firmware de un switch?",
      options: [
        "Deshabilitar todos los puertos",
        "Borrar las VLANs existentes",
        "Realizar copia de seguridad de la configuración",
        "Desactivar el STP"
      ],
      correct: 2,
      explanation: "Realizar un backup de la configuración actual es crítico, ya que una actualización de firmware puede fallar o resetear los parámetros a valores de fábrica, provocando una caída total del servicio si no se puede restaurar.",
    },
    {
      id: 389,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué medida de seguridad bloquea servidores DHCP falsos?",
      options: [
        "DHCP Snooping",
        "QoS",
        "ARP Inspection",
        "NAT"
      ],
      correct: 0,
      explanation: "DHCP Snooping crea un muro de confianza en el switch, permitiendo mensajes DHCP solo desde puertos marcados como 'trust' (donde está el servidor real) y bloqueando intentos desde puertos de usuario.",
    },
    {
      id: 390,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué protocolo se utiliza para monitorizar dispositivos de red?",
      options: [
        "SMTP",
        "SNMP",
        "HTTP",
        "FTP"
      ],
      correct: 1,
      explanation: "SNMP (Simple Network Management Protocol) permite a los administradores de red gestionar el rendimiento de la red, encontrar y resolver problemas, y planificar el crecimiento de la misma mediante la monitorización de dispositivos.",
    },
    {
      id: 391,
      subject: "REDES",
      unit: "UT3",
      question: "¿Qué protocolo evita los bucles en redes de conmutación?",
      options: [
        "STP",
        "RIP",
        "BGP",
        "OSPF"
      ],
      correct: 0,
      explanation: "STP (Spanning Tree Protocol) es el protocolo estándar de Capa 2 diseñado para detectar y prevenir bucles lógicos en topologías de red redundantes, bloqueando puertos de forma selectiva.",
    },
    {
      id: 392,
      subject: "REDES",
      unit: "UT4",
      question: "¿Cuál es la función principal de un router en una red?",
      options: [
        "Proporcionar direcciones IP dinámicas",
        "Conmutación de tramas Ethernet",
        "Proteger contra malware",
        "Encaminamiento de paquetes entre diferentes subredes"
      ],
      correct: 3,
      explanation: "La función principal de un router es interconectar diferentes redes o subredes, determinando la mejor ruta para enviar los paquetes de datos desde su origen hasta su destino final.",
    },
    {
      id: 393,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué comando en Cisco muestra las traducciones NAT activas?",
      options: [
        "show ip nat translations",
        "show running-config",
        "show interfaces brief",
        "show version"
      ],
      correct: 0,
      explanation: "El comando 'show ip nat translations' muestra la tabla dinámica de NAT, donde se puede ver la correspondencia entre las direcciones IP privadas (locales) y las públicas (globales) en tiempo real.",
    },
    {
      id: 394,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué se consulta para verificar conectividad básica en router?",
      options: [
        "clear counters",
        "show version",
        "reload",
        "Comando ping"
      ],
      correct: 3,
      explanation: "El comando ping utiliza el protocolo ICMP para enviar paquetes de eco a una dirección IP de destino y esperar una respuesta, lo que permite verificar si existe conectividad física y lógica entre dos puntos.",
    },
    {
      id: 395,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué elemento define una ruta estática?",
      options: [
        "Dirección MAC",
        "Destino, máscara y nexthop",
        "Versión del firmware",
        "Nombre de interfaz"
      ],
      correct: 1,
      explanation: "Una ruta estática requiere especificar la red de destino, la máscara de subred correspondiente y la dirección IP del siguiente salto (next-hop) o la interfaz de salida.",
    },
    {
      id: 396,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué plano del router se encarga de reenviar paquetes?",
      options: [
        "Plano de seguridad",
        "Plano de datos",
        "Plano de control",
        "Plano de gestión"
      ],
      correct: 1,
      explanation: "El Plano de Datos (Data Plane o Forwarding Plane) es el responsable de mover los paquetes desde la interfaz de entrada a la de salida basándose en la tabla de reenvío.",
    },
    {
      id: 397,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué significa ACL en redes?",
      options: [
        "Active Connection Link",
        "Address Configuration Layer",
        "Administrative Control Level",
        "Access Control List"
      ],
      correct: 3,
      explanation: "Una ACL (Access Control List) es una lista de reglas que permiten o deniegan el paso de tráfico de red basándose en criterios como la dirección IP de origen, destino o el número de puerto.",
    },
    {
      id: 398,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué ventaja ofrece NAT?",
      options: [
        "Permite compartir una IP pública entre varias privadas",
        "Sustituir al routing dinámico",
        "Aumenta el ancho de banda",
        "Mejora la latencia"
      ],
      correct: 0,
      explanation: "La ventaja principal de NAT (Network Address Translation) es el ahorro de direcciones IPv4 públicas, permitiendo que múltiples dispositivos de una red privada salgan a Internet bajo una única dirección pública.",
    },
    {
      id: 399,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué protocolo se usa para monitorizar routers mediante SNMP?",
      options: [
        "Simple Network Management Protocol",
        "Static Network Management Protocol",
        "Secure Network Monitoring Protocol",
        "System Network Management Process"
      ],
      correct: 0,
      explanation: "SNMP (Simple Network Management Protocol) es el estándar de la capa de aplicación utilizado para el intercambio de información de gestión entre dispositivos de red y sistemas de monitorización.",
    },
    {
      id: 400,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué tecnología se puede combinar con ACLs?",
      options: [
        "DHCP",
        "QoS",
        "SMTP",
        "FTP"
      ],
      correct: 1,
      explanation: "Las ACLs se pueden utilizar dentro de políticas de QoS (Quality of Service) para clasificar el tráfico. Una vez identificado el tráfico específico mediante la ACL, el router puede darle prioridad o limitar su ancho de banda.",
    },
    {
      id: 401,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué comando en Cisco muestra los vecinos BGP?",
      options: [
        "show ip bgp summary",
        "show processes cpu",
        "show logging",
        "show ip route"
      ],
      correct: 0,
      explanation: "El comando 'show ip bgp summary' muestra el estado de las conexiones con los vecinos BGP (neighbors), indicando si la sesión está establecida y cuántos prefijos (rutas) se han recibido de cada uno.",
    },
    {
      id: 402,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué plano usa SSH y SNMP?",
      options: [
        "Plano de gestión",
        "Plano físico",
        "Plano de control",
        "Plano de datos"
      ],
      correct: 0,
      explanation: "El Plano de Gestión (Management Plane) se utiliza para el tráfico generado para administrar el dispositivo, incluyendo protocolos de acceso remoto como SSH y protocolos de monitorización como SNMP.",
    },
    {
      id: 403,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué significa CoPP?",
      options: [
        "Control Plane Policing",
        "Configuration of Packet Paths",
        "Core Port Processing",
        "Control of Physical Ports"
      ],
      correct: 0,
      explanation: "CoPP (Control Plane Policing) es una característica de seguridad que permite filtrar y limitar la tasa de tráfico destinado al procesador (plano de control) del router para evitar que sea sobrecargado por tráfico malicioso o excesivo.",
    },
    {
      id: 404,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué comando en Cisco permite ver la tabla de enrutamiento?",
      options: [
        "show interfaces status",
        "ping",
        "show ip route",
        "show version"
      ],
      correct: 2,
      explanation: "El comando 'show ip route' muestra la tabla de enrutamiento IP del router, detallando las redes conocidas, su origen (estático, conectado o protocolo dinámico) y la interfaz de salida.",
    },
    {
      id: 405,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué comando en Linux muestra las rutas activas?",
      options: [
        "ifconfig",
        "ip route show",
        "netstat -an",
        "uname -a"
      ],
      correct: 1,
      explanation: "En sistemas Linux modernos, el comando 'ip route show' (o simplemente 'ip route') es la herramienta estándar para visualizar y gestionar la tabla de enrutamiento IP.",
    },
    {
      id: 406,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué significa PAT?",
      options: [
        "Packet Adjustment Technique",
        "Protocol Allocation Table",
        "Public Address Transfer",
        "Port Address Translation"
      ],
      correct: 3,
      explanation: "PAT (Port Address Translation) es una forma de NAT dinámico que permite mapear múltiples direcciones IP privadas a una sola dirección IP pública utilizando diferentes números de puerto para distinguir cada sesión.",
    },
    {
      id: 407,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué campo se revisa en tabla de rutas para identificar origen?",
      options: [
        "Nombre del usuario",
        "Velocidad del puerto",
        "Código de ruta (C, S, O, B)",
        "Dirección MAC"
      ],
      correct: 2,
      explanation: "Los códigos de ruta al inicio de la tabla (como 'C' para redes conectadas o 'S' para estáticas) indican al administrador cómo ha aprendido el router esa ruta específica.",
    },
    {
      id: 408,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué recurso se debe tener siempre antes de un cambio en router?",
      options: [
        "Usuario root",
        "Nueva licencia",
        "Backup de configuración",
        "Cambio de cableado"
      ],
      correct: 2,
      explanation: "Realizar un backup de la configuración (running-config) permite restaurar el estado operativo del router en caso de que el nuevo cambio provoque fallos o inestabilidad en la red.",
    },
    {
      id: 409,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué técnica asegura un rollback rápido?",
      options: [
        "Reemplazo de hardware",
        "Cambiar firmware",
        "Reiniciar router",
        "Backup de configuración"
      ],
      correct: 3,
      explanation: "Contar con un backup de la configuración actual antes de aplicar cambios permite revertir (rollback) rápidamente el dispositivo a su estado funcional anterior si algo sale mal.",
    },
    {
      id: 410,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué máscara se suele usar en enlaces punto a punto?",
      options: [
        "/30 o /31",
        "/24",
        "/16",
        "/8"
      ],
      correct: 0,
      explanation: "En enlaces punto a punto (donde solo hay dos routers conectados) se usan máscaras /30 para tener 2 IPs útiles, o /31 para ahorrar aún más direcciones según el estándar RFC 3021.",
    },
    {
      id: 411,
      subject: "REDES",
      unit: "UT4",
      question: "¿Qué tipo de NAT traduce una IP privada en una pública fija?",
      options: [
        "NAT64",
        "NAT dinámico",
        "PAT",
        "NAT estático"
      ],
      correct: 3,
      explanation: "El NAT estático realiza un mapeo uno a uno de una dirección IP privada a una dirección IP pública específica y permanente.",
    },
    {
      id: 412,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué comando muestra las VLANs permitidas en un trunk en Cisco?",
      options: [
        "show arp",
        "show interfaces trunk",
        "show ip route",
        "show mac address-table"
      ],
      correct: 1,
      explanation: "El comando 'show interfaces trunk' permite visualizar qué interfaces están actuando como enlaces troncales, el protocolo de encapsulamiento (802.1Q) y la lista de VLANs que tienen permitido el paso por dicho enlace.",
    },
    {
      id: 413,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué VLAN no es recomendable usar como nativa?",
      options: [
        "VLAN 200",
        "VLAN 100",
        "VLAN 10",
        "VLAN 1"
      ],
      correct: 3,
      explanation: "La VLAN 1 es la VLAN nativa por defecto en todos los switches Cisco. Por seguridad, se recomienda cambiarla a una VLAN no utilizada para evitar ataques de salto de VLAN (VLAN Hopping).",
    },
    {
      id: 414,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué interfaz lógica sirve de gateway para una VLAN?",
      options: [
        "VLAN nativa",
        "QinQ",
        "SVI (Switch Virtual Interface)",
        "Puerto trunk"
      ],
      correct: 2,
      explanation: "Una SVI (Switch Virtual Interface) es una interfaz lógica configurada en un switch de Capa 3 que actúa como la puerta de enlace (gateway) predeterminada para todos los dispositivos de esa VLAN específica.",
    },
    {
      id: 415,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué herramienta evita servidores DHCP no autorizados?",
      options: [
        "PortSecurity",
        "NAT",
        "ARP Inspection",
        "DHCP Snooping"
      ],
      correct: 3,
      explanation: "DHCP Snooping es una característica de seguridad de Capa 2 que filtra los mensajes DHCP de servidores no confiables, permitiendo el tráfico solo desde puertos configurados como 'trusted' (donde se encuentra el servidor DHCP legítimo).",
    },
    {
      id: 416,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué es una VLAN?",
      options: [
        "Un protocolo de enrutamiento dinámico",
        "Una red lógica que segmenta un dominio de broadcast",
        "Una interfaz física de red",
        "Un dispositivo de seguridad perimetral"
      ],
      correct: 1,
      explanation: "Una VLAN (Virtual Local Area Network) permite agrupar dispositivos de forma lógica, incluso si están en diferentes switches físicos, creando dominios de difusión (broadcast) separados para mejorar el rendimiento y la seguridad.",
    },
    {
      id: 417,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué es la VLAN nativa?",
      options: [
        "VLAN reservada para VoIP",
        "VLAN dedicada a servidores",
        "VLAN de administración",
        "VLAN a la que van los frames no etiquetados"
      ],
      correct: 3,
      explanation: "La VLAN nativa es aquella cuyas tramas (frames) se envían a través de un enlace troncal (trunk) sin ninguna etiqueta 802.1Q. Por defecto, en equipos Cisco es la VLAN 1.",
    },
    {
      id: 418,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué se requiere para que dos VLANs se comuniquen entre sí?",
      options: [
        "Un trunk abierto",
        "Inter-VLAN routing",
        "DHCP Snooping",
        "QinQ"
      ],
      correct: 1,
      explanation: "El Inter-VLAN routing es el proceso de reenviar tráfico de red de una VLAN a otra. Esto requiere un dispositivo de Capa 3, como un router o un switch multicapa (SVI).",
    },
    {
      id: 419,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué significa QinQ?",
      options: [
        "Protocolo de redundancia",
        "Traducción de direcciones IP",
        "Apilamiento de etiquetas VLAN",
        "Enrutamiento entre VLANs"
      ],
      correct: 2,
      explanation: "QinQ (estándar IEEE 802.1ad) consiste en añadir una segunda etiqueta VLAN (802.1Q) a una trama que ya tiene una, permitiendo que un proveedor de servicios transporte las VLANs de un cliente de forma aislada a través de su propia infraestructura.",
    },
    {
      id: 420,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué se debe probar tras configurar VLANs?",
      options: [
        "Únicamente tablas ARP",
        "Únicamente conectividad",
        "Conectividad, rendimiento y seguridad",
        "Únicamente logs"
      ],
      correct: 2,
      explanation: "Tras configurar VLANs, no basta con que haya 'ping'. Se debe verificar que el rendimiento sea el esperado (sin cuellos de botella en los trunks) y que las políticas de seguridad (aislamiento entre VLANs) se estén cumpliendo correctamente.",
    },
    {
      id: 421,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué protocolo inserta etiquetas para VLANs en tramas Ethernet?",
      options: [
        "RIP",
        "802.1Q",
        "OSPF",
        "BGP"
      ],
      correct: 1,
      explanation: "El estándar IEEE 802.1Q (dot1q) es el protocolo de encapsulamiento que añade una etiqueta de 4 bytes a la trama Ethernet original para identificar a qué VLAN pertenece el tráfico en un enlace troncal.",
    },
    {
      id: 422,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué comando en Cisco permite listar VLANs configuradas?",
      options: [
        "show interfaces status",
        "show vlan brief",
        "show running-config",
        "show ip route"
      ],
      correct: 1,
      explanation: "El comando 'show vlan brief' muestra un resumen de todas las VLANs existentes en el switch, su estado (active/activa) y los puertos asignados a cada una de ellas.",
    },
    {
      id: 423,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué protección evita ARP spoofing?",
      options: [
        "DHCP Snooping",
        "IP Source Guard",
        "Dynamic ARP Inspection (DAI)",
        "VRRP"
      ],
      correct: 2,
      explanation: "Dynamic ARP Inspection (DAI) valida los paquetes ARP en la red. Descarta aquellos que intentan suplantar una identidad comparándolos con una base de datos de confianza (generalmente creada por DHCP Snooping).",
    },
    {
      id: 424,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué tipo de puerto se usa para transportar varias VLANs?",
      options: [
        "Puerto access",
        "Puerto loopback",
        "Puerto de gestión",
        "Puerto trunk"
      ],
      correct: 3,
      explanation: "Un puerto trunk (troncal) permite el paso de tráfico de múltiples VLANs a través de un único enlace físico, utilizando etiquetas (802.1Q) para diferenciar a qué red pertenece cada trama.",
    },
    {
      id: 425,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué método básico permite interconectar VLANs en un router?",
      options: [
        "QinQ",
        "VRRP",
        "NAT overload",
        "Router-on-a-stick"
      ],
      correct: 3,
      explanation: "Router-on-a-stick es una configuración donde un único puerto físico del router se conecta a un switch mediante un enlace troncal, utilizando subinterfaces lógicas para enrutar el tráfico entre las diferentes VLANs.",
    },
    {
      id: 426,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué técnica bloquea IP spoofing en un puerto?",
      options: [
        "DHCP Snooping",
        "IP Source Guard",
        "NAT",
        "DAI"
      ],
      correct: 1,
      explanation: "IP Source Guard (IPSG) es una característica de seguridad que filtra el tráfico basándose en la dirección IP de origen, utilizando la base de datos de DHCP Snooping para evitar que un usuario utilice una IP que no le ha sido asignada.",
    },
    {
      id: 427,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué protocolo permite administrar VLANs de forma centralizada?",
      options: [
        "RIP",
        "STP",
        "VTP (VLAN Trunking Protocol)",
        "OSPF"
      ],
      correct: 2,
      explanation: "VTP (VLAN Trunking Protocol) permite a un administrador de red configurar una VLAN en un switch definido como 'Server' y que esta se propague automáticamente a todos los demás switches del dominio configurados como 'Clients'.",
    },
    {
      id: 428,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué técnica limita direcciones MAC en un puerto?",
      options: [
        "Port Security",
        "IP Source Guard",
        "DHCP Snooping",
        "ARP Inspection"
      ],
      correct: 0,
      explanation: "Port Security permite limitar el número de direcciones MAC que pueden enviar tráfico a través de un puerto del switch y definir qué direcciones específicas están autorizadas, bloqueando el puerto si se detecta una MAC desconocida.",
    },
    {
      id: 429,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué se debe documentar siempre de una VLAN?",
      options: [
        "Solo el rango IP",
        "ID, nombre, propósito y puertos asociados",
        "Únicamente el ID",
        "Solo el switch asignado"
      ],
      correct: 1,
      explanation: "Una documentación completa debe incluir el número de VLAN (ID), un nombre descriptivo, su función dentro de la red (propósito) y qué puertos físicos o subinterfaces están vinculados a ella.",
    },
    {
      id: 430,
      subject: "REDES",
      unit: "UT5",
      question: "¿Cuál es la principal ventaja de usar VLANs?",
      options: [
        "Aumentar la velocidad de los switches",
        "Sustituir los routers en la red",
        "Reducir el tráfico de broadcast y segmentar la red",
        "Eliminar la necesidad de ACLs"
      ],
      correct: 2,
      explanation: "Las VLANs permiten dividir un dominio de broadcast grande en varios más pequeños, lo que reduce la congestión de la red y mejora la seguridad al aislar lógicamente los grupos de usuarios.",
    },
    {
      id: 431,
      subject: "REDES",
      unit: "UT5",
      question: "¿Qué campo identifica una VLAN en una trama 802.1Q?",
      options: [
        "VID (VLAN Identifier)",
        "TTL",
        "Dirección MAC",
        "Dirección IP"
      ],
      correct: 0,
      explanation: "El campo VID (VLAN Identifier) es una parte de 12 bits dentro de la etiqueta 802.1Q que identifica específicamente a qué VLAN (de la 1 a la 4094) pertenece la trama.",
    },
    {
      id: 432,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué protocolo es considerado de estado de enlace?",
      options: [
        "RIPng",
        "RIP",
        "OSPF",
        "RIPv2"
      ],
      correct: 2,
      explanation: "OSPF (Open Shortest Path First) es un protocolo de estado de enlace que construye un mapa completo de la topología de la red (LSDB) para calcular la ruta más corta, a diferencia de los protocolos de vector de distancia.",
    },
    {
      id: 433,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué técnica permite optimizar el uso de direcciones IPv4 mediante máscaras variables?",
      options: [
        "ACL",
        "DNS",
        "VLSM",
        "NAT"
      ],
      correct: 2,
      explanation: "VLSM (Variable Length Subnet Mask) permite dividir un espacio de red en subredes de diferentes tamaños según las necesidades específicas de cada segmento, optimizando así el uso de las direcciones IP disponibles.",
    },
    {
      id: 434,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué ventaja principal ofrece el enrutamiento dinámico frente al estático?",
      options: [
        "Adaptación automática a fallos y cambios de topología",
        "Requiere menos recursos de CPU",
        "Evita el uso de protocolos de red",
        "Siempre es más seguro"
      ],
      correct: 0,
      explanation: "El enrutamiento dinámico permite que los routers intercambien información sobre el estado de la red en tiempo real, recalculando automáticamente nuevas rutas si un enlace falla o si se añade un nuevo segmento.",
    },
    {
      id: 435,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué protocolo utiliza LSAs y LSDB para calcular rutas?",
      options: [
        "BGP",
        "RIP",
        "EIGRP",
        "OSPF"
      ],
      correct: 3,
      explanation: "OSPF utiliza LSAs (Link-State Advertisements) para compartir información sobre enlaces, los cuales se almacenan en la LSDB (Link-State Database) para que cada router pueda calcular el árbol de rutas más cortas.",
    },
    {
      id: 436,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué técnica permite agrupar varias redes en una sola entrada de ruta?",
      options: [
        "CIDR",
        "ARP",
        "NAT",
        "DNS"
      ],
      correct: 0,
      explanation: "CIDR (Classless Inter-Domain Routing) permite la sumatización de rutas (supernetting), agrupando múltiples redes contiguas en una sola entrada de la tabla de enrutamiento para mejorar la eficiencia y reducir el uso de memoria en los routers.",
    },
    {
      id: 437,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué comando permite ver la base de datos de LSAs en Cisco?",
      options: [
        "show version",
        "show ip ospf database",
        "traceroute",
        "show running-config"
      ],
      correct: 1,
      explanation: "El comando 'show ip ospf database' muestra la Link-State Database (LSDB), que contiene todos los anuncios de estado de enlace (LSAs) recibidos de otros routers en el área.",
    },
    {
      id: 438,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué técnica de prevención de bucles se aplica en RIP?",
      options: [
        "Fast Reroute",
        "Áreas stub",
        "DR/BDR",
        "Split horizon"
      ],
      correct: 3,
      explanation: "Split Horizon (Horizonte Dividido) es un mecanismo que impide que un router anuncie una ruta de vuelta por la misma interfaz por la que la aprendió, evitando así bucles de enrutamiento simples.",
    },
    {
      id: 439,
      subject: "REDES",
      unit: "UT6",
      question: "¿Cuál es el valor de distancia administrativa por defecto de OSPF?",
      options: [
        "90",
        "120",
        "110",
        "1"
      ],
      correct: 2,
      explanation: "La Distancia Administrativa (AD) de OSPF es 110 por defecto. Este valor se utiliza para medir la confiabilidad del protocolo; cuanto menor sea el valor, más confiable se considera la ruta.",
    },
    {
      id: 440,
      subject: "REDES",
      unit: "UT6",
      question: "¿Cuál es el límite máximo de saltos en RIP antes de considerar una red inalcanzable?",
      options: [
        "10",
        "5",
        "16",
        "32"
      ],
      correct: 2,
      explanation: "En RIP, una métrica de 16 saltos se considera infinito (red inalcanzable). Esto limita el tamaño de la red a un máximo de 15 routers entre el origen y el destino.",
    },
    {
      id: 441,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué comando en Cisco permite verificar las rutas aprendidas por RIP?",
      options: [
        "ping",
        "show version",
        "show ip route",
        "traceroute"
      ],
      correct: 2,
      explanation: "El comando 'show ip route' muestra la tabla de enrutamiento completa. Las rutas aprendidas a través de RIP aparecerán marcadas con la letra 'R' al principio de la línea.",
    },
    {
      id: 442,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué protocolo permite configurar rutas jerárquicas mediante áreas?",
      options: [
        "RIP",
        "RIPng",
        "ARP",
        "OSPF"
      ],
      correct: 3,
      explanation: "OSPF utiliza el concepto de 'Áreas' para dividir la red. El 'Área 0' (Backbone) interconecta a las demás áreas, lo que permite reducir el tamaño de la base de datos de estado de enlace (LSDB) en cada router y mejorar la escalabilidad.",
    },
    {
      id: 443,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué protocolo de enrutamiento soporta redistribución de rutas externas con LSAs tipo 5?",
      options: [
        "RIPng",
        "RIPv1",
        "OSPF",
        "RIP"
      ],
      correct: 2,
      explanation: "OSPF utiliza LSAs de tipo 5 (External LSA) para anunciar rutas que han sido redistribuidas desde otros protocolos de enrutamiento o rutas estáticas. Estos LSAs son generados por el router ASBR (Autonomous System Boundary Router).",
    },
    {
      id: 444,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué protocolo de enrutamiento utiliza el número de saltos como métrica?",
      options: [
        "EIGRP",
        "BGP",
        "RIP",
        "OSPF"
      ],
      correct: 2,
      explanation: "RIP (Routing Information Protocol) utiliza únicamente el conteo de saltos (hop count) para determinar la mejor ruta hacia un destino, ignorando factores como el ancho de banda o el retardo.",
    },
    {
      id: 445,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué prefijo CIDR ofrece 62 hosts utilizables?",
      options: [
        "/25",
        "/27",
        "/26",
        "/28"
      ],
      correct: 2,
      explanation: "Un prefijo /26 utiliza 6 bits para hosts ($2^6 = 64$). Al restar la dirección de red y la de broadcast ($64 - 2$), obtenemos exactamente 62 direcciones de host utilizables.",
    },
    {
      id: 446,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué herramienta mide convergencia observando pérdida de paquetes y latencia?",
      options: [
        "ftp",
        "ssh",
        "iperf3",
        "dnslookup"
      ],
      correct: 2,
      explanation: "iperf3 es una herramienta de prueba de red que puede generar flujos de tráfico TCP o UDP para medir el ancho de banda, la pérdida de paquetes y la latencia (jitter), permitiendo analizar cómo se recupera la red ante fallos.",
    },
    {
      id: 447,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué comando en Cisco muestra los vecinos OSPF?",
      options: [
        "show ip ospf neighbor",
        "ping",
        "show running-config",
        "show processes"
      ],
      correct: 0,
      explanation: "El comando 'show ip ospf neighbor' permite verificar si un router ha formado una adyacencia con sus vecinos, mostrando el ID del vecino, la prioridad, el estado (como FULL) y la interfaz local utilizada.",
    },
    {
      id: 448,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué área debe existir siempre en un diseño OSPF?",
      options: [
        "Área 2",
        "Área 0 (backbone)",
        "Área 1",
        "Cualquier área"
      ],
      correct: 1,
      explanation: "El Área 0, también conocida como área de backbone, es el núcleo central de una red OSPF. Todas las demás áreas deben estar conectadas física o lógicamente al Área 0 para permitir el intercambio de rutas entre ellas.",
    },
    {
      id: 449,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué valor de distancia administrativa corresponde a RIP?",
      options: [
        "90",
        "110",
        "120",
        "200"
      ],
      correct: 2,
      explanation: "La Distancia Administrativa (AD) de RIP es 120 por defecto. Al ser mayor que la de OSPF (110) o EIGRP (90), el router preferirá las rutas de estos últimos si recibe información sobre la misma red por varios protocolos.",
    },
    {
      id: 450,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué protocolo utiliza el multicast 224.0.0.9 para sus actualizaciones?",
      options: [
        "BGP",
        "RIPng",
        "RIPv2",
        "OSPF"
      ],
      correct: 2,
      explanation: "RIPv2 utiliza la dirección multicast 224.0.0.9 para enviar sus actualizaciones de enrutamiento solo a los routers que ejecutan el mismo protocolo, a diferencia de RIPv1 que usaba broadcast (255.255.255.255).",
    },
    {
      id: 451,
      subject: "REDES",
      unit: "UT6",
      question: "¿Qué concepto define la prioridad de una ruta según el origen de información?",
      options: [
        "Distancia administrativa",
        "Métrica",
        "VLAN ID",
        "Protocolo IP"
      ],
      correct: 0,
      explanation: "La Distancia Administrativa (AD) es el parámetro que utilizan los routers para seleccionar la ruta más fiable cuando hay dos o más rutas diferentes hacia el mismo destino aprendidas por distintos protocolos de enrutamiento.",
    },
    {
      id: 452,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo VPN es más sencillo y eficiente para conexiones remotas?",
      options: [
        "WireGuard",
        "Telnet",
        "ARP",
        "HTTP"
      ],
      correct: 0,
      explanation: "WireGuard es un protocolo VPN moderno que destaca por tener un código mucho más simple y rápido que IPsec u OpenVPN, ofreciendo un alto rendimiento y una configuración más sencilla mediante el intercambio de claves públicas.",
    },
    {
      id: 453,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué comando en Linux prueba el MTU máximo evitando fragmentación?",
      options: [
        "curl",
        "ifconfig",
        "ping -M do -s <size>",
        "traceroute"
      ],
      correct: 2,
      explanation: "El comando 'ping -M do' activa el bit DF (Don't Fragment). Si el tamaño del paquete (-s) supera el MTU de cualquier salto en el camino, el sistema devolverá un error, permitiendo encontrar el tamaño máximo de paquete que la red soporta sin fragmentar.",
    },
    {
      id: 454,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué tipo de arquitectura VPN conecta usuarios individuales a la red corporativa?",
      options: [
        "Multihoming",
        "Site-to-Site",
        "MPLS",
        "Remote Access"
      ],
      correct: 3,
      explanation: "La VPN de acceso remoto (Remote Access) permite que usuarios móviles o teletrabajadores se conecten de forma segura a la red central de la empresa a través de Internet, generalmente mediante un software cliente.",
    },
    {
      id: 455,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué elemento de red se recomienda para segmentar servicios expuestos a Internet?",
      options: [
        "VLAN de usuarios",
        "MPLS",
        "DMZ",
        "Proxy ARP"
      ],
      correct: 2,
      explanation: "Una DMZ (Zona Desmilitarizada) es una red aislada que contiene los servidores que deben ser accesibles desde el exterior (como servidores web). Actúa como un cortafuegos intermedio para proteger la red interna (LAN) en caso de que un servicio expuesto sea comprometido.",
    },
    {
      id: 456,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo de enrutamiento externo se utiliza para multihoming con ISP?",
      options: [
        "EIGRP",
        "OSPF",
        "RIP",
        "BGP"
      ],
      correct: 3,
      explanation: "BGP (Border Gateway Protocol) es el protocolo de pasarela exterior (EGP) utilizado para intercambiar información de rutas entre diferentes Sistemas Autónomos (AS). Es el estándar para gestionar conexiones multihoming con uno o varios proveedores de servicios (ISPs).",
    },
    {
      id: 457,
      subject: "REDES",
      unit: "UT7",
      question: "¿Cuál es la técnica más usada para que múltiples hosts compartan una única IP pública?",
      options: [
        "PAT (Port Address Translation)",
        "ACL",
        "NAT estático",
        "NAT dinámico con pool"
      ],
      correct: 0,
      explanation: "PAT, también conocido como NAT con sobrecarga (Overload), permite que miles de direcciones IP privadas se traduzcan a una única IP pública utilizando diferentes números de puerto para distinguir cada conexión.",
    },
    {
      id: 458,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo inalámbrico ofrece mayor cobertura en entornos metropolitanos?",
      options: [
        "Bluetooth",
        "WiFi",
        "WiMAX",
        "ZigBee"
      ],
      correct: 2,
      explanation: "WiMAX (IEEE 802.16) está diseñado para redes de área metropolitana (MAN), permitiendo coberturas de hasta 50 km y proporcionando acceso de banda ancha inalámbrica en áreas donde el despliegue de cable es costoso.",
    },
    {
      id: 459,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué práctica de seguridad se recomienda para publicar un servidor HTTPS?",
      options: [
        "Usar certificados TLS válidos y WAF",
        "Permitir todo el tráfico entrante",
        "Usar solo NAT dinámico",
        "Desactivar los logs"
      ],
      correct: 0,
      explanation: "Para publicar un servidor HTTPS de forma segura se deben usar certificados TLS para el cifrado y un WAF (Web Application Firewall) para inspeccionar el tráfico y filtrar ataques específicos de capa 7 (como SQLi o XSS).",
    },
    {
      id: 460,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo se utiliza habitualmente para VPN site-to-site con seguridad fuerte?",
      options: [
        "IPsec/IKEv2",
        "FTP",
        "DNS",
        "RIP"
      ],
      correct: 0,
      explanation: "IPsec (Internet Protocol Security) junto con IKEv2 es el estándar para VPNs site-to-site. Proporciona autenticación, integridad y confidencialidad a nivel de red (Capa 3), permitiendo conectar oficinas remotas de forma transparente.",
    },
    {
      id: 461,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo WAN permite QoS garantizado y VRFs?",
      options: [
        "Broadband",
        "Metro Ethernet",
        "LTE",
        "MPLS"
      ],
      correct: 3,
      explanation: "MPLS (Multi-Protocol Label Switching) utiliza etiquetas para conmutar paquetes, lo que permite implementar QoS (Calidad de Servicio) para priorizar tráfico como voz o vídeo, y VRFs (Virtual Routing and Forwarding) para crear múltiples tablas de enrutamiento virtuales en un mismo router físico.",
    },
    {
      id: 462,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué función principal cumple el NAT en redes privadas conectadas a Internet?",
      options: [
        "Gestionar certificados digitales",
        "Sustituir al firewall",
        "Aumentar la velocidad de transmisión",
        "Traducción de direcciones privadas a públicas"
      ],
      correct: 3,
      explanation: "NAT (Network Address Translation) permite que los dispositivos de una red privada con direcciones IP no enrutables en Internet utilicen una o más direcciones IP públicas para comunicarse con el exterior.",
    },
    {
      id: 463,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué tipo de NAT se utiliza para publicar un servidor interno hacia Internet?",
      options: [
        "NAT64",
        "PAT",
        "NAT dinámico",
        "NAT estático"
      ],
      correct: 3,
      explanation: "El NAT estático establece una correspondencia uno a uno y fija entre una dirección IP privada interna y una dirección IP pública, permitiendo que dispositivos externos inicien conexiones hacia un servidor interno de forma predecible.",
    },
    {
      id: 464,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué herramienta correlaciona logs y genera alertas de seguridad?",
      options: [
        "FTP server",
        "SIEM",
        "DNS",
        "SMTP relay"
      ],
      correct: 1,
      explanation: "Un SIEM (Security Information and Event Management) recopila, analiza y correlaciona registros (logs) de diferentes dispositivos de red para detectar patrones sospechosos y generar alertas ante posibles incidentes de seguridad.",
    },
    {
      id: 465,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué tecnología WAN moderna permite orquestar enlaces múltiples por aplicación?",
      options: [
        "Dial-up",
        "Metro Ethernet",
        "MPLS",
        "SDWAN"
      ],
      correct: 3,
      explanation: "SD-WAN (Software-Defined WAN) permite gestionar múltiples conexiones (como fibra, 5G y MPLS) simultáneamente, dirigiendo el tráfico de aplicaciones específicas (como VoIP o SaaS) por el enlace que ofrezca mejor rendimiento en cada momento.",
    },
    {
      id: 466,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo de seguridad se usa junto a certificados y 2FA en VPN remotas?",
      options: [
        "SMTP",
        "OpenVPN",
        "Telnet",
        "HTTP"
      ],
      correct: 1,
      explanation: "OpenVPN es un protocolo de red de código abierto que utiliza la biblioteca OpenSSL para el cifrado. Permite implementar medidas de seguridad robustas como certificados digitales y autenticación de dos factores (2FA).",
    },
    {
      id: 467,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo de seguridad se recomienda para cifrar el tráfico de una web pública?",
      options: [
        "HTTP simple",
        "TLS 1.2/1.3",
        "SNMPv1",
        "FTP"
      ],
      correct: 1,
      explanation: "TLS (Transport Layer Security) en sus versiones 1.2 o 1.3 es el protocolo estándar que proporciona cifrado, integridad y autenticación para el tráfico web (HTTPS), sustituyendo al antiguo y vulnerable SSL.",
    },
    {
      id: 468,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué mecanismo de redundancia usa una IP virtual compartida entre routers?",
      options: [
        "DHCP",
        "VRRP",
        "FTP",
        "NAT"
      ],
      correct: 1,
      explanation: "VRRP (Virtual Router Redundancy Protocol) permite que varios routers compartan una dirección IP virtual (VIP). Si el router principal falla, el secundario asume automáticamente la VIP, manteniendo la conectividad de los usuarios sin cambios de configuración.",
    },
    {
      id: 469,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué comando en Cisco muestra las traducciones NAT activas?",
      options: [
        "show vlan brief",
        "show running-config",
        "show ip nat translations",
        "ping"
      ],
      correct: 2,
      explanation: "El comando 'show ip nat translations' muestra la tabla dinámica donde el router registra qué IP privada y qué puerto se están traduciendo a qué IP pública en un momento determinado.",
    },
    {
      id: 470,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué dispositivo software protege aplicaciones web frente a ataques como SQLi o XSS?",
      options: [
        "DHCP server",
        "Switch L2",
        "WAF",
        "NAT64"
      ],
      correct: 2,
      explanation: "Un WAF (Web Application Firewall) inspecciona el tráfico HTTP/HTTPS a nivel de aplicación, permitiendo filtrar ataques específicos como la inyección SQL (SQLi) o el Cross-Site Scripting (XSS) que los firewalls tradicionales no suelen detectar.",
    },
    {
      id: 471,
      subject: "REDES",
      unit: "UT7",
      question: "¿Qué protocolo de control se usa en Cisco para monitorizar enlaces y activar failover?",
      options: [
        "DNS",
        "IP SLA",
        "FTP",
        "SSH"
      ],
      correct: 1,
      explanation: "IP SLA (Service Level Agreement) de Cisco permite monitorizar de forma activa parámetros como la latencia, el jitter o la pérdida de paquetes. Se suele combinar con 'track' para cambiar automáticamente de ruta (failover) si un enlace deja de cumplir con la calidad mínima.",
    },
    {
      id: 472,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tecnología de memoria ofrece mayor velocidad y menor latencia?",
      options: [
        "DDR3 con 1600 MHz",
        "DDR4 con 2400 MHz",
        "DDR5 con 4800 MHz",
        "SDRAM con 800 MHz"
      ],
      correct: 2,
      explanation: "DDR5 es la generación más reciente de RAM, ofreciendo velocidades desde 4800 MHz y menores latencias que DDR4 y DDR3, además de menor consumo energético."
    },
    {
      id: 473,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué principio explica que los programas acceden repetidamente a datos cercanos en memoria?",
      options: [
        "Principio de caché multinivel",
        "Principio de localidad espacial",
        "Principio de fragmentación",
        "Principio de swap dinámico"
      ],
      correct: 1,
      explanation: "El principio de localidad espacial indica que si se accede a una posición de memoria, es probable acceder a posiciones cercanas, optimizando el uso de caché."
    },
    {
      id: 474,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué técnica de seguridad aleatoriza la ubicación de procesos en memoria?",
      options: [
        "DEP (Data Execution Prevention)",
        "ASLR (Address Space Layout Randomization)",
        "MMU (Memory Management Unit)",
        "TLB (Translation Lookaside Buffer)"
      ],
      correct: 1,
      explanation: "ASLR aleatoriza las direcciones donde se cargan procesos en memoria, dificultando ataques de explotación como buffer overflow al hacer impredecible la ubicación del código."
    },
    {
      id: 475,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué ventaja principal ofrecen los SSD frente a los HDD?",
      options: [
        "Mayor capacidad de almacenamiento por unidad",
        "Menor coste por gigabyte",
        "Velocidades de lectura y escritura superiores",
        "Mayor compatibilidad con sistemas antiguos"
      ],
      correct: 2,
      explanation: "Los SSD basados en memoria flash ofrecen velocidades muy superiores a los HDD mecánicos, además de menor consumo, mayor resistencia a golpes y menor latencia."
    },
    {
      id: 476,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de software incluye compiladores e intérpretes?",
      options: [
        "Software de aplicación",
        "Software de programación",
        "Software de sistema operativo",
        "Software de virtualización"
      ],
      correct: 1,
      explanation: "El software de programación incluye herramientas para crear software: compiladores, intérpretes, IDEs, depuradores y sistemas de control de versiones."
    },
    {
      id: 477,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Cuál es la fase del ciclo funcional donde la CPU transforma datos en información útil?",
      options: [
        "Entrada",
        "Almacenamiento",
        "Procesamiento",
        "Salida"
      ],
      correct: 2,
      explanation: "En la fase de procesamiento, la CPU ejecuta instrucciones y realiza cálculos que transforman los datos brutos en información útil para el usuario."
    },
    {
      id: 478,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de sistemas operativos están optimizados para gestionar múltiples conexiones simultáneas?",
      options: [
        "Sistemas operativos embebidos",
        "Sistemas operativos para servidores",
        "Sistemas operativos móviles",
        "Sistemas operativos de escritorio"
      ],
      correct: 1,
      explanation: "Los sistemas operativos para servidores están diseñados para alta disponibilidad, gestionar múltiples usuarios y conexiones simultáneas, con énfasis en estabilidad y seguridad."
    },
    {
      id: 479,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué licencia de software libre requiere que las modificaciones mantengan la misma licencia?",
      options: [
        "MIT",
        "BSD",
        "GPL (General Public License)",
        "EULA"
      ],
      correct: 2,
      explanation: "La GPL es una licencia copyleft que obliga a que cualquier trabajo derivado mantenga la misma licencia, garantizando que el software siga siendo libre."
    },
    {
      id: 480,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué distribución Linux es conocida por su enfoque en seguridad y pentesting?",
      options: [
        "Ubuntu Server",
        "Debian",
        "Kali Linux",
        "Red Hat Enterprise"
      ],
      correct: 2,
      explanation: "Kali Linux está especializada en ciberseguridad y pentesting, incluyendo cientos de herramientas preinstaladas para análisis de vulnerabilidades y auditorías."
    },
    {
      id: 481,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de hipervisor se ejecuta directamente sobre el hardware?",
      options: [
        "Hipervisor tipo 2 (hosted)",
        "Hipervisor tipo 1 (bare-metal)",
        "Contenedor Docker",
        "Máquina virtual Java"
      ],
      correct: 1,
      explanation: "Los hipervisores tipo 1 o bare-metal se ejecutan directamente sobre el hardware sin necesidad de un sistema operativo anfitrión, ofreciendo mejor rendimiento."
    },
    {
      id: 482,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué permite una snapshot en virtualización?",
      options: [
        "Aumentar la memoria RAM asignada dinámicamente",
        "Capturar el estado completo de una VM para restaurarlo después",
        "Compartir el kernel entre múltiples VMs",
        "Cifrar automáticamente todos los discos virtuales"
      ],
      correct: 1,
      explanation: "Una snapshot captura el estado completo de una máquina virtual en un momento dado, permitiendo volver a ese estado si ocurre algún problema."
    },
    {
      id: 483,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué mecanismo registra actividades de usuarios para detectar incidentes de seguridad?",
      options: [
        "Autenticación biométrica",
        "Control de acceso basado en roles",
        "Auditoría del sistema",
        "Cifrado de contraseñas"
      ],
      correct: 2,
      explanation: "La auditoría del sistema registra eventos y actividades de usuarios, permitiendo detectar comportamientos anómalos, responder a incidentes y cumplir con normativas."
    },
    {
      id: 484,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué técnica en sistemas de archivos registra cambios pendientes para evitar corrupción?",
      options: [
        "Desfragmentación automática",
        "Journaling",
        "Compresión en línea",
        "Indexación de contenido"
      ],
      correct: 1,
      explanation: "El journaling registra las operaciones pendientes antes de ejecutarlas, permitiendo recuperar el sistema de archivos ante fallos o cortes de energía sin perder consistencia."
    },
    {
      id: 485,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué modelo de permisos permite control granular con múltiples usuarios y grupos?",
      options: [
        "Permisos Unix básicos (rwx)",
        "ACL (Access Control Lists)",
        "Permisos solo lectura globales",
        "Cifrado de archivos EFS"
      ],
      correct: 1,
      explanation: "Las ACL permiten definir permisos específicos para múltiples usuarios y grupos en un mismo archivo, ofreciendo mayor granularidad que los permisos Unix tradicionales."
    },
    {
      id: 486,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tecnología permite a los dispositivos transferir datos directamente a memoria sin intervención de la CPU?",
      options: [
        "Interrupciones IRQ",
        "DMA (Direct Memory Access)",
        "Polling continuo",
        "Buffers de E/S"
      ],
      correct: 1,
      explanation: "DMA permite que dispositivos transfieran datos directamente a la memoria RAM sin pasar por la CPU, liberando recursos del procesador y mejorando el rendimiento."
    },
    {
      id: 487,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué función permite la detección e instalación automática de hardware nuevo?",
      options: [
        "BIOS Legacy",
        "Plug and Play",
        "Modo protegido",
        "Arranque seguro"
      ],
      correct: 1,
      explanation: "Plug and Play permite que el sistema operativo detecte automáticamente nuevo hardware conectado e instale los controladores necesarios sin intervención manual."
    },
    {
      id: 488,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿En qué estado se encuentra un proceso que espera un recurso o evento?",
      options: [
        "Estado ejecutando",
        "Estado nuevo",
        "Estado bloqueado",
        "Estado terminado"
      ],
      correct: 2,
      explanation: "Un proceso en estado bloqueado está esperando un evento externo (E/S, recurso ocupado, señal) y no puede ejecutarse hasta que se resuelva la espera."
    },
    {
      id: 489,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué algoritmo de planificación asigna CPU a cada proceso por turnos de tiempo fijo?",
      options: [
        "FIFO (First In, First Out)",
        "Prioridades estáticas",
        "Round Robin",
        "Planificación por plazos"
      ],
      correct: 2,
      explanation: "Round Robin asigna a cada proceso un quantum de tiempo de CPU en turnos circulares, garantizando equidad y evitando que procesos monopolicen el procesador."
    },
    {
      id: 490,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué mecanismo IPC permite compartir una región de memoria entre procesos?",
      options: [
        "Pipes anónimos",
        "Colas de mensajes",
        "Memoria compartida",
        "Sockets de red"
      ],
      correct: 2,
      explanation: "La memoria compartida permite que múltiples procesos accedan a la misma región de memoria, siendo el método IPC más rápido al evitar copias de datos."
    },
    {
      id: 491,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué técnica divide la memoria en bloques de tamaño fijo para facilitar la gestión?",
      options: [
        "Segmentación lógica",
        "Memoria virtual continua",
        "Paginación",
        "Asignación contigua"
      ],
      correct: 2,
      explanation: "La paginación divide la memoria en páginas de tamaño fijo (típicamente 4 KB), facilitando la gestión, reduciendo fragmentación y permitiendo memoria virtual eficiente."
    },
    {
      id: 492,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué shell es ampliamente utilizado en sistemas Linux para administración?",
      options: [
        "PowerShell",
        "Bash",
        "CMD",
        "Zsh avanzado"
      ],
      correct: 1,
      explanation: "Bash (Bourne Again Shell) es el shell más utilizado en sistemas Linux para administración y scripting, ofreciendo potentes herramientas de automatización."
    },
    {
      id: 493,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué servicio permite conexiones remotas seguras a servidores?",
      options: [
        "FTP sin cifrado",
        "Telnet básico",
        "SSH (Secure Shell)",
        "HTTP estándar"
      ],
      correct: 2,
      explanation: "SSH (Secure Shell) es el servicio estándar para conexiones remotas seguras, cifrando toda la comunicación entre cliente y servidor."
    },
    {
      id: 494,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué identificador único tiene cada proceso en el sistema operativo?",
      options: [
        "UID (User Identifier)",
        "GID (Group Identifier)",
        "PID (Process Identifier)",
        "TID (Thread Identifier)"
      ],
      correct: 2,
      explanation: "Cada proceso tiene un PID (Process Identifier) único que permite al sistema operativo identificarlo y gestionarlo durante su ciclo de vida."
    },
    {
      id: 495,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué problema ocurre cuando dos procesos acceden simultáneamente a un recurso compartido sin sincronización?",
      options: [
        "Fragmentación de memoria",
        "Condición de carrera (race condition)",
        "Desbordamiento de pila",
        "Pérdida de paquetes"
      ],
      correct: 1,
      explanation: "Las condiciones de carrera ocurren cuando múltiples procesos acceden simultáneamente a recursos compartidos, produciendo resultados impredecibles sin mecanismos de sincronización."
    },
    {
      id: 496,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué mecanismo de sincronización permite controlar el acceso mutuo a recursos compartidos?",
      options: [
        "Fragmentación externa",
        "Mutex (mutual exclusion)",
        "Paginación por demanda",
        "Cache coherency"
      ],
      correct: 1,
      explanation: "Los mutex (mutual exclusion) son mecanismos que garantizan que solo un proceso acceda a un recurso compartido a la vez, evitando condiciones de carrera."
    },
    {
      id: 497,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿En qué tipo de multitarea los procesos ceden voluntariamente el control de la CPU?",
      options: [
        "Multitarea expropiativa (preemptive)",
        "Multitarea cooperativa",
        "Multitarea por prioridades",
        "Multitarea en tiempo real"
      ],
      correct: 1,
      explanation: "En multitarea cooperativa, los procesos deben ceder voluntariamente el control de la CPU, mientras que en expropiativa el SO puede quitarles el control en cualquier momento."
    },
    {
      id: 498,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué sistema operativo clásico era monotarea y monousuario?",
      options: [
        "Unix System V",
        "Windows NT",
        "MS-DOS",
        "Linux kernel 1.0"
      ],
      correct: 2,
      explanation: "MS-DOS era un sistema operativo monotarea y monousuario, permitiendo ejecutar solo un programa a la vez por un único usuario."
    },
    {
      id: 499,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué técnica permite distribuir tareas entre múltiples núcleos de CPU de forma equilibrada?",
      options: [
        "Paginación por segmentos",
        "SMP (Symmetric Multiprocessing)",
        "Single-threading",
        "Memoria virtual expandida"
      ],
      correct: 1,
      explanation: "SMP (Symmetric Multiprocessing) permite que el sistema operativo distribuya tareas entre múltiples núcleos o CPUs de forma equilibrada, mejorando el rendimiento."
    },
    {
      id: 500,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de sistema operativo está diseñado para dispositivos con recursos limitados y tareas específicas?",
      options: [
        "Sistema operativo de servidor",
        "Sistema operativo embebido",
        "Sistema operativo de escritorio",
        "Sistema operativo distribuido"
      ],
      correct: 1,
      explanation: "Los sistemas operativos embebidos están diseñados para dispositivos específicos con recursos limitados como electrodomésticos, IoT, automoción o sistemas industriales."
    },
    {
      id: 501,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué sistema operativo embebido ofrece garantías de tiempo real?",
      options: [
        "Windows 10 IoT",
        "FreeRTOS",
        "Ubuntu Desktop",
        "macOS Server"
      ],
      correct: 1,
      explanation: "FreeRTOS es un sistema operativo de tiempo real (RTOS) para sistemas embebidos que garantiza tiempos de respuesta deterministas, crítico en aplicaciones industriales."
    },
    {
      id: 502,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de licencia acompaña típicamente al software propietario?",
      options: [
        "GPL (General Public License)",
        "BSD permisiva",
        "EULA (End User License Agreement)",
        "MIT License"
      ],
      correct: 2,
      explanation: "EULA (End User License Agreement) es el contrato típico del software propietario que limita el uso, copia, modificación y distribución del software."
    },
    {
      id: 503,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué sistema operativo era monousuario pero soportaba multitarea limitada?",
      options: [
        "Unix multiusuario",
        "Linux desde origen",
        "Windows 95",
        "Minix académico"
      ],
      correct: 2,
      explanation: "Windows 95 era principalmente monousuario pero introducía multitarea cooperativa limitada, evolucionando hacia sistemas más robustos en versiones posteriores."
    },
    {
      id: 504,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué sistema operativo UNIX propietario fue desarrollado por Sun Microsystems/Oracle?",
      options: [
        "FreeBSD abierto",
        "Solaris comercial",
        "Ubuntu Server",
        "Red Hat Enterprise"
      ],
      correct: 1,
      explanation: "Solaris es un sistema operativo UNIX propietario desarrollado originalmente por Sun Microsystems (ahora Oracle), conocido por su estabilidad y escalabilidad."
    },
    {
      id: 505,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué proyecto busca reimplementar Windows de forma libre y compatible?",
      options: [
        "Wine compatibility layer",
        "ReactOS",
        "FreeDOS",
        "Haiku OS"
      ],
      correct: 1,
      explanation: "ReactOS es un proyecto de código abierto que busca reimplementar Windows de forma libre y compatible, permitiendo ejecutar aplicaciones Windows sin el sistema propietario."
    },
    {
      id: 506,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué licencia libre es más permisiva al no requerir copyleft?",
      options: [
        "GPL v3 estricta",
        "BSD License",
        "LGPL restrictiva",
        "AGPL de red"
      ],
      correct: 1,
      explanation: "Las licencias BSD son más permisivas que GPL porque no requieren copyleft, permitiendo que el código modificado sea redistribuido bajo licencias propietarias."
    },
    {
      id: 507,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de licencia permite integrar código modificado en software propietario?",
      options: [
        "GPL v3 con copyleft",
        "BSD o MIT permisivas",
        "AGPL de red estricta",
        "LGPL con restricciones"
      ],
      correct: 1,
      explanation: "Las licencias BSD y MIT son permisivas y no requieren copyleft, permitiendo que código modificado sea integrado en software propietario sin obligación de liberar las modificaciones."
    },
    {
      id: 508,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué distribución Linux ofrece versiones LTS con soporte extendido?",
      options: [
        "Arch Linux rolling",
        "Ubuntu con LTS",
        "Gentoo desde fuentes",
        "Slackware estable"
      ],
      correct: 1,
      explanation: "Ubuntu ofrece versiones LTS (Long Term Support) con soporte extendido de 5 años, ideales para entornos de producción que requieren estabilidad."
    },
    {
      id: 509,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué distribución Linux es la base de Ubuntu y reconocida por su estabilidad?",
      options: [
        "Fedora comunitaria",
        "Debian estable",
        "openSUSE Leap",
        "CentOS Stream"
      ],
      correct: 1,
      explanation: "Debian es reconocida por su estabilidad y robustez, siendo la base de Ubuntu y muchas otras distribuciones, con ciclo de actualizaciones conservador."
    },
    {
      id: 510,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué distribuciones Linux ofrecen compatibilidad binaria con Red Hat Enterprise Linux?",
      options: [
        "Ubuntu Server y Mint",
        "AlmaLinux y Rocky Linux",
        "Debian y Kali Linux",
        "Arch Linux y Manjaro"
      ],
      correct: 1,
      explanation: "AlmaLinux y Rocky Linux son distribuciones que ofrecen compatibilidad binaria con RHEL, orientadas a servidores empresariales tras los cambios en CentOS."
    },
    {
      id: 511,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué gestor de paquetes utiliza archivos .deb?",
      options: [
        "YUM para RPM",
        "APT para Debian",
        "Pacman para Arch",
        "Zypper para SUSE"
      ],
      correct: 1,
      explanation: "APT (Advanced Package Tool) es el gestor de paquetes usado en Debian y derivadas como Ubuntu, que trabaja con archivos de paquetes .deb."
    },
    {
      id: 512,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tipo de hipervisor se instala directamente sobre el hardware sin SO anfitrión?",
      options: [
        "Tipo 2 hosted",
        "Tipo 1 bare-metal",
        "Emulador de aplicación",
        "Contenedor de procesos"
      ],
      correct: 1,
      explanation: "Los hipervisores Tipo 1 o bare-metal se instalan directamente sobre el hardware sin necesidad de sistema operativo anfitrión, ofreciendo máximo rendimiento."
    },
    {
      id: 513,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Cuál de estos es un hipervisor Tipo 1 bare-metal?",
      options: [
        "VirtualBox sobre Windows",
        "VMware ESXi",
        "VMware Workstation Player",
        "QEMU sobre Linux"
      ],
      correct: 1,
      explanation: "VMware ESXi es un hipervisor Tipo 1 que se instala directamente sobre el hardware, usado en entornos empresariales por su alto rendimiento y seguridad."
    },
    {
      id: 514,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué hipervisor es Tipo 2 y funciona sobre sistemas operativos existentes?",
      options: [
        "Hyper-V Server bare-metal",
        "VirtualBox",
        "Xen Project bare-metal",
        "KVM integrado en kernel"
      ],
      correct: 1,
      explanation: "VirtualBox es un hipervisor Tipo 2 que se instala como aplicación sobre un sistema operativo existente, siendo más fácil de usar pero con menor rendimiento que Tipo 1."
    },
    {
      id: 515,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿En qué tipo de virtualización el SO invitado coopera conscientemente con el hipervisor?",
      options: [
        "Virtualización completa",
        "Paravirtualización",
        "Contenedores nativos",
        "Emulación por software"
      ],
      correct: 1,
      explanation: "En paravirtualización, el sistema operativo invitado es modificado para cooperar con el hipervisor, optimizando el rendimiento al evitar emulación completa del hardware."
    },
    {
      id: 516,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tecnología ejecuta aplicaciones aisladas compartiendo el kernel del host?",
      options: [
        "Máquinas virtuales completas",
        "Contenedores como Docker",
        "Paravirtualización modificada",
        "Virtualización anidada"
      ],
      correct: 1,
      explanation: "Los contenedores como Docker ejecutan aplicaciones en entornos aislados compartiendo el kernel del sistema anfitrión, siendo muy eficientes en recursos pero con menor aislamiento que VMs."
    },
    {
      id: 517,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué herramienta de cifrado de disco completo es nativa en Windows?",
      options: [
        "VeraCrypt multiplataforma",
        "BitLocker de Microsoft",
        "LUKS para Linux",
        "FileVault de macOS"
      ],
      correct: 1,
      explanation: "BitLocker es la tecnología de cifrado de disco completo nativa de Windows, que protege datos cifrando volúmenes completos y puede usar TPM para mayor seguridad."
    },
    {
      id: 518,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué tecnología de cifrado de disco es estándar en sistemas Linux?",
      options: [
        "BitLocker de Windows",
        "LUKS (Linux Unified Key Setup)",
        "FileVault de Apple",
        "EFS de NTFS"
      ],
      correct: 1,
      explanation: "LUKS (Linux Unified Key Setup) es el estándar de facto para cifrado de disco en Linux, proporcionando cifrado transparente de particiones y volúmenes."
    },
    {
      id: 519,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué archivo se usa para instalaciones desatendidas en Windows?",
      options: [
        "kickstart para Red Hat",
        "unattend.xml de Windows",
        "preseed para Debian",
        "cloud-init para nubes"
      ],
      correct: 1,
      explanation: "unattend.xml es el archivo de respuestas usado en Windows para automatizar instalaciones desatendidas, definiendo configuraciones como particionado, idioma y cuentas de usuario."
    },
    {
      id: 520,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué protocolo permite instalar sistemas operativos por red sin medios físicos?",
      options: [
        "FTP para transferencias",
        "PXE (Preboot Execution Environment)",
        "SMB para compartir",
        "HTTP simple"
      ],
      correct: 1,
      explanation: "PXE (Preboot Execution Environment) permite que computadoras arranquen e instalen sistemas operativos directamente desde la red, sin necesidad de medios físicos como USB o DVD."
    },
    {
      id: 521,
      subject: "ISO",
      unit: "UT1",
      source: "new",
      question: "¿Qué protocolo sincroniza el reloj del sistema con servidores de tiempo en red?",
      options: [
        "SNMP para monitoreo",
        "NTP (Network Time Protocol)",
        "DHCP para configuración",
        "DNS para resolución"
      ],
      correct: 1,
      explanation: "NTP (Network Time Protocol) es el protocolo estándar para sincronizar relojes de sistemas informáticos con servidores de tiempo precisos en la red."
    },
  ];

  // =========================
  // UTILIDADES
  // =========================

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
  const [selectedUnit, setSelectedUnit] = useState("all"); // "all" o "UT1", "UT2", etc.

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

  // Obtener UTs disponibles para la asignatura seleccionada
  const getAvailableUnits = (subjectKey) => {
    const pool = allQuestions.filter((q) => q.subject === subjectKey);
    const units = [...new Set(pool.map((q) => q.unit))].sort();
    return units;
  };

  const availableUnits = useMemo(() => getAvailableUnits(selectedSubject), [selectedSubject]);

  // =========================
  // INICIALIZACIÓN (no arranca examen aquí, solo prepara estado)
  // =========================
  useEffect(() => {
    // No hacemos initializeExam aquí, porque depende de la asignatura seleccionada
  }, []);

  const initializeExam = (subjectKey, unitFilter = "all") => {
    let pool = allQuestions.filter((q) => q.subject === subjectKey);
    
    // Si se seleccionó una UT específica, filtrar solo esas preguntas
    if (unitFilter !== "all") {
      pool = pool.filter((q) => q.unit === unitFilter);
    }
    
    const totalQuestions = 30;

    // Llamamos a la función con curva 1.6 (el código que tú pasaste)
    const selected = pickWeightedByUnit(pool, totalQuestions, 1.4);

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
        unitFilter: selectedUnit, // "all" o "UT1", "UT2", etc.
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
  onChange={(e) => {
    setSelectedSubject(e.target.value);
    setSelectedUnit("all"); // Reset unit cuando cambia la asignatura
  }}
  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-white"
>
  {Object.entries(SUBJECTS).map(([key, name]) => (
    <option key={key} value={key}>
      {name} ({availableCounts[key] || 0} preguntas)
    </option>
  ))}
</select>

          <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad Temática</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-white"
          >
            <option value="all">📚 Todas las UTs (Examen completo)</option>
            {availableUnits.map((unit) => {
              const unitQuestions = allQuestions.filter(
                (q) => q.subject === selectedSubject && q.unit === unit
              ).length;
              return (
                <option key={unit} value={unit}>
                  {unit} ({unitQuestions} preguntas)
                </option>
              );
            })}
          </select>

          {selectedUnit !== "all" && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 mb-4 text-sm">
              ℹ️ Has seleccionado <span className="font-semibold">{selectedUnit}</span>. 
              El examen solo incluirá preguntas de esta unidad.
            </div>
          )}

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

              initializeExam(selectedSubject, selectedUnit);
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
                Asignatura: {selectedSubjectName} · 
                {selectedUnit === "all" ? "Todas las UTs" : selectedUnit} · 
                Modo: {blankCountsAsWrong ? "Blancos penalizan" : "Blancos NO penalizan"} ·
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
