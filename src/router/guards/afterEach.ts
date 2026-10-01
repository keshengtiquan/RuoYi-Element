import type { Router } from 'vue-router'
import { doneProgress } from '@/utils/progress'

export function setupAfterEachGuard(router: Router): void {
  router.afterEach(() => {
    doneProgress()
  })

  router.onError(() => {
    doneProgress()
  })
}
