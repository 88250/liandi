export const getName = (path: string) => {
    const paths = path.split('/');
    if (path.endsWith('/')) {
        return paths[paths.length - 2];
    }
    return paths[paths.length - 1];
};


export const removeLastPath = (path: string) => {
    if (path.endsWith('/')) {
        path = path.substr(0, path.length - 1);
    }

    return path.substr(0, path.lastIndexOf('/') + 1);
};

export const getPath = (path: string) => {
    if (path.endsWith('/')) {
        return path;
    }
    return path.substr(0, path.lastIndexOf('/') + 1);
};

export const urlJoin = (url1: string, url2: string) => {
    if (url1.endsWith('/')) {
        url1 = url1.substr(0, url1.length - 1);
    }

    if (url2.startsWith('/')) {
        url2 = url2.substring(1);
    }

    return `${url1}/${url2}`;
};
