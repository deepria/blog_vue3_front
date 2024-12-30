import { defineStore } from 'pinia';

export const dynamoStore = defineStore('object', {
    state: () => ({
        object: null,
    }),
    actions: {
        setObj(payload) {
            this.object = payload;
        },
        clearObj(){
            this.object = null;
        }
    },
    getters: {
        getObj: (state) => state.object,
    },
});