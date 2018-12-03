const axios = require('axios');

export async function submitFile(image) {
    try {
        const formData = new FormData();
        formData.append('image', image);
        const response = await axios.post(`${API_LOCATION}/submit`, formData);
        return Object.assign(response.data, { success: true });
    } catch (e) {
        console.log(e);
        return { success: false };
    }
}

export async function getGift(id, owner) {
    let ownerString = '';
    if (owner) ownerString = `?owner=${owner}`;

    try {
        const response = await axios.get(`${API_LOCATION}/gift/${id}${ownerString}`);
        return Object.assign(response.data, { success: true });
    } catch (e) {
        console.log(e);
        return { success: false };
    }
}

export async function updateTitle(id, owner, newName) {
    if (newName.length === 0 || newName.length > 24) {
        return { success: false };
    }

    try {
        await axios.post(`${API_LOCATION}/update-title`, { id, owner, newName });
        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false };
    }
}