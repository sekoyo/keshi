import { expect, test, beforeAll, afterAll } from 'vitest'
import Keshi from './index'

let keshi: Keshi

beforeAll(() => {
  keshi = new Keshi()
})

afterAll(() => {
  keshi.teardown()
})

test('sync: returns new value if key not in cache', async () => {
  let callCount = 0

  function getValue() {
    callCount++
    return 'freshData'
  }

  // First call -> not in cache, so it calls getValue.
  const result1 = await keshi.resolve('syncKey1', getValue, '1m')
  expect(result1).toBe('freshData')
  expect(callCount).toBe(1)

  // Second call -> still in cache, not expired -> no new call.
  const result2 = await keshi.resolve('syncKey1', getValue, '1m')
  expect(result2).toBe('freshData')
  expect(callCount).toBe(1)
})

test('sync: expires after given time', async () => {
  let callCount = 0

  // Store with short expiration
  function getValue() {
    callCount++
    return 'tempData'
  }
  await keshi.resolve('syncKey2', getValue, 100) // 100ms

  // Immediately calling again -> same cached value, no new fetch
  await keshi.resolve('syncKey2', getValue, 100)
  expect(callCount).toBe(1)

  // Wait enough for it to expire
  await new Promise(resolve => setTimeout(resolve, 150))

  // Now it should fetch again
  const result3 = await keshi.resolve('syncKey2', getValue, 100)
  expect(result3).toBe('tempData')
  expect(callCount).toBe(2)
})

test('async: only fetch once if unexpired', async () => {
  let fetchCount = 0

  async function fetchData() {
    fetchCount++
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50))
    return 'asyncData'
  }

  // First call -> not in cache
  const p1 = keshi.resolve('asyncKey1', fetchData, '1m')
  // Second call -> should return same promise
  const p2 = keshi.resolve('asyncKey1', fetchData, '1m')

  expect(p1).toBe(p2) // They should be the same promise object

  const val1 = await p1
  const val2 = await p2

  expect(val1).toBe('asyncData')
  expect(val2).toBe('asyncData')
  expect(fetchCount).toBe(1) // only fetched once
})

test('async: fetch again if expired', async () => {
  let fetchCount = 0

  async function fetchData() {
    fetchCount++
    await new Promise(resolve => setTimeout(resolve, 10))
    return 'freshAsync'
  }

  // Cache for 50ms
  const p1 = keshi.resolve('asyncKey2', fetchData, 50)
  const val1 = await p1
  expect(val1).toBe('freshAsync')
  expect(fetchCount).toBe(1)

  // Wait < 50ms -> still valid
  await new Promise(resolve => setTimeout(resolve, 30))

  // Should return same promise (or at least not re-fetch)
  const p2 = keshi.resolve('asyncKey2', fetchData, 50)
  expect(fetchCount).toBe(1) // confirm no new fetch triggered
  const val2 = await p2
  expect(val2).toBe('freshAsync')

  // Wait another 30ms -> total 60ms from creation -> it should be expired now
  await new Promise(resolve => setTimeout(resolve, 30))

  // Next call -> new fetch
  const p3 = keshi.resolve('asyncKey2', fetchData, 50)
  expect(fetchCount).toBe(2)

  const val3 = await p3
  expect(val3).toBe('freshAsync')
})

test('delete: can delete exact or by prefix', async () => {
  let callCount = 0

  function getValue() {
    callCount++
    return 'someData'
  }

  // Put three keys into the cache
  await keshi.resolve('prefixKey1', getValue, '1m')
  await keshi.resolve('prefixKey2', getValue, '1m')
  await keshi.resolve('otherKey', getValue, '1m')
  expect(callCount).toBe(3)

  // Deleting with `matchStart = false` should only remove exactly 'prefixKey1'
  keshi.delete('prefixKey1', false)

  // If we try to resolve 'prefixKey1' again, it should re-fetch
  await keshi.resolve('prefixKey1', getValue, '1m')
  expect(callCount).toBe(4)

  // 'prefixKey2' should still be cached (no new fetch)
  await keshi.resolve('prefixKey2', getValue, '1m')
  expect(callCount).toBe(4)

  // 'otherKey' should still be cached
  await keshi.resolve('otherKey', getValue, '1m')
  expect(callCount).toBe(4)

  // Now delete with `matchStart = true` using the prefix 'prefix'
  keshi.delete('prefix', true)

  // Both 'prefixKey1' and 'prefixKey2' should be removed
  // Next resolves for them will re-fetch
  await keshi.resolve('prefixKey1', getValue, '1m')
  expect(callCount).toBe(5)

  await keshi.resolve('prefixKey2', getValue, '1m')
  expect(callCount).toBe(6)

  // 'otherKey' should remain intact
  await keshi.resolve('otherKey', getValue, '1m')
  expect(callCount).toBe(6)
})

test('works with plain values', async () => {
  const plainValue = await keshi.resolve('mynumber', () => 5, '1s')
  expect(plainValue).toBe(5)
})
