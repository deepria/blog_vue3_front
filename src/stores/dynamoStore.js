import {defineStore} from 'pinia';

export const useDynamoStore = defineStore('dynamoStore', {
    // 1. State 정의
    state: () => ({
        object: null,
        entity: {
            id: '',
            value: ''
        },
    }),

    // 2. Getters 정의
    getters: {
        // object 상태 가져오기
        getObj: (state) => state.object,

        // entity 상태 가져오기
        getEntity: (state) => state.entity,

        // entity 데이터 상태 중 특정 값만 반환하는 getter
        getEntityId: (state) => state.entity.id,
    },

    // 3. Actions 정의
    actions: {
        // Object 설정 및 초기화
        setObj(payload) {
            this.object = payload;
        },
        clearObj() {
            this.object = null;
        },

        // Entity 설정
        setEntity(payload) {
            // 필드별로 payload 값 설정, 없는 경우 기본값
            this.entity.id = payload.id || '';
            this.entity.value = payload.value || '';
        },

        // Entity 초기화
        clearEntity() {
            this.entity = {
                id: '',
                value: ''
            };
        },
    },
});