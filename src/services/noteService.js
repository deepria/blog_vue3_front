import { getData, postData, deleteData } from "./dynamoService";

const PARTITION_KEY = "NOTE";
const INDEX_PARTITION = "NOTE_LIST";
const INDEX_ID = "INDEX";

// 노트 목록 가져오기 (Master List 사용)
export const fetchNotes = async () => {
    try {
        const response = await getData(INDEX_PARTITION, INDEX_ID);
        // DynamoDB might return the item wrapped or just the item.
        // Based on dynamoService, it returns response.data.
        const list = response?.data || response || [];
        return Array.isArray(list) ? list : [];
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return []; // List doesn't exist yet
        }
        console.error("Failed to fetch note list:", error);
        return [];
    }
};

// 노트 상세 가져오기
export const loadNote = async (id) => {
    try {
        const note = await getData(PARTITION_KEY, id);
        return note;
    } catch (error) {
        console.error("Failed to load note:", error);
        throw error;
    }
};

// 노트 저장하기 (생성/수정)
export const saveNote = async (note) => {
    try {
        const isNew = !note.id;
        if (isNew) {
            note.id = crypto.randomUUID();
            note.createdAt = new Date().toISOString();
        }
        note.updatedAt = new Date().toISOString();

        // 1. Save the full note content
        await postData(PARTITION_KEY, note.id, null, JSON.stringify(note));

        // 2. Update the Master Index
        const currentList = await fetchNotes();
        const summary = {
            id: note.id,
            title: note.title,
            updatedAt: note.updatedAt,
            // Don't store full content in the list to keep it light
        };

        let updatedList;
        if (isNew) {
            updatedList = [summary, ...currentList];
        } else {
            updatedList = currentList.map(item => item.id === note.id ? summary : item);
        }

        // Save Master Index
        await postData(INDEX_PARTITION, INDEX_ID, null, JSON.stringify({ data: updatedList }));

        return note.id;
    } catch (error) {
        console.error("Failed to save note:", error);
        throw error;
    }
};

// 노트 삭제하기
export const deleteNote = async (id) => {
    try {
        // 1. Delete the actual note
        await deleteData(PARTITION_KEY, id);

        // 2. Update Master Index
        const currentList = await fetchNotes();
        const updatedList = currentList.filter(item => item.id !== id);

        await postData(INDEX_PARTITION, INDEX_ID, null, JSON.stringify({ data: updatedList }));
    } catch (error) {
        console.error("Failed to delete note:", error);
        throw error;
    }
};
