import {Action} from 'action-type'
import {Hoe} from 'hoe'
import {VNode} from 'snabbdom/vnode'

export interface Component<State, Params> {
  init: (p: Partial<State>) => State
  update: <T>(action: Action<T>, state: State) => State
  command: <T, R>(action: Action<T>, state: State) => Action<R>
  view: (e: Hoe, m: State, p: Params) => VNode
}
