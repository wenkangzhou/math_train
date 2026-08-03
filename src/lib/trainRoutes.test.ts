import { describe, expect, it } from 'vitest'
import { CARRIAGE_CATALOG } from './carriages'
import { TRAIN_ROUTES, getTrainRoute, routeStampId } from './trainRoutes'

describe('机车任务路线', () => {
  it('每辆收藏机车都有唯一的专属路线和邮票', () => {
    expect(TRAIN_ROUTES).toHaveLength(CARRIAGE_CATALOG.length)
    expect(new Set(TRAIN_ROUTES.map((route) => route.id)).size).toBe(TRAIN_ROUTES.length)
    expect(new Set(TRAIN_ROUTES.map((route) => route.trainId)).size).toBe(TRAIN_ROUTES.length)
    expect(new Set(TRAIN_ROUTES.map((route) => routeStampId(route.id))).size).toBe(TRAIN_ROUTES.length)

    for (const train of CARRIAGE_CATALOG) {
      expect(getTrainRoute(train.id).trainId).toBe(train.id)
    }
  })

  it('未知旧车头会安全回退到默认路线', () => {
    expect(getTrainRoute('removed-train').trainId).toBe('head-classic')
  })

  it('每辆机车都有不同且完整的行驶场景', () => {
    expect(new Set(TRAIN_ROUTES.map((route) => route.scenery.theme)).size)
      .toBe(CARRIAGE_CATALOG.length)
    expect(new Set(TRAIN_ROUTES.map((route) => route.scenery.journeyLabel)).size)
      .toBe(CARRIAGE_CATALOG.length)

    for (const route of TRAIN_ROUTES) {
      expect(route.scenery.waypoints).toHaveLength(3)
      expect(new Set(route.scenery.waypoints.map((waypoint) => waypoint.label)).size).toBe(3)
      for (const waypoint of route.scenery.waypoints) {
        expect(waypoint.landmarkEmoji).toBeTruthy()
        expect(waypoint.decorations).toHaveLength(3)
      }
    }
  })
})
