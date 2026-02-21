import { revalidateTag } from 'next/cache'

export type TUserDataCacheNamespace =
  | 'accounts'
  | 'credit-cards'
  | 'transactions'

const userDataCacheTagPrefix = 'financeflow'

export const getUserDataCacheTag = (
  namespace: TUserDataCacheNamespace,
  userId: string
) => {
  return `${userDataCacheTagPrefix}:${namespace}:${userId}`
}

export const revalidateUserDataCacheTags = (
  userId: string,
  namespaces: TUserDataCacheNamespace[]
) => {
  namespaces.forEach((namespace) => {
    revalidateTag(getUserDataCacheTag(namespace, userId))
  })
}
