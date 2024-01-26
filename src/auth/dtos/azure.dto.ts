export interface AzureTokenUserDto {
  aud: string
  iss: string
  iat: number
  nbf: number
  exp: number
  aio: string
  azp: string
  azpacr: string
  roles: AzureTokenUserRolesEnum[]
  name: string
  oid: string
  preferred_username: string
  rh: string
  scp: string
  sub: string
  tid: string
  uti: string
  ver: string
}

export enum AzureTokenUserRolesEnum {
  ADMIN = 'admin',
  READ_WRITE = 'readWrite',
  READ_ONLY = 'readOnly',
  ADMIN_ONLY_CANCEL = 'adminOnlyCancel',
  READ_WRITE_PETRZALKA = 'readWritePetrzalka',
}
