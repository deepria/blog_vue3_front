import apiClient from "./api";
import { useDynamoStore } from "@/stores/dynamoStore.js";

export const getData = async (part, index) => {
  try {
    const response = await apiClient.get(
      `/dynamodb/item?part=${part}&idx=${index}`,
    );
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
      idx: index,
      pk: pk,
      value: value,
    };
    const response = await apiClient.post("/dynamodb/item", param);
    return response.data;
  } catch (error) {
    console.error("Error fetching save data:", error);
    throw error;
  }
};

export const deleteData = async (part, index) => {
  try {
    const response = await apiClient.delete(
      `/dynamodb/item?part=${part}&idx=${index}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching delete data:", error);
    throw error;
  }
};

/*--------------------------------------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------------------*/

export const getList = async () => {
  try {
    const response = await apiClient.get("/dynamodb/list");
    return response.data; // API 응답 데이터 반환
  } catch (error) {
    console.error("Error fetching get list:", error);
    throw error;
  }
};

export const getById = async (id) => {
  try {
    const response = await apiClient.get(`/dynamodb/${id}`);
    return response.data; // API 응답 데이터 반환
  } catch (error) {
    console.error("Error fetching get list:", error);
    throw error;
  }
};

export const postEntity = async () => {
  try {
    const entity = useDynamoStore().getEntity;
    const response = await apiClient.post("/dynamodb", entity);
    useDynamoStore().clearEntity();
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const deleteEntity = async (id) => {
  try {
    const response = await apiClient.delete(`/dynamodb/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
