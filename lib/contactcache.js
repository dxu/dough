// TODO: CURRENTLY NOT BEING USED
// one gob can hit multiple objects at the same time
// id: {
//   id: true
//   ...
// }
// ...
export default class ContactCache {
  constructor() {
    this.cache = {}

  }

  init(gobIds) {
    gobIds.map((id) => {
      this.cache[id] = {}
    })
  }

  get(id) {
    return this.cache[id]
  }

  // id1 touched id2
  set(id1, id2) {
    this.cache[id1][id2] = true
  }

  empty() {
    this.cache = {}
  }

}
