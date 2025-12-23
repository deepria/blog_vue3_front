import apiClient from "./api";

export const getData = async (part, index) => {
  try {
    const response = await apiClient.get(
      `/dynamodb/item?part=${part}&idx=${index}`,
    );
    return response.data;
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
