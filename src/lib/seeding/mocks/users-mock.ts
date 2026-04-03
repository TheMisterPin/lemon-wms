import { LoginType, Role } from '@/generated/prisma'
import { generateFakeUsers } from './generators/users'

type SeedUser = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email?: string
  password?: string
  pin?: string
  badgeNumber: string
  role: Role
  loginType: LoginType
}

// ---------------------------------------------------------------------------
// Fixed office + first-warehouse floor users (well-known credentials)
// ---------------------------------------------------------------------------
const NAMED_USERS: SeedUser[] = [
  {
    id: 'USR-0001',
    firstName: 'Luca',
    lastName: 'Ferrari',
    fullName: 'Luca Ferrari',
    email: 'owner@lemon-wms.local',
    password: 'owner1234',
    pin: '0000',
    badgeNumber: 'USR-0001',
    role: Role.OWNER,
    loginType: LoginType.CREDENTIAL,
  },
  {
    id: 'USR-0002',
    firstName: 'Marta',
    lastName: 'Bianchi',
    fullName: 'Marta Bianchi',
    email: 'office.manager@lemon-wms.local',
    password: 'manager1234',
    badgeNumber: 'USR-0002',
    role: Role.OFFICE_MANAGER,
    loginType: LoginType.CREDENTIAL,
  },
  {
    id: 'USR-0003',
    firstName: 'Paolo',
    lastName: 'Ricci',
    fullName: 'Paolo Ricci',
    email: 'office.worker@lemon-wms.local',
    password: 'worker1234',
    badgeNumber: 'USR-0003',
    role: Role.OFFICE_WORKER,
    loginType: LoginType.CREDENTIAL,
  },
  {
    id: 'USR-0004',
    firstName: 'Giulia',
    lastName: 'Conti',
    fullName: 'Giulia Conti',
    pin: '1111',
    badgeNumber: 'USR-0004',
    role: Role.WAREHOUSE_MANAGER,
    loginType: LoginType.BADGE_PIN,
  },
  {
    id: 'USR-0005',
    firstName: 'Marco',
    lastName: 'Romano',
    fullName: 'Marco Romano',
    pin: '2222',
    badgeNumber: 'USR-0005',
    role: Role.WAREHOUSE_WORKER,
    loginType: LoginType.BADGE_PIN,
  },
]

// ---------------------------------------------------------------------------
// Extra floor users for warehouses W01–W10
// 1 WM + 2 WW per warehouse, badge numbers USR-0006 → USR-0035
// ---------------------------------------------------------------------------
const WAREHOUSE_CODES = ['W01','W02','W03','W04','W05','W06','W07','W08','W09','W10']

const FLOOR_NAMES: [string, string][] = [
  ['Sofia',    'Marino'],   // WM W01
  ['Davide',   'Gallo'],    // WW W01-A
  ['Elena',    'Colombo'],  // WW W01-B
  ['Riccardo', 'Bruno'],    // WM W02
  ['Chiara',   'Costa'],    // WW W02-A
  ['Matteo',   'Russo'],    // WW W02-B
  ['Valentina','Esposito'], // WM W03
  ['Simone',   'Vitale'],   // WW W03-A
  ['Francesca','Caruso'],   // WW W03-B
  ['Antonio',  'Greco'],    // WM W04
  ['Laura',    'Giordano'], // WW W04-A
  ['Federico', 'Mancini'],  // WW W04-B
  ['Alessia',  'Lombardi'], // WM W05
  ['Giacomo',  'Moretti'],  // WW W05-A
  ['Martina',  'Barbieri'], // WW W05-B
  ['Salvatore','Fontana'],  // WM W06
  ['Beatrice', 'Rizzo'],    // WW W06-A
  ['Leonardo', 'Santoro'],  // WW W06-B
  ['Giorgia',  'Mariani'],  // WM W07
  ['Emanuele', 'Ferrari'],  // WW W07-A (different from Luca)
  ['Camilla',  'Bianchi'],  // WW W07-B
  ['Lorenzo',  'Galli'],    // WM W08
  ['Giulio',   'Conti'],    // WW W08-A
  ['Silvia',   'De Luca'],  // WW W08-B
  ['Nicola',   'Martini'],  // WM W09
  ['Elisa',    'Pellegrini'],// WW W09-A
  ['Roberto',  'Ferrara'],  // WW W09-B
  ['Paola',    'Fiore'],    // WM W10
  ['Sergio',   'Riva'],     // WW W10-A
  ['Irene',    'Colombo'],  // WW W10-B
]

function buildFloorUsers(): SeedUser[] {
  const result: SeedUser[] = []
  let seq = 6 // starts at USR-0006
  let nameIdx = 0

  for (let wi = 0; wi < WAREHOUSE_CODES.length; wi++) {
    const wCode = WAREHOUSE_CODES[wi]
    const idx   = String(wi + 1).padStart(2, '0')

    const [wmFirst, wmLast] = FLOOR_NAMES[nameIdx++]
    result.push({
      id:          `USR-${String(seq).padStart(4, '0')}`,
      firstName:   wmFirst,
      lastName:    wmLast,
      fullName:    `${wmFirst} ${wmLast}`,
      pin:         `11${idx}`,
      badgeNumber: `USR-${String(seq++).padStart(4, '0')}`,
      role:        Role.WAREHOUSE_MANAGER,
      loginType:   LoginType.BADGE_PIN,
    })

    const [wwaFirst, wwaLast] = FLOOR_NAMES[nameIdx++]
    result.push({
      id:          `USR-${String(seq).padStart(4, '0')}`,
      firstName:   wwaFirst,
      lastName:    wwaLast,
      fullName:    `${wwaFirst} ${wwaLast}`,
      pin:         `22${idx}`,
      badgeNumber: `USR-${String(seq++).padStart(4, '0')}`,
      role:        Role.WAREHOUSE_WORKER,
      loginType:   LoginType.BADGE_PIN,
    })

    const [wwbFirst, wwbLast] = FLOOR_NAMES[nameIdx++]
    result.push({
      id:          `USR-${String(seq).padStart(4, '0')}`,
      firstName:   wwbFirst,
      lastName:    wwbLast,
      fullName:    `${wwbFirst} ${wwbLast}`,
      pin:         `33${idx}`,
      badgeNumber: `USR-${String(seq++).padStart(4, '0')}`,
      role:        Role.WAREHOUSE_WORKER,
      loginType:   LoginType.BADGE_PIN,
    })

    void wCode // used only for context
  }

  return result
}

// ---------------------------------------------------------------------------
// Faker-generated extra staff (office workers, extra managers)
// IDs start at USR-0036 to avoid collision
// ---------------------------------------------------------------------------
const FAKER_OFFSET = 36
const fakerUsers = generateFakeUsers().map((u, i) => ({
  ...u,
  id:          `USR-${String(FAKER_OFFSET + i).padStart(4, '0')}`,
  badgeNumber: `USR-${String(FAKER_OFFSET + i).padStart(4, '0')}`,
}))

export const users: SeedUser[] = [
  ...NAMED_USERS,
  ...buildFloorUsers(),
  ...fakerUsers,
]
