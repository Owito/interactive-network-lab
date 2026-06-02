import ipaddr from 'ipaddr.js'

// ─── Validación ─────────────────────────────────────────────────────────────

/**
 * Valida si una cadena es una dirección IPv4 válida.
 * @param {string} ip
 * @returns {boolean}
 */
export function isValidIP(ip) {
  try {
    const parsed = ipaddr.parse(ip)
    return parsed.kind() === 'ipv4'
  } catch {
    return false
  }
}

/**
 * Valida si un CIDR es válido (1–30).
 * @param {number} cidr
 * @returns {boolean}
 */
export function isValidCIDR(cidr) {
  const n = Number(cidr)
  return Number.isInteger(n) && n >= 1 && n <= 30
}

// ─── Conversión binaria ──────────────────────────────────────────────────────

/**
 * Convierte una dirección IP a un array de 32 bits (0s y 1s).
 * @param {string} ip
 * @returns {number[]} Array de 32 elementos
 */
export function toBinary32(ip) {
  const parsed = ipaddr.parse(ip)
  const octets = parsed.octets
  const bits = []
  for (const octet of octets) {
    for (let i = 7; i >= 0; i--) {
      bits.push((octet >> i) & 1)
    }
  }
  return bits
}

/**
 * Convierte un CIDR a un array de 32 bits de máscara.
 * @param {number} cidr
 * @returns {number[]}
 */
export function getMaskBinary(cidr) {
  const bits = []
  for (let i = 0; i < 32; i++) {
    bits.push(i < cidr ? 1 : 0)
  }
  return bits
}

/**
 * Convierte un array de 32 bits a notación decimal punteada.
 * @param {number[]} bits
 * @returns {string}
 */
export function bitsToIP(bits) {
  const octets = []
  for (let i = 0; i < 4; i++) {
    let val = 0
    for (let j = 0; j < 8; j++) {
      val = (val << 1) | bits[i * 8 + j]
    }
    octets.push(val)
  }
  return octets.join('.')
}

/**
 * Convierte una IP a su valor numérico de 32 bits (entero sin signo).
 * @param {string} ip
 * @returns {number}
 */
export function ipToInt(ip) {
  const parsed = ipaddr.parse(ip)
  return parsed.octets.reduce((acc, octet) => (acc << 8) | octet, 0) >>> 0
}

/**
 * Convierte un entero de 32 bits a notación IP decimal punteada.
 * @param {number} int
 * @returns {string}
 */
export function intToIP(int) {
  const n = int >>> 0
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.')
}

// ─── Cálculos de subred ──────────────────────────────────────────────────────

/**
 * Calcula la máscara de subred en notación decimal a partir de un CIDR.
 * @param {number} cidr
 * @returns {string} e.g. "255.255.255.0"
 */
export function cidrToMask(cidr) {
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0
  return intToIP(maskInt)
}

/**
 * Calcula la dirección de red (AND bit a bit entre IP y máscara).
 * @param {string} ip
 * @param {number} cidr
 * @returns {string}
 */
export function getNetworkAddress(ip, cidr) {
  const ipInt = ipToInt(ip)
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0
  return intToIP((ipInt & maskInt) >>> 0)
}

/**
 * Calcula la dirección de broadcast.
 * @param {string} networkAddr
 * @param {number} cidr
 * @returns {string}
 */
export function getBroadcast(networkAddr, cidr) {
  const netInt = ipToInt(networkAddr)
  const hostBits = 32 - cidr
  const broadcastInt = (netInt | ((1 << hostBits) - 1)) >>> 0
  return intToIP(broadcastInt)
}

/**
 * Calcula el rango de hosts usables.
 * @param {string} networkAddr
 * @param {number} cidr
 * @returns {{ firstHost: string, lastHost: string, totalHosts: number }}
 */
export function getHostRange(networkAddr, cidr) {
  const netInt = ipToInt(networkAddr)
  const hostBits = 32 - cidr
  const totalAddresses = Math.pow(2, hostBits)

  if (totalAddresses <= 2) {
    return {
      firstHost: networkAddr,
      lastHost: intToIP((netInt + 1) >>> 0),
      totalHosts: 0,
    }
  }

  return {
    firstHost: intToIP((netInt + 1) >>> 0),
    lastHost: intToIP((netInt + totalAddresses - 2) >>> 0),
    totalHosts: totalAddresses - 2,
  }
}

/**
 * Calcula todos los datos de una subred a partir de una IP y CIDR.
 * @param {string} ip
 * @param {number} cidr
 * @returns {object}
 */
export function calcSubnet(ip, cidr) {
  if (!isValidIP(ip) || !isValidCIDR(cidr)) return null

  const networkAddr = getNetworkAddress(ip, cidr)
  const broadcast = getBroadcast(networkAddr, cidr)
  const { firstHost, lastHost, totalHosts } = getHostRange(networkAddr, cidr)
  const mask = cidrToMask(cidr)

  return {
    ip,
    cidr,
    mask,
    networkAddress: networkAddr,
    broadcast,
    firstHost,
    lastHost,
    totalHosts,
    ipBits: toBinary32(ip),
    maskBits: getMaskBinary(cidr),
    networkBits: toBinary32(networkAddr),
  }
}

// ─── Motor VLSM ─────────────────────────────────────────────────────────────

/**
 * Calcula el prefijo mínimo necesario para alojar N hosts.
 * @param {number} hosts Número de hosts requeridos
 * @returns {number} Prefijo CIDR
 */
export function hostsToPrefix(hosts) {
  if (hosts <= 0) return 30
  const hostBits = Math.ceil(Math.log2(hosts + 2))
  const prefix = 32 - hostBits
  return Math.max(1, Math.min(30, prefix))
}

/**
 * Motor VLSM: asigna subredes optimizadas a partir de un bloque base.
 * Ordena automáticamente de mayor a menor número de hosts requeridos.
 *
 * @param {string} baseIP   Dirección de red del bloque padre
 * @param {number} baseCIDR CIDR del bloque padre
 * @param {{ name: string, hosts: number }[]} requirements Lista de requerimientos
 * @returns {{ subnets: object[], error: string|null }}
 */
export function calcVLSM(baseIP, baseCIDR, requirements) {
  if (!isValidIP(baseIP) || !isValidCIDR(baseCIDR)) {
    return { subnets: [], error: 'Dirección base o CIDR inválidos.' }
  }
  if (!requirements || requirements.length === 0) {
    return { subnets: [], error: 'Ingresa al menos una subred.' }
  }

  // Verificar que todos los requerimientos son válidos
  for (const req of requirements) {
    if (!req.hosts || req.hosts < 1) {
      return { subnets: [], error: `La subred "${req.name}" debe tener al menos 1 host.` }
    }
  }

  // Ordenar de mayor a menor
  const sorted = [...requirements]
    .map((r, idx) => ({ ...r, originalIndex: idx }))
    .sort((a, b) => b.hosts - a.hosts)

  const networkAddr = getNetworkAddress(baseIP, baseCIDR)
  const baseInt = ipToInt(networkAddr)
  const baseEnd = ipToInt(getBroadcast(networkAddr, baseCIDR))

  let currentInt = baseInt
  const subnets = []

  for (const req of sorted) {
    const prefix = hostsToPrefix(req.hosts)
    const blockSize = Math.pow(2, 32 - prefix)

    // Alinear al bloque
    if (currentInt % blockSize !== 0) {
      currentInt = Math.ceil(currentInt / blockSize) * blockSize
    }

    const subnetEnd = (currentInt + blockSize - 1) >>> 0

    if (subnetEnd > baseEnd) {
      return {
        subnets: [],
        error: `El espacio del bloque padre (/${baseCIDR}) es insuficiente para alojar todas las subredes.`,
      }
    }

    const subnetIP = intToIP(currentInt >>> 0)
    const broadcast = intToIP(subnetEnd)
    const { firstHost, lastHost, totalHosts } = getHostRange(subnetIP, prefix)

    subnets.push({
      name: req.name,
      hostsRequired: req.hosts,
      ip: subnetIP,
      cidr: prefix,
      mask: cidrToMask(prefix),
      networkAddress: subnetIP,
      broadcast,
      firstHost,
      lastHost,
      totalHosts,
      ipBits: toBinary32(subnetIP),
      maskBits: getMaskBinary(prefix),
      networkBits: toBinary32(subnetIP),
    })

    currentInt = (subnetEnd + 1) >>> 0
  }

  // Calcular espacio utilizado
  const totalUsed = subnets.reduce((acc, s) => acc + Math.pow(2, 32 - s.cidr), 0)
  const totalAvailable = Math.pow(2, 32 - baseCIDR)
  const usedPercent = Math.round((totalUsed / totalAvailable) * 100)

  return { subnets, error: null, totalUsed, totalAvailable, usedPercent }
}

// ─── Explicación paso a paso ─────────────────────────────────────────────────

/**
 * Genera los pasos de explicación del cálculo de una subred.
 * @param {object} subnet Resultado de calcSubnet()
 * @returns {object[]} Array de pasos { titulo, lineas[] }
 */
export function generateExplanation(subnet) {
  if (!subnet) return []

  const { ip, cidr, mask, networkAddress, broadcast, firstHost, lastHost, totalHosts } = subnet

  const ipBin = toBinary32(ip)
  const maskBin = getMaskBinary(cidr)
  const netBin = toBinary32(networkAddress)

  const formatBinIP = (bits) =>
    [0, 8, 16, 24].map((start) => bits.slice(start, start + 8).join('')).join('.')

  const andLines = [
    `  IP:    ${formatBinIP(ipBin)}   →  ${ip}`,
    `  Más.:  ${formatBinIP(maskBin)}   →  ${mask}`,
    `         ${'─'.repeat(35)}`,
    `  AND:   ${formatBinIP(netBin)}   →  ${networkAddress}`,
  ]

  return [
    {
      titulo: 'Paso 1 — Conversión a binario',
      lineas: [
        `Dirección IP:   ${ip}`,
        `Representación: ${formatBinIP(ipBin)}`,
        '',
        `Máscara /${cidr}: ${mask}`,
        `Representación: ${formatBinIP(maskBin)}`,
      ],
    },
    {
      titulo: 'Paso 2 — Operación AND (bit a bit)',
      lineas: [
        'La AND de cada bit de la IP con la máscara da la Dirección de Red:',
        '',
        ...andLines,
      ],
    },
    {
      titulo: 'Paso 3 — Dirección de Red',
      lineas: [
        `${networkAddress}/${cidr}`,
        `Binario: ${formatBinIP(netBin)}`,
        `Los primeros ${cidr} bits identifican la red.`,
        `Los últimos ${32 - cidr} bits son el espacio de hosts.`,
      ],
    },
    {
      titulo: 'Paso 4 — Broadcast',
      lineas: [
        `${broadcast}`,
        `Es la dirección de red con todos los bits de host en 1.`,
        `Binario: ${formatBinIP(toBinary32(broadcast))}`,
      ],
    },
    {
      titulo: 'Paso 5 — Rango de hosts usables',
      lineas: [
        `Primer host: ${firstHost}`,
        `Último host: ${lastHost}`,
        `Total de hosts usables: ${totalHosts.toLocaleString('es')}`,
        `(2^${32 - cidr} − 2 = ${totalHosts.toLocaleString('es')})`,
      ],
    },
  ]
}
