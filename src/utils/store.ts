import {reactive} from 'vue'
// import {Library, List} from "../../../server/src/shared/model";

export type Store = {
    // library: Library,
    // count: number,
    // selectedList?: List,
    // selectList(list: List): void,
    // increment(): void,
}

export const store = reactive<Store>({
    // count: 1,
    // library: new Library(),
    // selectList(list: List) {
    //     this.selectedList = list;
    // },
    // increment() {
    //     this.count++
    // }
})