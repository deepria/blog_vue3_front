import apiClient from "./api";
import {useDynamoStore} from "@/stores/dynamoStore.js";

export const getData = async (part, index) => {
    try {
        const response = await apiClient.get(`/item?part=${part}&index=${index}`);
        return response.data; // API 응답 데이터 반환
    } catch (error) {
        console.error("Error fetching get data:", error);
        throw error;
    }
};

export const postData = async (part, index, pk, value) => {
    try {
        const param = {
            part: part,
            index: index,
            pk: pk,
            value: value
        }
        const response = await apiClient.post('/item', param);
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

export const getList = async () => {
    try {
        const response = await apiClient.get('/list');
        console.log(response)
        return response.data; // API 응답 데이터 반환
    } catch (error) {
        console.error("Error fetching get list:", error);
        throw error;
    }
};

export const getById = async (id) => {
    try {
        const response = await apiClient.get(`/${id}`);
        console.log(response)
        return response.data; // API 응답 데이터 반환
    } catch (error) {
        console.error("Error fetching get list:", error);
        throw error;
    }
};

export const postEntity = async () => {
    try {
        const entity = useDynamoStore().getEntity;
        const response = await apiClient.post('', entity);
        useDynamoStore().clearEntity();
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};

export const deleteEntity = async (id, sortKey) => {
    try {
        const response = await apiClient.delete(`/${id}/${sortKey}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};



