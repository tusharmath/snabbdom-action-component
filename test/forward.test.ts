import * as assert from 'assert'
import {matchR, matchC} from 'update-function-types'
import {action} from 'action-type'
import * as R from 'ramda'
import {forward, Component} from '..'
import {Hoe} from 'hoe'

describe('forward', () => {
  /**
   * Child Component
   */
  type Child = {
    C: number
  }
  const child: Component<Child, {}, string> = {
    init: () => ({C: 3}),
    update: matchR({set: R.assoc('C')}),
    command: matchC({set: action('bananas')}),
    view: (e: Hoe, m: Child, p: {}) => {
      return 'CHILD'
    }
  }

  /**
   * Parent Component
   */
  type Parent = {
    A: number
    child: Child
  }
  const parent: Component<Parent, {}, string> = {
    init: (): Parent => ({A: 1, child: child.init()}),
    update: matchR<Parent>({get: R.prop('A')}),
    command: matchC<Parent>({get: action('bananas')}),
    view: (e: Hoe, m: Parent, p: {}) => {
      return 'PARENT' + child.view(e.of('child'), m.child, {})
    }
  }

  const component = forward({child})(parent)

  it('should forward update to child components', () => {
    const actual = component.update(
      action('child', action('set', 5)),
      component.init()
    )

    const expected = {
      A: 1,
      child: {C: 5},
      '@@forward': {spec: {child}}
    }
    assert.deepEqual(actual, expected)
  })

  it.only('should call the corresponding commands of the given component', () => {
    const actual = component.command(
      action('child', action('set', 5)),
      component.init()
    )
    console.log(
      '>>',
      matchC({set: action('bananas')})(action('set', 10), {C: 1000})
    )
    const expected = action('bananas', 5)
    assert.deepEqual(actual, expected)
  })

  it('should update @@forward', () => {
    const actual = component.init()
    const expected = {
      ...parent.init(),
      '@@forward': {
        keys: ['child']
      }
    }

    assert.deepEqual(actual, expected)
  })
})
