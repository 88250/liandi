export const getName = (path: string) => {
    const paths = path.split('/');
    if (path.endsWith('/')) {
        return paths[paths.length - 2];
    }
    return paths[paths.length - 1];
};


export const removeLastPath = (path: string) => {
    if (path.endsWith('/')) {
        path = path.substr(0, path.length - 1)
    }

    return path.substr(0,  path.lastIndexOf('/') + 1)
};
