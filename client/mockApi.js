export async function submitFile(image, left, top, width) {
    await timeout(1500);

    return {
        success: true,
        giftID: 'ABCD',
        owner: '1234'
    };
}

export async function getGift(id, owner) {
    if (id !== 'ABCD') return { success: false };

    return {
        success: true,
        videoURL: null,
        isOwner: owner === '1234',
        title: 'Happy Celebrations!'
    };
}

export async function checkForVideo(id) {
    return { success: false };
}

export async function updateTitle(id, owner, newName) {
    if (newName.length === 0 || newName.length > 24) {
        return {
            success: false
        };
    }

    await timeout(500);

    return {
        success: true
    };
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}